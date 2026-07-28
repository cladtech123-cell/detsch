"""Health endpoint.

Phase 1's only "real" endpoint. Returns a simple status object that the
frontend can ping to confirm the backend is reachable.
"""

from __future__ import annotations

from fastapi import APIRouter

from app import __version__
from app.core.config import settings

router = APIRouter()


@router.get("/health", summary="Liveness probe", tags=["health"])
async def health() -> dict:
    """Return service health. Used by the frontend and CI smoke checks."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": __version__,
        "config_status": {
            "database_url_configured": bool(settings.DATABASE_URL),
            "gemini_api_key_configured": bool(settings.GEMINI_API_KEY),
            "groq_api_key_configured": bool(settings.GROQ_API_KEY),
            "openai_api_key_configured": bool(settings.OPENAI_API_KEY),
            "jwt_secret_key_configured": bool(settings.JWT_SECRET_KEY) and settings.JWT_SECRET_KEY != "dev-secret-key-change-in-prod-123456",
        }
    }

