import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Agro Academy API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    # Using SQLite for local development, will be replaced with Supabase URL later
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agro_academy.db")
    
    # CORS setup (Allow Next.js frontend to talk to this backend)
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # AI 
    MISTRAL_API_KEY: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()
