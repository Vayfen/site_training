from sqlalchemy import Column, Integer, String, DateTime, Enum, Float, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..core.database import Base


class WorkoutType(str, enum.Enum):
    EASY_RUN = "easy_run"
    LONG_RUN = "long_run"
    TEMPO = "tempo"
    INTERVALS = "intervals"
    HILL_REPEATS = "hill_repeats"
    FARTLEK = "fartlek"
    RECOVERY = "recovery"
    RACE_PACE = "race_pace"
    PROGRESSION = "progression"
    REST = "rest"


class WorkoutIntensity(str, enum.Enum):
    VERY_EASY = "very_easy"  # Zone 1
    EASY = "easy"  # Zone 2
    MODERATE = "moderate"  # Zone 3
    HARD = "hard"  # Zone 4
    VERY_HARD = "very_hard"  # Zone 5


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    training_plan_id = Column(Integer, ForeignKey("training_plans.id"), nullable=False)

    # Workout details
    name = Column(String, nullable=False)
    workout_type = Column(Enum(WorkoutType), nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    week_number = Column(Integer, nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday

    # Workout prescription
    description = Column(Text, nullable=False)
    distance_km = Column(Float, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    intensity = Column(Enum(WorkoutIntensity), nullable=False)

    # Detailed session structure
    warmup_description = Column(Text, nullable=True)
    main_set_description = Column(Text, nullable=False)
    cooldown_description = Column(Text, nullable=True)

    # Pace guidance (seconds per km)
    target_pace_min = Column(Integer, nullable=True)
    target_pace_max = Column(Integer, nullable=True)

    # Completion tracking
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    actual_distance_km = Column(Float, nullable=True)
    actual_duration_minutes = Column(Integer, nullable=True)
    perceived_effort = Column(Integer, nullable=True)  # 1-10 scale
    notes = Column(Text, nullable=True)

    # Route suggestion
    suggested_route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    training_plan = relationship("TrainingPlan", back_populates="workouts")
    suggested_route = relationship("Route", foreign_keys=[suggested_route_id])
