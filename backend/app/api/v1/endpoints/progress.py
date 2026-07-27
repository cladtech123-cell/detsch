from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter, Depends

from app.core.dependencies import get_german_repo
from app.repositories.german import GermanRepository
from app.models.german import StudySession, UserProgress
from app.schemas.german import (
    UserProgressSchema,
    StudySessionCreate,
    StudySessionSchema,
    ActivityDaySchema,
)

router = APIRouter()

DAY_ABBRS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


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


@router.post("/progress/log-session", response_model=StudySessionSchema, summary="Log a study session (XP + activity)")
async def log_study_session(
    payload: StudySessionCreate,
    repo: GermanRepository = Depends(get_german_repo)
):
    """Records a study session and updates the user's streak if today is a new study day."""
    session = StudySession(
        session_date=date.today(),
        activity_type=payload.activity_type,
        xp_earned=payload.xp_earned,
        duration_minutes=payload.duration_minutes,
        lesson_number=payload.lesson_number,
    )
    saved = await repo.log_study_session(session)

    # Update streak: if last study date was yesterday or today, increment/maintain streak
    progress = await repo.get_progress()
    today = date.today()
    if progress.last_study_date is None or progress.last_study_date < today:
        if progress.last_study_date == today - timedelta(days=1):
            progress.study_streak += 1
        elif progress.last_study_date != today:
            progress.study_streak = 1  # reset streak if gap
        progress.last_study_date = today
        await repo.update_progress(progress)

    return StudySessionSchema.from_orm(saved)


@router.get("/progress/activity", response_model=list[ActivityDaySchema], summary="Get last 7 days of study activity")
async def get_activity(repo: GermanRepository = Depends(get_german_repo)):
    """Returns a 7-element list of daily XP data for the activity bar chart."""
    xp_map = await repo.get_xp_by_date_last_7_days()
    today = date.today()
    result = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        date_str = d.isoformat()
        # weekday(): 0=Mon, 6=Sun
        result.append(ActivityDaySchema(
            date_str=date_str,
            day_abbr=DAY_ABBRS[d.weekday()],
            xp=xp_map.get(date_str, 0),
            is_today=(d == today),
        ))
    return result
