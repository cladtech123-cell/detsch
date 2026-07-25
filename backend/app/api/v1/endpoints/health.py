"""Health endpoint.

Phase 1's only "real" endpoint. Returns a simple status object that the
frontend can ping to confirm the backend is reachable.
"""

from __future__ import annotations

from fastapi import APIRouter

from app import __version__

router = APIRouter()


@router.get("/health", summary="Liveness probe", tags=["health"])
async def health() -> dict:
    """Return service health. Used by the frontend and CI smoke checks."""
    return {
        "status": "ok",
        "app": "CTF OSINT Toolkit",
        "version": __version__,
    }
