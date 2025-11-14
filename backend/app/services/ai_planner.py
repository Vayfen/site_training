import ollama
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..core.config import settings
from ..models import User, Goal, TrainingPlan, Workout
from ..models.workout import WorkoutType, WorkoutIntensity
import json


class AITrainingPlanner:
    """Service to generate personalized training plans using Local LLM (Ollama)"""

    def __init__(self):
        self.model = settings.OLLAMA_MODEL
        self.base_url = settings.OLLAMA_BASE_URL

    def generate_training_plan(
        self,
        db: Session,
        user: User,
        goal: Goal,
        start_date: datetime,
        additional_notes: str = None,
    ) -> TrainingPlan:
        """Generate a complete training plan for a goal using Local AI"""

        # Calculate duration based on goal and current date
        days_until_race = (goal.target_date - start_date).days
        weeks_available = max(4, days_until_race // 7)

        # Build context for AI
        prompt = self._build_planning_prompt(user, goal, weeks_available, additional_notes)

        try:
            # Call Ollama API
            print(f"[AI Planner] Calling Ollama with model: {self.model}")
            response = ollama.chat(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                options={
                    "temperature": 0.7,
                    "num_predict": 4000,
                }
            )

            # Parse AI response
            ai_response = response['message']['content']
            print(f"[AI Planner] Received response from Ollama ({len(ai_response)} chars)")
            plan_data = self._parse_ai_response(ai_response)

            # Verify we got valid weeks data
            if not plan_data.get("weeks") or len(plan_data.get("weeks", [])) == 0:
                print("[AI Planner] AI response had no weeks data, using fallback plan")
                plan_data = self._generate_fallback_plan(user, goal, weeks_available)
            else:
                print(f"[AI Planner] Successfully parsed {len(plan_data['weeks'])} weeks from AI")

        except Exception as e:
            print(f"[AI Planner] Error calling Ollama: {e}")
            print("[AI Planner] Falling back to basic plan generation")
            plan_data = self._generate_fallback_plan(user, goal, weeks_available)

        # Create training plan
        training_plan = TrainingPlan(
            user_id=user.id,
            goal_id=goal.id,
            name=f"Plan d'entraînement - {goal.name}",
            description=plan_data.get("description", "Plan d'entraînement personnalisé"),
            duration_weeks=weeks_available,
            start_date=start_date,
            end_date=goal.target_date,
            generated_by_ai=True,
            ai_prompt_used=prompt,
        )

        db.add(training_plan)
        db.flush()

        # Create workouts from AI plan
        print(f"[AI Planner] Creating workouts from plan data...")
        workouts = self._create_workouts_from_plan(
            db, training_plan, plan_data, start_date
        )

        print(f"[AI Planner] Generated {len(workouts)} workouts")
        for workout in workouts:
            db.add(workout)

        db.commit()
        db.refresh(training_plan)
        print(f"[AI Planner] Training plan created with {len(training_plan.workouts)} workouts")

        return training_plan

    def _build_planning_prompt(
        self, user: User, goal: Goal, weeks: int, additional_notes: str = None
    ) -> str:
        """Build the prompt for Local LLM"""

        # Convert PR times to readable format
        prs = []
        if user.pr_5k:
            prs.append(f"5km: {self._seconds_to_time(user.pr_5k)}")
        if user.pr_10k:
            prs.append(f"10km: {self._seconds_to_time(user.pr_10k)}")
        if user.pr_half_marathon:
            prs.append(f"Semi-marathon: {self._seconds_to_time(user.pr_half_marathon)}")
        if user.pr_marathon:
            prs.append(f"Marathon: {self._seconds_to_time(user.pr_marathon)}")

        pr_text = ", ".join(prs) if prs else "Aucun record personnel renseigné"

        target_time = ""
        if goal.target_time_seconds:
            target_time = f"Objectif de temps: {self._seconds_to_time(goal.target_time_seconds)}"

        prompt = f"""Tu es un expert en entraînement de course à pied. Génère un plan d'entraînement personnalisé et détaillé.

PROFIL DU COUREUR:
- Niveau: {user.level.value}
- Records personnels: {pr_text}
- Disponibilité: {user.weekly_availability_hours}h par semaine, {user.preferred_training_days} séances par semaine
- Préférence terrain: {user.prefers_trail}

OBJECTIF:
- Course: {goal.name}
- Type: {goal.race_type.value}
- Distance: {goal.distance_km}km
- Dénivelé: {goal.elevation_gain_m}m
- Date: {goal.target_date.strftime('%d/%m/%Y')}
- {target_time}

CONTRAINTES:
- Durée du plan: {weeks} semaines
- Adapter au niveau et à la disponibilité
- Progressivité pour éviter les blessures
- Variété des séances

{f'NOTES SUPPLÉMENTAIRES: {additional_notes}' if additional_notes else ''}

GÉNÈRE un plan JSON avec cette structure:
{{
  "description": "Description générale du plan en 2-3 phrases",
  "weeks": [
    {{
      "week_number": 1,
      "focus": "Description du focus de la semaine",
      "workouts": [
        {{
          "day": 1,
          "name": "Nom de la séance",
          "type": "easy_run",
          "intensity": "easy",
          "distance_km": 10.0,
          "duration_minutes": 60,
          "description": "Description complète de la séance",
          "warmup": "Description de l'échauffement (10-15min)",
          "main_set": "Description détaillée du corps de séance avec allures précises",
          "cooldown": "Description du retour au calme (10min)",
          "pace_min": 300,
          "pace_max": 330
        }}
      ]
    }}
  ]
}}

Types de séances possibles: easy_run, long_run, tempo, intervals, hill_repeats, fartlek, recovery, race_pace, progression, rest
Intensités possibles: very_easy, easy, moderate, hard, very_hard

IMPORTANT:
- Réponds UNIQUEMENT avec le JSON, sans autre texte
- Utilise des allures adaptées au niveau et aux objectifs
- Décris précisément chaque intervalle
- Inclus des séances variées
- Prévois des jours de repos
- Augmente progressivement la charge"""

        return prompt

    def _generate_fallback_plan(self, user: User, goal: Goal, weeks: int) -> Dict[str, Any]:
        """Generate an intelligent, varied fallback plan if AI fails"""
        workouts_per_week = min(user.preferred_training_days, 6)
        is_trail = goal.race_type.value in ['trail_short', 'trail_medium', 'trail_long', 'ultra_trail']

        # Define training phases
        total_weeks = min(weeks, 16)
        base_phase = int(total_weeks * 0.5)  # 50% base building
        build_phase = int(total_weeks * 0.35)  # 35% specific training
        taper_phase = total_weeks - base_phase - build_phase  # 15% taper

        plan = {
            "description": f"Plan d'entraînement progressif pour {goal.name} - {total_weeks} semaines avec variété et progression",
            "weeks": []
        }

        # Workout templates with variety
        interval_workouts = [
            ("Pyramide", "intervals", "2km échauffement + 400-800-1200-800-400m (récup 90s) + 1km retour calme"),
            ("Fractionnés courts", "intervals", "2km échauffement + 12x400m allure 5K (récup 1min) + 1km retour calme"),
            ("Fractionnés moyens", "intervals", "2km échauffement + 6x1000m allure 10K (récup 2min) + 1km retour calme"),
            ("Fractionnés longs", "intervals", "2km échauffement + 4x2000m allure semi (récup 3min) + 1km retour calme"),
            ("30-30", "intervals", "2km échauffement + 3 séries de 10x(30s rapide/30s lent) récup 3min + 1km retour"),
        ]

        tempo_workouts = [
            ("Tempo run", "tempo", "2km échauffement + 20min allure seuil (85-90% FCM) + 1km retour calme"),
            ("Tempo progressif", "tempo", "2km échauffement + 3x10min (tempo → allure course) récup 2min + 1km retour"),
            ("Cruise intervals", "tempo", "2km échauffement + 3x2km allure seuil récup 90s + 1km retour calme"),
            ("Tempo long", "tempo", "2km échauffement + 30min allure marathon + 1km retour calme"),
        ]

        fartlek_workouts = [
            ("Fartlek suédois", "fartlek", "Échauffement 15min + 30min variations (1-5min rapide/lent au feeling) + 10min cool"),
            ("Fartlek structuré", "fartlek", "Échauffement 15min + 6x(3min tempo/2min facile) + 10min retour calme"),
            ("Fartlek pyramide", "fartlek", "Échauffement 15min + 1-2-3-4-3-2-1min rapide (récup = durée effort) + 10min retour"),
        ]

        hill_workouts = [
            ("Côtes courtes", "hill_repeats", "2km échauffement + 10x(45s côte forte/descente récup) + 1km retour calme"),
            ("Côtes moyennes", "hill_repeats", "2km échauffement + 6x(2min côte progressive/descente lente) + 1km retour"),
            ("Côtes longues", "hill_repeats", "2km échauffement + 4x(4min côte régulière/descente récup) + 1km retour calme"),
        ]

        progression_workouts = [
            ("Progression run", "progression", "10km en accélérant progressivement du rythme facile au tempo"),
            ("Finish strong", "progression", "12km : 8km facile + 4km à allure objectif"),
            ("Negative split", "progression", "14km : 1ère moitié facile, 2nde moitié 20s/km plus rapide"),
        ]

        for week_num in range(1, total_weeks + 1):
            # Determine phase
            if week_num <= base_phase:
                phase = "Base - Développement aérobie"
                intensity_factor = 0.7
            elif week_num <= base_phase + build_phase:
                phase = "Spécifique - Travail à allure cible"
                intensity_factor = 1.0
            else:
                phase = "Affûtage - Réduction volume"
                intensity_factor = 0.6

            week = {
                "week_number": week_num,
                "focus": f"{phase}",
                "workouts": []
            }

            # Calculate progressive distances
            base_easy = 8 + (week_num * 0.3) if week_num <= base_phase + build_phase else 6
            base_long = 14 + (week_num * 0.8) if week_num <= base_phase + build_phase else 12

            workout_day = 0

            # Pattern: Easy - Quality - Easy - Quality - Easy - Long
            if workouts_per_week >= 1:
                # Day 1: Easy run
                week["workouts"].append({
                    "day": workout_day,
                    "name": "Endurance fondamentale",
                    "type": "easy_run",
                    "intensity": "easy",
                    "distance_km": round(base_easy, 1),
                    "duration_minutes": int(base_easy * 6.5),
                    "description": "Course facile en zone 2 pour développer l'endurance",
                    "warmup": "Démarrage progressif sur 1km",
                    "main_set": "Course continue à allure conversationnelle (70-75% FCM)",
                    "cooldown": "5min de marche + étirements",
                    "pace_min": 330,
                    "pace_max": 360
                })
                workout_day += 1

            if workouts_per_week >= 2:
                # Day 2: Quality workout (varies by week)
                workout_type_index = (week_num - 1) % 3

                if week_num <= base_phase:
                    # Base phase: Fartlek and easy tempo
                    if workout_type_index == 0:
                        name, wtype, description = fartlek_workouts[week_num % len(fartlek_workouts)]
                        intensity = "moderate"
                        pace_min, pace_max = 300, 330
                    else:
                        name, wtype, description = tempo_workouts[0]
                        intensity = "hard"
                        pace_min, pace_max = 280, 310
                else:
                    # Build phase: More intervals
                    name, wtype, description = interval_workouts[week_num % len(interval_workouts)]
                    intensity = "very_hard"
                    pace_min, pace_max = 260, 290

                week["workouts"].append({
                    "day": workout_day,
                    "name": name,
                    "type": wtype,
                    "intensity": intensity,
                    "distance_km": 12.0,
                    "duration_minutes": 60,
                    "description": f"Séance qualité - {name}",
                    "warmup": "15min de course facile + 3 accélérations progressives de 80m",
                    "main_set": description,
                    "cooldown": "10min de course lente + étirements dynamiques",
                    "pace_min": pace_min,
                    "pace_max": pace_max
                })
                workout_day += 1

            if workouts_per_week >= 3:
                # Day 3: Recovery or easy
                week["workouts"].append({
                    "day": workout_day,
                    "name": "Récupération active",
                    "type": "recovery",
                    "intensity": "very_easy",
                    "distance_km": 6.0,
                    "duration_minutes": 40,
                    "description": "Course de récupération très facile",
                    "warmup": "Démarrage très progressif",
                    "main_set": "Course très lente, privilégier la sensation de jambes légères",
                    "cooldown": "Marche + étirements légers",
                    "pace_min": 360,
                    "pace_max": 420
                })
                workout_day += 1

            if workouts_per_week >= 4:
                # Day 4: Hills or tempo (alternate)
                if is_trail or week_num % 2 == 0:
                    name, wtype, description = hill_workouts[week_num % len(hill_workouts)]
                    week["workouts"].append({
                        "day": workout_day,
                        "name": name,
                        "type": wtype,
                        "intensity": "hard",
                        "distance_km": 10.0,
                        "duration_minutes": 55,
                        "description": f"Renforcement musculaire en côtes - {name}",
                        "warmup": "2km échauffement sur plat",
                        "main_set": description,
                        "cooldown": "1km de course lente sur plat + étirements",
                        "pace_min": 280,
                        "pace_max": 320
                    })
                else:
                    name, wtype, description = tempo_workouts[(week_num // 2) % len(tempo_workouts)]
                    week["workouts"].append({
                        "day": workout_day,
                        "name": name,
                        "type": wtype,
                        "intensity": "hard",
                        "distance_km": 11.0,
                        "duration_minutes": 60,
                        "description": f"Séance au seuil - {name}",
                        "warmup": "2km progressif",
                        "main_set": description,
                        "cooldown": "1km retour au calme",
                        "pace_min": 290,
                        "pace_max": 310
                    })
                workout_day += 1

            if workouts_per_week >= 5:
                # Day 5: Easy run
                week["workouts"].append({
                    "day": workout_day,
                    "name": "Endurance active",
                    "type": "easy_run",
                    "intensity": "easy",
                    "distance_km": round(base_easy * 0.8, 1),
                    "duration_minutes": int(base_easy * 5),
                    "description": "Course facile entre deux séances qualité",
                    "warmup": "Démarrage progressif",
                    "main_set": "Endurance à allure confortable, écouter ses sensations",
                    "cooldown": "5min cool down",
                    "pace_min": 330,
                    "pace_max": 360
                })
                workout_day += 1

            if workouts_per_week >= 2:
                # Day 6: Long run (varies each week)
                if week_num % 4 == 0:
                    # Every 4 weeks: progression long run
                    name, wtype, description = progression_workouts[week_num % len(progression_workouts)]
                    intensity = "moderate"
                else:
                    name = "Sortie longue"
                    wtype = "long_run"
                    description = "Sortie longue pour développer l'endurance fondamentale"
                    intensity = "easy"

                long_distance = round(min(base_long * intensity_factor, goal.distance_km * 1.2), 1)

                week["workouts"].append({
                    "day": workout_day,
                    "name": name,
                    "type": wtype,
                    "intensity": intensity,
                    "distance_km": long_distance,
                    "duration_minutes": int(long_distance * 7),
                    "description": f"Sortie longue - {description}",
                    "warmup": "15min de mise en route progressive",
                    "main_set": description if wtype == "progression" else f"Course continue de {long_distance}km à allure confortable",
                    "cooldown": "10min de marche + hydratation + étirements",
                    "pace_min": 330,
                    "pace_max": 360
                })

            plan["weeks"].append(week)

        return plan

    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """Parse the JSON response from Local LLM"""
        try:
            # Extract JSON from response (in case there's extra text)
            start = response.find("{")
            end = response.rfind("}") + 1

            if start == -1 or end == 0:
                print(f"[AI Planner] No JSON found in response")
                print(f"[AI Planner] Response preview: {response[:500]}...")
                raise ValueError("No JSON found in response")

            json_str = response[start:end]
            parsed = json.loads(json_str)

            # Validate structure
            if "weeks" not in parsed or not parsed["weeks"]:
                print(f"[AI Planner] Invalid plan structure - missing weeks data")
                print(f"[AI Planner] Parsed keys: {list(parsed.keys())}")
                raise ValueError("Invalid plan structure")

            print(f"[AI Planner] Successfully parsed plan with {len(parsed['weeks'])} weeks")
            return parsed

        except Exception as e:
            print(f"[AI Planner] Error parsing AI response: {e}")
            print(f"[AI Planner] Response preview: {response[:500]}...")
            return {"description": "Plan d'entraînement personnalisé", "weeks": []}

    def _create_workouts_from_plan(
        self, db: Session, training_plan: TrainingPlan, plan_data: Dict, start_date: datetime
    ) -> List[Workout]:
        """Create workout objects from the AI plan data"""
        workouts = []

        for week_data in plan_data.get("weeks", []):
            week_number = week_data.get("week_number", 1)

            for workout_data in week_data.get("workouts", []):
                # Calculate scheduled date
                days_offset = (week_number - 1) * 7 + workout_data.get("day", 0)
                scheduled_date = start_date + timedelta(days=days_offset)

                # Map string type to enum
                workout_type_str = workout_data.get("type", "easy_run")
                try:
                    workout_type = WorkoutType[workout_type_str.upper()]
                except KeyError:
                    workout_type = WorkoutType.EASY_RUN

                # Map intensity
                intensity_str = workout_data.get("intensity", "easy")
                try:
                    intensity = WorkoutIntensity[intensity_str.upper()]
                except KeyError:
                    intensity = WorkoutIntensity.EASY

                workout = Workout(
                    training_plan_id=training_plan.id,
                    name=workout_data.get("name", "Séance"),
                    workout_type=workout_type,
                    scheduled_date=scheduled_date,
                    week_number=week_number,
                    day_of_week=workout_data.get("day", 0),
                    description=workout_data.get("description", ""),
                    distance_km=workout_data.get("distance_km"),
                    duration_minutes=workout_data.get("duration_minutes"),
                    intensity=intensity,
                    warmup_description=workout_data.get("warmup"),
                    main_set_description=workout_data.get("main_set", "Corps de séance"),
                    cooldown_description=workout_data.get("cooldown"),
                    target_pace_min=workout_data.get("pace_min"),
                    target_pace_max=workout_data.get("pace_max"),
                )

                workouts.append(workout)

        return workouts

    @staticmethod
    def _seconds_to_time(seconds: int) -> str:
        """Convert seconds to HH:MM:SS format"""
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        if hours > 0:
            return f"{hours}h{minutes:02d}:{secs:02d}"
        return f"{minutes}:{secs:02d}"
