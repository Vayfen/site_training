from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any


class RouteBase(BaseModel):
    name: str
    description: Optional[str] = None
    route_type: str  # trail, road, mixed
    surface_type: Optional[str] = None


class RouteCreate(RouteBase):
    distance_km: float
    elevation_gain_m: int = 0
    elevation_loss_m: int = 0
    start_location: Optional[str] = None
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None
    route_data: Optional[Dict[str, Any]] = None


class GenerateRouteRequest(BaseModel):
    distance_km: float
    route_type: str = "road"  # trail, road, mixed
    start_location: Optional[str] = None
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None
    elevation_preference: Optional[str] = "moderate"  # flat, moderate, hilly
    loop: bool = True  # out-and-back or loop


class RouteResponse(RouteBase):
    id: int
    user_id: int
    distance_km: float
    elevation_gain_m: int
    elevation_loss_m: int
    start_location: Optional[str]
    start_lat: Optional[float]
    start_lng: Optional[float]
    route_data: Optional[Dict[str, Any]]
    generated_by_ai: bool
    difficulty_rating: int
    scenic_rating: Optional[int]
    times_used: int
    is_favorite: bool
    created_at: datetime

    class Config:
        from_attributes = True
