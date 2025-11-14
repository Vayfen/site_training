"""
Initialize the database - Create all tables
Run this script once after installation
"""
from app.core.database import Base, engine
from app.models import User, Goal, TrainingPlan, Workout, Route

def init_db():
    """Initialize database and create all tables"""
    print("Creating database tables...")

    # Import all models to register them with Base
    # This ensures all tables are created

    # Create all tables
    Base.metadata.create_all(bind=engine)

    print("✅ Database initialized successfully!")
    print(f"Database location: {engine.url}")
    print("\nTables created:")
    for table in Base.metadata.tables.keys():
        print(f"  - {table}")

if __name__ == "__main__":
    init_db()
