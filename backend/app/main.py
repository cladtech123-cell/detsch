"""FastAPI application entrypoint.

Run with::

    uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.api.v1.api import api_router
from app.core.config import settings

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
# Silence verbose third-party logging
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)
logger = logging.getLogger("app")


def create_app() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title=settings.APP_NAME,
        description=(
            "A modular OSINT toolkit for CTF and security research. "
            "Phase 1 ships scaffolding, routing, and a health probe."
        ),
        version=__version__,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # CORS — allow the Vite dev server and any configured origins.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount the v1 API.
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    @app.get("/", include_in_schema=False)
    async def root() -> dict:
        """Root redirect-ish landing so `/` is not a bare 404."""
        return {
            "app": settings.APP_NAME,
            "version": __version__,
            "docs": "/docs",
            "health": f"{settings.API_V1_PREFIX}/health",
        }

    logger.info("FastAPI app created (%s env)", settings.APP_ENV)
    return app


app = create_app()
