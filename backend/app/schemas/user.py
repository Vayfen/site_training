from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from ..models.user import UserLevel


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    level: Optional[UserLevel] = None
    weekly_availability_hours: Optional[int] = None
    preferred_training_days: Optional[int] = None
    pr_5k: Optional[int] = None
    pr_10k: Optional[int] = None
    pr_half_marathon: Optional[int] = None
    pr_marathon: Optional[int] = None
    prefers_trail: Optional[str] = None
    max_distance_km: Optional[float] = None


class UserProfile(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    level: UserLevel
    weekly_availability_hours: int
    preferred_training_days: int
    pr_5k: Optional[int]
    pr_10k: Optional[int]
    pr_half_marathon: Optional[int]
    pr_marathon: Optional[int]
    prefers_trail: str
    max_distance_km: float
    created_at: datetime

    class Config:
        from_attributes = True


class UserStats(BaseModel):
    total_workouts: int
    completed_workouts: int
    total_distance_km: float
    total_duration_hours: float
    completion_rate: float
    current_week_workouts: int
    active_goals: int
