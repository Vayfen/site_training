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
            plan_data = self._parse_ai_response(ai_response)

        except Exception as e:
            print(f"Error calling Ollama: {e}")
            print("Falling back to basic plan generation")
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
        workouts = self._create_workouts_from_plan(
            db, training_plan, plan_data, start_date
        )

        for workout in workouts:
            db.add(workout)

        db.commit()
        db.refresh(training_plan)

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
        """Generate a basic fallback plan if AI fails"""
        workouts_per_week = min(user.preferred_training_days, 5)

        plan = {
            "description": f"Plan d'entraînement de base pour {goal.name}",
            "weeks": []
        }

        for week_num in range(1, min(weeks + 1, 13)):  # Max 12 weeks for fallback
            week = {
                "week_number": week_num,
                "focus": f"Semaine {week_num}",
                "workouts": []
            }

            # Basic pattern: easy, intervals, easy, long run, rest
            if workouts_per_week >= 3:
                # Easy run
                week["workouts"].append({
                    "day": 0,
                    "name": "Endurance facile",
                    "type": "easy_run",
                    "intensity": "easy",
                    "distance_km": 8.0 + (week_num * 0.5),
                    "duration_minutes": 45,
                    "description": "Course à allure conversationnelle",
                    "warmup": "10 minutes de course lente",
                    "main_set": "Course continue en endurance fondamentale",
                    "cooldown": "5 minutes de retour au calme",
                    "pace_min": 330,
                    "pace_max": 360
                })

            if workouts_per_week >= 4:
                # Interval training
                week["workouts"].append({
                    "day": 2,
                    "name": "Fractionné",
                    "type": "intervals",
                    "intensity": "hard",
                    "distance_km": 10.0,
                    "duration_minutes": 60,
                    "description": "Séance de vitesse",
                    "warmup": "15 minutes d'échauffement progressif",
                    "main_set": "6x1000m à allure soutenue avec 2min de récupération",
                    "cooldown": "10 minutes de retour au calme",
                    "pace_min": 270,
                    "pace_max": 300
                })

            if workouts_per_week >= 2:
                # Long run
                week["workouts"].append({
                    "day": 5,
                    "name": "Sortie longue",
                    "type": "long_run",
                    "intensity": "moderate",
                    "distance_km": 12.0 + (week_num * 1.0),
                    "duration_minutes": 90,
                    "description": "Sortie longue en endurance",
                    "warmup": "Démarrage progressif sur 10 minutes",
                    "main_set": "Course longue à allure confortable",
                    "cooldown": "5 minutes de marche",
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
                raise ValueError("No JSON found in response")

            json_str = response[start:end]
            parsed = json.loads(json_str)

            # Validate structure
            if "weeks" not in parsed or not parsed["weeks"]:
                raise ValueError("Invalid plan structure")

            return parsed

        except Exception as e:
            print(f"Error parsing AI response: {e}")
            print(f"Response: {response[:500]}...")
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
