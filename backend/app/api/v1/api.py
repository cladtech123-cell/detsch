"""API v1 router aggregator.

Mounts every endpoint router under the v1 prefix.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import (
    dashboard,
    exams,
    grammar,
    health,
    homework,
    ocr,
    progress,
    reports,
    tutor,
    vocabulary,
    ai,
    curriculum,
    auth,
)

api_router = APIRouter()

# Register endpoint routes
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(health.router, tags=["health"])
api_router.include_router(dashboard.router, tags=["dashboard"])
api_router.include_router(tutor.router, tags=["tutor"])
api_router.include_router(vocabulary.router, tags=["vocabulary"])
api_router.include_router(grammar.router, tags=["grammar"])
api_router.include_router(homework.router, tags=["homework"])
api_router.include_router(ocr.router, tags=["ocr"])
api_router.include_router(progress.router, tags=["progress"])
api_router.include_router(exams.router, tags=["exams"])
api_router.include_router(reports.router, tags=["reports"])
api_router.include_router(ai.router, tags=["ai"])
api_router.include_router(curriculum.router, tags=["curriculum"])
