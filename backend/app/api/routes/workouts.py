from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from ...core.database import get_db
from ...api.deps import get_current_user
from ...models import User, Workout, TrainingPlan
from ...schemas import WorkoutResponse, WorkoutUpdate, WorkoutComplete

router = APIRouter()


@router.get("", response_model=List[WorkoutResponse])
def list_workouts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    upcoming: bool = False,
    completed: Optional[bool] = None,
):
    """List user's workouts"""

    query = db.query(Workout).join(TrainingPlan).filter(
        TrainingPlan.user_id == current_user.id
    )

    if upcoming:
        query = query.filter(
            Workout.scheduled_date >= datetime.utcnow(),
            Workout.is_completed == False
        ).order_by(Workout.scheduled_date)
    elif completed is not None:
        query = query.filter(Workout.is_completed == completed)

    workouts = query.offset(skip).limit(limit).all()

    return workouts


@router.get("/week", response_model=List[WorkoutResponse])
def get_week_workouts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    week_offset: int = 0,  # 0 = current week, 1 = next week, -1 = last week
):
    """Get workouts for a specific week"""

    # Calculate week boundaries
    today = datetime.utcnow()
    week_start = today - timedelta(days=today.weekday()) + timedelta(weeks=week_offset)
    week_end = week_start + timedelta(days=7)

    workouts = (
        db.query(Workout)
        .join(TrainingPlan)
        .filter(
            TrainingPlan.user_id == current_user.id,
            Workout.scheduled_date >= week_start,
            Workout.scheduled_date < week_end,
        )
        .order_by(Workout.scheduled_date)
        .all()
    )

    return workouts


@router.get("/{workout_id}", response_model=WorkoutResponse)
def get_workout(
    workout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific workout"""

    workout = (
        db.query(Workout)
        .join(TrainingPlan)
        .filter(
            Workout.id == workout_id,
            TrainingPlan.user_id == current_user.id
        )
        .first()
    )

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found",
        )

    return workout


@router.put("/{workout_id}", response_model=WorkoutResponse)
def update_workout(
    workout_id: int,
    workout_update: WorkoutUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a workout"""

    workout = (
        db.query(Workout)
        .join(TrainingPlan)
        .filter(
            Workout.id == workout_id,
            TrainingPlan.user_id == current_user.id
        )
        .first()
    )

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found",
        )

    update_data = workout_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(workout, field, value)

    db.commit()
    db.refresh(workout)

    return workout


@router.post("/{workout_id}/complete", response_model=WorkoutResponse)
def complete_workout(
    workout_id: int,
    completion_data: WorkoutComplete,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a workout as completed"""

    workout = (
        db.query(Workout)
        .join(TrainingPlan)
        .filter(
            Workout.id == workout_id,
            TrainingPlan.user_id == current_user.id
        )
        .first()
    )

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found",
        )

    if workout.is_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workout is already marked as completed",
        )

    # Update workout
    workout.is_completed = True
    workout.completed_at = datetime.utcnow()
    workout.actual_distance_km = completion_data.actual_distance_km
    workout.actual_duration_minutes = completion_data.actual_duration_minutes
    workout.perceived_effort = completion_data.perceived_effort

    if completion_data.notes:
        workout.notes = completion_data.notes

    db.commit()
    db.refresh(workout)

    return workout


@router.post("/{workout_id}/uncomplete", response_model=WorkoutResponse)
def uncomplete_workout(
    workout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a workout as not completed (undo completion)"""

    workout = (
        db.query(Workout)
        .join(TrainingPlan)
        .filter(
            Workout.id == workout_id,
            TrainingPlan.user_id == current_user.id
        )
        .first()
    )

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found",
        )

    workout.is_completed = False
    workout.completed_at = None

    db.commit()
    db.refresh(workout)

    return workout


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(
    workout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a workout"""

    workout = (
        db.query(Workout)
        .join(TrainingPlan)
        .filter(
            Workout.id == workout_id,
            TrainingPlan.user_id == current_user.id
        )
        .first()
    )

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found",
        )

    db.delete(workout)
    db.commit()

    return None
