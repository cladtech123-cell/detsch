from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.dependencies import get_german_repo
from app.repositories.german import GermanRepository
from app.schemas.german import UserProgressSchema

router = APIRouter()


@router.get("/progress", response_model=UserProgressSchema, summary="Get user progress metrics")
async def get_progress(repo: GermanRepository = Depends(get_german_repo)):
    progress = await repo.get_progress()
    return UserProgressSchema.from_orm(progress)


@router.post("/progress/update", response_model=UserProgressSchema, summary="Update CEFR levels or course settings")
async def update_progress(
    current_lesson: int | None = None,
    reading: str | None = None,
    writing: str | None = None,
    listening: str | None = None,
    speaking: str | None = None,
    grammar: str | None = None,
    vocabulary: str | None = None,
    weekly_goal: float | None = None,
    ai_provider: str | None = None,
    ai_model: str | None = None,
    repo: GermanRepository = Depends(get_german_repo)
):
    progress = await repo.get_progress()

    if current_lesson is not None:
        progress.current_lesson = current_lesson
    if reading is not None:
        progress.reading_level = reading
    if writing is not None:
        progress.writing_level = writing
    if listening is not None:
        progress.listening_level = listening
    if speaking is not None:
        progress.speaking_level = speaking
    if grammar is not None:
        progress.grammar_level = grammar
    if vocabulary is not None:
        progress.vocabulary_level = vocabulary
    if weekly_goal is not None:
        progress.weekly_goal_hours = weekly_goal
    if ai_provider is not None:
        progress.ai_provider = ai_provider
    if ai_model is not None:
        progress.ai_model = ai_model

    updated = await repo.update_progress(progress)
    return UserProgressSchema.from_orm(updated)
