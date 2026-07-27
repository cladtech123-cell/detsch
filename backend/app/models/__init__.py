"""SQLAlchemy ORM models."""

from __future__ import annotations

from app.core.database import Base
from app.models.german import (
    User,
    UserProgress,
    Vocabulary,
    MistakeLog,
    ChatMessage,
    HomeworkSubmission,
    GrammarTopic,
    CurriculumBook,
    CurriculumLesson,
    StudySession,
    ExamResult,
)

__all__ = [
    "Base",
    "User",
    "UserProgress",
    "Vocabulary",
    "MistakeLog",
    "ChatMessage",
    "HomeworkSubmission",
    "GrammarTopic",
    "CurriculumBook",
    "CurriculumLesson",
    "StudySession",
    "ExamResult",
]
