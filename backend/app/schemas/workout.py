from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from ..models.workout import WorkoutType, WorkoutIntensity


class WorkoutBase(BaseModel):
    name: str
    workout_type: WorkoutType
    scheduled_date: datetime
    description: str
    distance_km: Optional[float] = None
    duration_minutes: Optional[int] = None
    intensity: WorkoutIntensity


class WorkoutCreate(WorkoutBase):
    training_plan_id: int
    week_number: int
    day_of_week: int
    warmup_description: Optional[str] = None
    main_set_description: str
    cooldown_description: Optional[str] = None
    target_pace_min: Optional[int] = None
    target_pace_max: Optional[int] = None


class WorkoutUpdate(BaseModel):
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None


class WorkoutComplete(BaseModel):
    actual_distance_km: Optional[float] = None
    actual_duration_minutes: Optional[int] = None
    perceived_effort: Optional[int] = None
    notes: Optional[str] = None


class WorkoutResponse(WorkoutBase):
    id: int
    training_plan_id: int
    week_number: int
    day_of_week: int
    warmup_description: Optional[str]
    main_set_description: str
    cooldown_description: Optional[str]
    target_pace_min: Optional[int]
    target_pace_max: Optional[int]
    is_completed: bool
    completed_at: Optional[datetime]
    actual_distance_km: Optional[float]
    actual_duration_minutes: Optional[int]
    perceived_effort: Optional[int]
    notes: Optional[str]
    suggested_route_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
