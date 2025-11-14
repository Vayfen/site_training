from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ...core.database import get_db
from ...api.deps import get_current_user
from ...models import User, TrainingPlan, Goal
from ...schemas import (
    TrainingPlanResponse,
    TrainingPlanWithWorkouts,
    GenerateTrainingPlanRequest,
)
from ...services import AITrainingPlanner

router = APIRouter()


@router.get("", response_model=List[TrainingPlanResponse])
def list_training_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """List user's training plans"""

    plans = (
        db.query(TrainingPlan)
        .filter(TrainingPlan.user_id == current_user.id)
        .order_by(TrainingPlan.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return plans


@router.post("/generate", response_model=TrainingPlanResponse, status_code=status.HTTP_201_CREATED)
def generate_training_plan(
    request: GenerateTrainingPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a training plan using AI"""

    # Verify goal exists and belongs to user
    goal = db.query(Goal).filter(
        Goal.id == request.goal_id,
        Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    # Check if goal already has a plan
    existing_plan = db.query(TrainingPlan).filter(
        TrainingPlan.goal_id == goal.id
    ).first()

    if existing_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This goal already has a training plan. Delete it first to create a new one.",
        )

    # Use start date or default to today
    start_date = request.start_date or datetime.utcnow()

    # Validate start date is before target date
    if start_date >= goal.target_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be before the goal target date",
        )

    # Generate plan using AI
    planner = AITrainingPlanner()

    try:
        training_plan = planner.generate_training_plan(
            db=db,
            user=current_user,
            goal=goal,
            start_date=start_date,
            additional_notes=request.additional_notes,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate training plan: {str(e)}",
        )

    return training_plan


@router.get("/{plan_id}", response_model=TrainingPlanWithWorkouts)
def get_training_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a training plan with all workouts"""

    plan = db.query(TrainingPlan).filter(
        TrainingPlan.id == plan_id,
        TrainingPlan.user_id == current_user.id
    ).first()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training plan not found",
        )

    # Calculate stats
    total_workouts = len(plan.workouts)
    completed_workouts = sum(1 for w in plan.workouts if w.is_completed)
    completion_rate = (completed_workouts / total_workouts * 100) if total_workouts > 0 else 0.0

    return {
        **plan.__dict__,
        "workouts": plan.workouts,
        "total_workouts": total_workouts,
        "completed_workouts": completed_workouts,
        "completion_rate": round(completion_rate, 1),
    }


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_training_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a training plan"""

    plan = db.query(TrainingPlan).filter(
        TrainingPlan.id == plan_id,
        TrainingPlan.user_id == current_user.id
    ).first()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training plan not found",
        )

    db.delete(plan)
    db.commit()

    return None
