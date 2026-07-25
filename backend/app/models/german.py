from __future__ import annotations

from datetime import date, datetime
from typing import Any

from sqlalchemy import JSON, Boolean, Date, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class UserProgress(Base):
    """Tracks overall CEFR levels, current module/lesson, and study metrics."""

    __tablename__ = "user_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    current_course: Mapped[str] = mapped_column(String(100), default="Momente A1.1")
    current_lesson: Mapped[int] = mapped_column(Integer, default=7)
    study_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_study_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    weekly_goal_hours: Mapped[float] = mapped_column(Float, default=10.0)
    target_level: Mapped[str] = mapped_column(String(10), default="B2")
    ai_provider: Mapped[str] = mapped_column(String(50), default="gemini")
    ai_model: Mapped[str] = mapped_column(String(50), default="gemini-2.5-flash")

    # CEFR Level breakdown
    reading_level: Mapped[str] = mapped_column(String(10), default="A1.1")
    listening_level: Mapped[str] = mapped_column(String(10), default="A1.1")
    writing_level: Mapped[str] = mapped_column(String(10), default="A1.1")
    speaking_level: Mapped[str] = mapped_column(String(10), default="A1.1")
    grammar_level: Mapped[str] = mapped_column(String(10), default="A1.1")
    vocabulary_level: Mapped[str] = mapped_column(String(10), default="A1.1")


class Vocabulary(Base):
    """Vocabulary cards with spaced repetition stats."""

    __tablename__ = "vocabulary"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    german: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    translation: Mapped[str] = mapped_column(String(200), nullable=False)
    example_sentence: Mapped[str] = mapped_column(Text, nullable=False)
    cefr_level: Mapped[str] = mapped_column(String(10), default="A1")
    lesson: Mapped[str] = mapped_column(String(50), default="Lektion 7")
    category: Mapped[str] = mapped_column(String(50), default="General")

    # Spaced Repetition (SuperMemo-2 parameters)
    box: Mapped[int] = mapped_column(Integer, default=1)  # Leitner Box (1-5)
    interval_days: Mapped[int] = mapped_column(Integer, default=1)
    next_review: Mapped[date] = mapped_column(Date, default=date.today)
    ease_factor: Mapped[float] = mapped_column(Float, default=2.5)
    times_reviewed: Mapped[int] = mapped_column(Integer, default=0)


class MistakeLog(Base):
    """Categorized mistake history logged from chat and homework corrections."""

    __tablename__ = "mistake_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    category: Mapped[str] = mapped_column(String(50), index=True)  # grammar, vocabulary, spelling, word_order, articles, conjugation
    incorrect_text: Mapped[str] = mapped_column(Text, nullable=False)
    corrected_text: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)  # Primary explanation in Uzbek, secondary in English
    lesson: Mapped[str | None] = mapped_column(String(50), nullable=True)
    occurrence_count: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    """Saves tutor-user chat history for AI memory context."""

    __tablename__ = "chat_message"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # user / assistant
    content: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class HomeworkSubmission(Base):
    """Homework submissions, OCR extractions, and scores."""

    __tablename__ = "homework_submission"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    file_type: Mapped[str] = mapped_column(String(20), nullable=False)  # text, image, pdf
    raw_content: Mapped[str | None] = mapped_column(Text, nullable=True)  # File path or text body
    corrections_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    score: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class GrammarTopic(Base):
    """Grammar curriculum and completion tracking."""

    __tablename__ = "grammar_topic"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    lesson: Mapped[str] = mapped_column(String(50), default="Lektion 7")
    explanation_uz: Mapped[str] = mapped_column(Text, nullable=False)
    explanation_en: Mapped[str] = mapped_column(Text, nullable=False)
    examples_json: Mapped[list[dict[str, str]]] = mapped_column(JSON, default=list)  # List of {"de": "...", "uz": "..."}
    common_mistakes_json: Mapped[list[dict[str, str]]] = mapped_column(JSON, default=list)
    practice_questions_json: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
