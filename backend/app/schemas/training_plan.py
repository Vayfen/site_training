from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class TrainingPlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration_weeks: int
    start_date: datetime


class TrainingPlanCreate(BaseModel):
    goal_id: int
    start_date: Optional[datetime] = None


class GenerateTrainingPlanRequest(BaseModel):
    goal_id: int
    start_date: Optional[datetime] = None
    additional_notes: Optional[str] = None


class TrainingPlanResponse(TrainingPlanBase):
    id: int
    user_id: int
    goal_id: int
    end_date: datetime
    generated_by_ai: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TrainingPlanWithWorkouts(TrainingPlanResponse):
    workouts: List["WorkoutResponse"]
    total_workouts: int
    completed_workouts: int
    completion_rate: float


from .workout import WorkoutResponse

TrainingPlanWithWorkouts.model_rebuild()
