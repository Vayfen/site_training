from pydantic_settings import BaseSettings
from typing import List
import secrets
import os
from pathlib import Path


# Get user data directory
def get_data_dir() -> Path:
    """Get the application data directory"""
    if os.name == 'nt':  # Windows
        data_dir = Path(os.getenv('APPDATA', '')) / 'RunAI'
    else:  # Linux/Mac
        data_dir = Path.home() / '.runai'

    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "RunAI - Training Platform (Local)"
    VERSION: str = "2.0.0"

    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database - SQLite local
    DATABASE_URL: str = f"sqlite:///{get_data_dir() / 'runai.db'}"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
    ]

    # Ollama AI (Local LLM)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:3b"  # Fast and lightweight model

    # Maps
    MAPBOX_TOKEN: str = ""

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
