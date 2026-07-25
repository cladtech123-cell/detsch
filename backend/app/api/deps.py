"""Shared FastAPI dependencies."""

from __future__ import annotations

from fastapi import Request

from app.core.config import Settings, settings


def get_settings_dep() -> Settings:
    """Inject the application settings (override-friendly for tests)."""
    return settings


def get_request_id(request: Request) -> str | None:
    """Return the incoming request id, if any (for logging/tracing)."""
    return request.headers.get("x-request-id")
