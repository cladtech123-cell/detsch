from __future__ import annotations

from datetime import date, datetime
from typing import Any

from sqlalchemy import JSON, Boolean, Date, DateTime, Float, Integer, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    """Stores user credentials, role, and metadata."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    role: Mapped[str] = mapped_column(String(20), default="user")  # "user" or "admin"
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class UserProgress(Base):
    """Tracks overall CEFR levels, current module/lesson, and study metrics."""

    __tablename__ = "user_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
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

    # User-independent tracking fields
    completed_lessons: Mapped[list[int]] = mapped_column(JSON, default=list)
    lesson_progress: Mapped[dict[str, dict[str, bool]]] = mapped_column(JSON, default=dict)
    completed_grammar_topics: Mapped[list[int]] = mapped_column(JSON, default=list)


class Vocabulary(Base):
    """Vocabulary cards with spaced repetition stats."""

    __tablename__ = "vocabulary"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
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

    # Added Momente integration fields
    article: Mapped[str | None] = mapped_column(String(20), nullable=True)
    plural: Mapped[str | None] = mapped_column(String(100), nullable=True)
    pronunciation: Mapped[str | None] = mapped_column(String(150), nullable=True)
    ipa: Mapped[str | None] = mapped_column(String(150), nullable=True)
    audio_url: Mapped[str | None] = mapped_column(String(250), nullable=True)
    textbook_page: Mapped[int | None] = mapped_column(Integer, nullable=True)
    lesson_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    mastery_percentage: Mapped[int] = mapped_column(Integer, default=0)
    mistake_count: Mapped[int] = mapped_column(Integer, default=0)
    review_history_json: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)


class CurriculumBook(Base):
    """Stores available textbook modules (e.g. Momente A1.1, Momente A1.2)"""

    __tablename__ = "curriculum_book"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    cefr: Mapped[str] = mapped_column(String(10), nullable=False)


class CurriculumLesson(Base):
    """Stores full details for each textbook lesson (Momente structure)"""

    __tablename__ = "curriculum_lesson"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    book_code: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    number: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    title_uz: Mapped[str] = mapped_column(String(200), nullable=False)
    title_de: Mapped[str] = mapped_column(String(200), nullable=False)
    description_uz: Mapped[str] = mapped_column(Text, nullable=False)
    description_de: Mapped[str] = mapped_column(Text, nullable=False)

    # Einstieg / Grammar info
    grammar_title: Mapped[str] = mapped_column(String(150), default="Grammatik")
    grammar_explanation: Mapped[str] = mapped_column(Text, default="")
    grammar_examples_json: Mapped[list[dict[str, str]]] = mapped_column(JSON, default=list)

    # Hören (Listening)
    listening_dialogue: Mapped[str] = mapped_column(Text, default="")
    listening_quiz_json: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)

    # Lesen (Reading)
    reading_passage: Mapped[str] = mapped_column(Text, default="")
    reading_quiz_json: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)

    # Schreiben & Sprechen prompts
    writing_prompt: Mapped[str] = mapped_column(Text, default="")
    speaking_topic: Mapped[str] = mapped_column(Text, default="")

    # Quiz / Wortschatz definitions
    quiz_questions_json: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    vocabulary_json: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    exercises_json: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)


class MistakeLog(Base):
    """Categorized mistake history logged from chat and homework corrections."""

    __tablename__ = "mistake_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
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
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # user / assistant
    content: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class HomeworkSubmission(Base):
    """Homework submissions, OCR extractions, and scores."""

    __tablename__ = "homework_submission"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
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


class StudySession(Base):
    """Tracks individual study activity per day for reporting and activity chart."""

    __tablename__ = "study_session"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    session_date: Mapped[date] = mapped_column(Date, default=date.today, index=True)
    activity_type: Mapped[str] = mapped_column(String(50), default="general")  # lesson, vocab, grammar, ai_tutor, exam
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=0)
    lesson_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ExamResult(Base):
    """Persists exam attempt results with score and question details."""

    __tablename__ = "exam_result"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    exam_type: Mapped[str] = mapped_column(String(50), default="lesson")
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    score: Mapped[int] = mapped_column(Integer, default=0)
    correct_count: Mapped[int] = mapped_column(Integer, default=0)
    total_questions: Mapped[int] = mapped_column(Integer, default=0)
    lesson_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    time_taken_seconds: Mapped[int] = mapped_column(Integer, default=0)
    questions_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
