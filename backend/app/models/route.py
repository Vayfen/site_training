from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Route details
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    distance_km = Column(Float, nullable=False)
    elevation_gain_m = Column(Integer, default=0)
    elevation_loss_m = Column(Integer, default=0)

    # Route type and surface
    route_type = Column(String, nullable=False)  # trail, road, mixed
    surface_type = Column(String, nullable=True)  # asphalt, gravel, dirt, mixed

    # Location
    start_location = Column(String, nullable=True)
    start_lat = Column(Float, nullable=True)
    start_lng = Column(Float, nullable=True)

    # Route data (GeoJSON or array of coordinates)
    route_data = Column(JSON, nullable=True)

    # AI generation
    generated_by_ai = Column(Boolean, default=False)

    # Ratings and difficulty
    difficulty_rating = Column(Integer, default=3)  # 1-5 scale
    scenic_rating = Column(Integer, nullable=True)  # 1-5 scale

    # Usage stats
    times_used = Column(Integer, default=0)
    is_favorite = Column(Boolean, default=False)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="routes")
