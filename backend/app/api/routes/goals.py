from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ...core.database import get_db
from ...api.deps import get_current_user
from ...models import User, Goal, TrainingPlan
from ...schemas import GoalCreate, GoalUpdate, GoalResponse, GoalWithProgress

router = APIRouter()


@router.get("", response_model=List[GoalWithProgress])
def list_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
):
    """List user's goals"""

    query = db.query(Goal).filter(Goal.user_id == current_user.id)

    if active_only:
        query = query.filter(Goal.is_active == True, Goal.is_completed == False)

    goals = query.order_by(Goal.target_date).offset(skip).limit(limit).all()

    # Enrich with progress data
    goals_with_progress = []
    for goal in goals:
        days_until = (goal.target_date - datetime.utcnow()).days
        weeks_until = max(0, days_until // 7)

        # Check if has training plan
        has_plan = db.query(TrainingPlan).filter(
            TrainingPlan.goal_id == goal.id
        ).first() is not None

        # Calculate completion rate if has plan
        completion_rate = None
        if has_plan:
            plan = db.query(TrainingPlan).filter(
                TrainingPlan.goal_id == goal.id
            ).first()

            total = len(plan.workouts)
            completed = sum(1 for w in plan.workouts if w.is_completed)
            completion_rate = (completed / total * 100) if total > 0 else 0.0

        goal_dict = {
            **goal.__dict__,
            "days_until_race": days_until,
            "weeks_until_race": weeks_until,
            "has_training_plan": has_plan,
            "training_completion_rate": completion_rate,
        }

        goals_with_progress.append(goal_dict)

    return goals_with_progress


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new goal"""

    goal = Goal(
        user_id=current_user.id,
        **goal_data.dict(),
    )

    db.add(goal)
    db.commit()
    db.refresh(goal)

    return goal


@router.get("/{goal_id}", response_model=GoalWithProgress)
def get_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific goal"""

    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    days_until = (goal.target_date - datetime.utcnow()).days
    weeks_until = max(0, days_until // 7)

    has_plan = db.query(TrainingPlan).filter(
        TrainingPlan.goal_id == goal.id
    ).first() is not None

    completion_rate = None
    if has_plan:
        plan = db.query(TrainingPlan).filter(
            TrainingPlan.goal_id == goal.id
        ).first()

        total = len(plan.workouts)
        completed = sum(1 for w in plan.workouts if w.is_completed)
        completion_rate = (completed / total * 100) if total > 0 else 0.0

    return {
        **goal.__dict__,
        "days_until_race": days_until,
        "weeks_until_race": weeks_until,
        "has_training_plan": has_plan,
        "training_completion_rate": completion_rate,
    }


@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    goal_update: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a goal"""

    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    update_data = goal_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)

    db.commit()
    db.refresh(goal)

    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a goal"""

    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    db.delete(goal)
    db.commit()

    return None
