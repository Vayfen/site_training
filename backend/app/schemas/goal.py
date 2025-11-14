from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from ..models.goal import RaceType, GoalPriority


class GoalBase(BaseModel):
    name: str
    race_type: RaceType
    target_date: datetime
    target_time_seconds: Optional[int] = None
    race_name: Optional[str] = None
    race_location: Optional[str] = None
    distance_km: float
    elevation_gain_m: int = 0
    priority: GoalPriority = GoalPriority.MEDIUM


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_date: Optional[datetime] = None
    target_time_seconds: Optional[int] = None
    race_name: Optional[str] = None
    race_location: Optional[str] = None
    priority: Optional[GoalPriority] = None
    is_active: Optional[bool] = None
    is_completed: Optional[bool] = None


class GoalResponse(GoalBase):
    id: int
    user_id: int
    is_active: bool
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GoalWithProgress(GoalResponse):
    days_until_race: int
    weeks_until_race: int
    has_training_plan: bool
    training_completion_rate: Optional[float] = None
