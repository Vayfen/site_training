import ollama
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..core.config import settings
from ..models import User, Route
import json
import random
import math


class RouteFinderService:
    """Service to generate and find running routes using Local LLM"""

    def __init__(self):
        self.model = settings.OLLAMA_MODEL
        self.base_url = settings.OLLAMA_BASE_URL

    def generate_route(
        self,
        db: Session,
        user: User,
        distance_km: float,
        route_type: str = "road",
        start_location: Optional[str] = None,
        start_lat: Optional[float] = None,
        start_lng: Optional[float] = None,
        elevation_preference: str = "moderate",
        loop: bool = True,
    ) -> Route:
        """Generate a running route using AI and geographic data"""

        # Build prompt for AI
        prompt = self._build_route_prompt(
            user, distance_km, route_type, start_location, elevation_preference, loop
        )

        # Call Local LLM (Ollama)
        try:
            response = ollama.chat(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                options={
                    "temperature": 0.8,
                    "num_predict": 1000,
                }
            )

            # Parse AI response
            ai_response = response['message']['content']
            route_data = self._parse_route_response(ai_response)

        except Exception as e:
            print(f"Error calling Ollama: {e}")
            route_data = {}

        # Generate synthetic route coordinates if not provided
        if not route_data.get("coordinates"):
            route_data["coordinates"] = self._generate_synthetic_route(
                distance_km, start_lat, start_lng, loop
            )

        # Create route object
        route = Route(
            user_id=user.id,
            name=route_data.get("name", f"Parcours {route_type} {distance_km}km"),
            description=route_data.get("description", ""),
            distance_km=distance_km,
            elevation_gain_m=route_data.get("elevation_gain", self._estimate_elevation(distance_km, elevation_preference)),
            elevation_loss_m=route_data.get("elevation_loss", self._estimate_elevation(distance_km, elevation_preference)),
            route_type=route_type,
            surface_type=route_data.get("surface_type", "mixed"),
            start_location=start_location,
            start_lat=start_lat or 48.8566,  # Default Paris
            start_lng=start_lng or 2.3522,
            route_data=route_data.get("coordinates"),
            generated_by_ai=True,
            difficulty_rating=route_data.get("difficulty", 3),
            scenic_rating=route_data.get("scenic_rating"),
        )

        db.add(route)
        db.commit()
        db.refresh(route)

        return route

    def _build_route_prompt(
        self,
        user: User,
        distance_km: float,
        route_type: str,
        start_location: Optional[str],
        elevation_preference: str,
        loop: bool,
    ) -> str:
        """Build prompt for route generation"""

        location_text = start_location if start_location else "une zone urbaine/périurbaine typique"

        prompt = f"""Tu es un expert en création d'itinéraires de course à pied. Génère une description détaillée d'un parcours.

CARACTÉRISTIQUES DEMANDÉES:
- Distance: {distance_km}km
- Type: {route_type} (trail/route/mixed)
- Lieu de départ: {location_text}
- Profil: {elevation_preference} (flat/moderate/hilly)
- Format: {'Boucle' if loop else 'Aller-retour'}
- Niveau coureur: {user.level.value}

GÉNÈRE un JSON avec cette structure:
{{
  "name": "Nom évocateur du parcours",
  "description": "Description détaillée du parcours: points de passage, ambiance, points d'intérêt, type de terrain",
  "surface_type": "asphalt|gravel|dirt|mixed",
  "elevation_gain": 100,  // mètres de dénivelé positif
  "elevation_loss": 100,   // mètres de dénivelé négatif
  "difficulty": 3,  // 1-5
  "scenic_rating": 4,  // 1-5
  "key_points": [
    "Point de passage 1",
    "Point de passage 2"
  ],
  "safety_notes": "Conseils de sécurité si nécessaire",
  "best_time": "Meilleur moment de la journée pour courir ce parcours"
}}

Sois créatif et réaliste. Décris un vrai parcours avec des détails précis.
Réponds UNIQUEMENT avec le JSON."""

        return prompt

    def _parse_route_response(self, response: str) -> Dict[str, Any]:
        """Parse the JSON response from Claude"""
        try:
            start = response.find("{")
            end = response.rfind("}") + 1
            json_str = response[start:end]
            return json.loads(json_str)
        except Exception as e:
            print(f"Error parsing route response: {e}")
            return {
                "name": "Parcours généré",
                "description": "Parcours de course à pied",
                "surface_type": "mixed",
                "difficulty": 3,
            }

    def _generate_synthetic_route(
        self,
        distance_km: float,
        start_lat: Optional[float],
        start_lng: Optional[float],
        loop: bool,
    ) -> Dict[str, Any]:
        """Generate synthetic GPS coordinates for the route"""

        # Use default location if not provided
        lat = start_lat or 48.8566
        lng = start_lng or 2.3522

        # Generate points roughly every 100m
        num_points = int(distance_km * 10)
        coordinates = []

        # Rough conversion: 1 degree ≈ 111km
        km_per_degree = 111.0

        current_lat = lat
        current_lng = lng

        for i in range(num_points):
            coordinates.append({"lat": current_lat, "lng": current_lng})

            # Random walk with slight preference for loops
            if loop and i > num_points / 2:
                # Start heading back toward origin
                angle = math.atan2(lat - current_lat, lng - current_lng)
                angle += random.uniform(-0.3, 0.3)
            else:
                angle = random.uniform(0, 2 * math.pi)

            # Move roughly 100m in that direction
            step_km = 0.1
            delta_lat = (step_km * math.sin(angle)) / km_per_degree
            delta_lng = (step_km * math.cos(angle)) / (km_per_degree * math.cos(math.radians(current_lat)))

            current_lat += delta_lat
            current_lng += delta_lng

        return {
            "type": "LineString",
            "coordinates": [[coord["lng"], coord["lat"]] for coord in coordinates],
        }

    @staticmethod
    def _estimate_elevation(distance_km: float, preference: str) -> int:
        """Estimate elevation gain based on distance and preference"""
        base_elevation = {
            "flat": 10,
            "moderate": 30,
            "hilly": 60,
        }

        meters_per_km = base_elevation.get(preference, 30)
        return int(distance_km * meters_per_km)
