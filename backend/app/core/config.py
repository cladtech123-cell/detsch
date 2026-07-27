"""Application configuration via pydantic-settings.

Reads environment variables (and the `.env` file) and exposes a typed
`settings` singleton consumed across the application.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve project paths relative to this file so they work regardless of CWD.
BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Typed application settings."""

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "CTF OSINT Toolkit"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # CORS
    BACKEND_CORS_ORIGINS: str | list[str] = (
        "http://localhost:5173,http://127.0.0.1:5173"
    )

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/german.db"

    # AI Configurations
    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    OPENAI_API_KEY: str = ""

    # Explanation configurations (uz or en)
    EXPLANATION_LANGUAGE: str = "uz"

    # Vault (encryption key for the API-key vault; wired in a later phase)
    VAULT_KEY: str = ""

    # Authentication
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-prod-123456"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    GOOGLE_CLIENT_ID: str = ""

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def _split_cors(cls, v: object) -> list[str]:
        """Accept a comma-separated string or a list and normalize to list."""
        if isinstance(v, str) and not v.startswith("["):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        if isinstance(v, list | str):
            return v if isinstance(v, list) else [v]
        raise ValueError("BACKEND_CORS_ORIGINS must be a string or list")

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()


settings = get_settings()
