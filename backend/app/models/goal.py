from sqlalchemy import Column, Integer, String, DateTime, Enum, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..core.database import Base


class RaceType(str, enum.Enum):
    FIVE_K = "5k"
    TEN_K = "10k"
    HALF_MARATHON = "half_marathon"
    MARATHON = "marathon"
    TRAIL_SHORT = "trail_short"  # < 25km
    TRAIL_MEDIUM = "trail_medium"  # 25-50km
    TRAIL_LONG = "trail_long"  # 50-80km
    ULTRA = "ultra"  # > 80km


class GoalPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Goal details
    name = Column(String, nullable=False)
    race_type = Column(Enum(RaceType), nullable=False)
    target_date = Column(DateTime, nullable=False)
    target_time_seconds = Column(Integer, nullable=True)  # Target finish time

    # Race specifics
    race_name = Column(String, nullable=True)
    race_location = Column(String, nullable=True)
    distance_km = Column(Float, nullable=False)
    elevation_gain_m = Column(Integer, default=0)

    # Priority and status
    priority = Column(Enum(GoalPriority), default=GoalPriority.MEDIUM)
    is_active = Column(Boolean, default=True)
    is_completed = Column(Boolean, default=False)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="goals")
    training_plans = relationship("TrainingPlan", back_populates="goal", cascade="all, delete-orphan")
