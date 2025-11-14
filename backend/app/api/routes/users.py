from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from ...core.database import get_db
from ...api.deps import get_current_user
from ...models import User, Workout, Goal
from ...schemas import UserProfile, UserUpdate, UserStats

router = APIRouter()


@router.get("/me", response_model=UserProfile)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


@router.put("/me", response_model=UserProfile)
def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user profile"""

    update_data = user_update.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return current_user


@router.get("/me/stats", response_model=UserStats)
def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user statistics"""

    # Total workouts
    total_workouts = db.query(func.count(Workout.id)).join(
        Workout.training_plan
    ).filter(
        Workout.training_plan.has(user_id=current_user.id)
    ).scalar()

    # Completed workouts
    completed_workouts = db.query(func.count(Workout.id)).join(
        Workout.training_plan
    ).filter(
        Workout.training_plan.has(user_id=current_user.id),
        Workout.is_completed == True
    ).scalar()

    # Total distance
    total_distance = db.query(func.sum(Workout.actual_distance_km)).join(
        Workout.training_plan
    ).filter(
        Workout.training_plan.has(user_id=current_user.id),
        Workout.is_completed == True,
        Workout.actual_distance_km != None
    ).scalar() or 0.0

    # Total duration
    total_duration_minutes = db.query(func.sum(Workout.actual_duration_minutes)).join(
        Workout.training_plan
    ).filter(
        Workout.training_plan.has(user_id=current_user.id),
        Workout.is_completed == True,
        Workout.actual_duration_minutes != None
    ).scalar() or 0

    # Current week workouts
    week_start = datetime.utcnow() - timedelta(days=datetime.utcnow().weekday())
    current_week_workouts = db.query(func.count(Workout.id)).join(
        Workout.training_plan
    ).filter(
        Workout.training_plan.has(user_id=current_user.id),
        Workout.is_completed == True,
        Workout.completed_at >= week_start
    ).scalar()

    # Active goals
    active_goals = db.query(func.count(Goal.id)).filter(
        Goal.user_id == current_user.id,
        Goal.is_active == True,
        Goal.is_completed == False
    ).scalar()

    # Completion rate
    completion_rate = (completed_workouts / total_workouts * 100) if total_workouts > 0 else 0.0

    return UserStats(
        total_workouts=total_workouts or 0,
        completed_workouts=completed_workouts or 0,
        total_distance_km=round(total_distance, 2),
        total_duration_hours=round(total_duration_minutes / 60, 2),
        completion_rate=round(completion_rate, 1),
        current_week_workouts=current_week_workouts or 0,
        active_goals=active_goals or 0,
    )
