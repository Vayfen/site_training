from sqlalchemy import Column, Integer, String, DateTime, Enum, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..core.database import Base


class UserLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)

    # Running profile
    level = Column(Enum(UserLevel), default=UserLevel.BEGINNER)
    weekly_availability_hours = Column(Integer, default=5)  # hours per week
    preferred_training_days = Column(Integer, default=3)  # days per week

    # Personal records (in seconds)
    pr_5k = Column(Integer, nullable=True)
    pr_10k = Column(Integer, nullable=True)
    pr_half_marathon = Column(Integer, nullable=True)
    pr_marathon = Column(Integer, nullable=True)

    # Preferences
    prefers_trail = Column(String, default="both")  # trail, road, both
    max_distance_km = Column(Float, default=10.0)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    training_plans = relationship("TrainingPlan", back_populates="user", cascade="all, delete-orphan")
    routes = relationship("Route", back_populates="user", cascade="all, delete-orphan")
