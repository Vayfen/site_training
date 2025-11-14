from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import engine, Base
from .api.routes import auth, users, goals, training_plans, workouts, routes

# Import all models to register them with SQLAlchemy
from .models import User, Goal, TrainingPlan, Workout, Route

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "RunAI Backend"}


# Include routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["Authentication"],
)

app.include_router(
    users.router,
    prefix=f"{settings.API_V1_STR}/users",
    tags=["Users"],
)

app.include_router(
    goals.router,
    prefix=f"{settings.API_V1_STR}/goals",
    tags=["Goals"],
)

app.include_router(
    training_plans.router,
    prefix=f"{settings.API_V1_STR}/training-plans",
    tags=["Training Plans"],
)

app.include_router(
    workouts.router,
    prefix=f"{settings.API_V1_STR}/workouts",
    tags=["Workouts"],
)

app.include_router(
    routes.router,
    prefix=f"{settings.API_V1_STR}/routes",
    tags=["Routes"],
)


@app.get("/")
def root():
    return {
        "message": "Welcome to RunAI - AI-Powered Running Training Platform",
        "version": settings.VERSION,
        "docs": "/docs",
        "api": settings.API_V1_STR,
    }
