from .user import UserCreate, UserUpdate, UserProfile, UserStats
from .auth import Token, LoginRequest, RefreshTokenRequest
from .goal import GoalCreate, GoalUpdate, GoalResponse, GoalWithProgress
from .training_plan import (
    TrainingPlanCreate,
    TrainingPlanResponse,
    TrainingPlanWithWorkouts,
    GenerateTrainingPlanRequest,
)
from .workout import (
    WorkoutCreate,
    WorkoutUpdate,
    WorkoutComplete,
    WorkoutResponse,
)
from .route import RouteCreate, RouteResponse, GenerateRouteRequest

__all__ = [
    "UserCreate",
    "UserUpdate",
    "UserProfile",
    "UserStats",
    "Token",
    "LoginRequest",
    "RefreshTokenRequest",
    "GoalCreate",
    "GoalUpdate",
    "GoalResponse",
    "GoalWithProgress",
    "TrainingPlanCreate",
    "TrainingPlanResponse",
    "TrainingPlanWithWorkouts",
    "GenerateTrainingPlanRequest",
    "WorkoutCreate",
    "WorkoutUpdate",
    "WorkoutComplete",
    "WorkoutResponse",
    "RouteCreate",
    "RouteResponse",
    "GenerateRouteRequest",
]
