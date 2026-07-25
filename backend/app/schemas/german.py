from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel


class UserProgressSchema(BaseModel):
    id: int
    current_course: str
    current_lesson: int
    study_streak: int
    last_study_date: date | None
    weekly_goal_hours: float
    target_level: str
    reading_level: str
    listening_level: str
    writing_level: str
    speaking_level: str
    grammar_level: str
    vocabulary_level: str
    ai_provider: str | None = "gemini"
    ai_model: str | None = "gemini-2.5-flash"

    class Config:
        from_attributes = True


class VocabularySchema(BaseModel):
    id: int
    german: str
    translation: str
    example_sentence: str
    cefr_level: str
    lesson: str
    category: str
    box: int
    interval_days: int
    next_review: date
    ease_factor: float
    times_reviewed: int

    class Config:
        from_attributes = True


class VocabularyCreate(BaseModel):
    german: str
    translation: str
    example_sentence: str
    cefr_level: str = "A1"
    lesson: str = "Lektion 7"
    category: str = "General"


class VocabularyUpdate(BaseModel):
    translation: str | None = None
    example_sentence: str | None = None
    box: int | None = None
    next_review: date | None = None


class VocabularyReview(BaseModel):
    word_id: int
    is_correct: bool  # Leitner / SM-2 review score (true/false or rating)


class MistakeSchema(BaseModel):
    id: int
    category: str
    incorrect_text: str
    corrected_text: str
    explanation: str
    lesson: str | None
    occurrence_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageSchema(BaseModel):
    id: int
    role: str
    content: str
    timestamp: datetime
    provider_info: str | None = None

    class Config:
        from_attributes = True


class ChatMessageCreate(BaseModel):
    content: str


class HomeworkSubmissionSchema(BaseModel):
    id: int
    title: str
    file_type: str
    raw_content: str | None
    corrections_json: dict[str, Any]
    score: int
    created_at: datetime

    class Config:
        from_attributes = True


class GrammarTopicSchema(BaseModel):
    id: int
    title: str
    lesson: str
    explanation_uz: str
    explanation_en: str
    examples_json: list[dict[str, str]]
    common_mistakes_json: list[dict[str, str]]
    practice_questions_json: list[dict[str, Any]]
    is_completed: bool

    class Config:
        from_attributes = True


class GrammarQuizSubmit(BaseModel):
    topic_id: int
    answers: dict[str, str]  # Keyed by question id or index, value is user's answer


# Dashboard & Analytics Models
class DashboardData(BaseModel):
    streak: int
    current_lesson: str
    cefr_estimate: str
    progress_percentage: int
    vocab_total: int
    vocab_due_today: int
    grammar_completed: int
    grammar_total: int
    weekly_goal_progress: float
    today_tasks: list[str]
    recent_mistakes: list[MistakeSchema]


class WeeklyReportData(BaseModel):
    start_date: date
    end_date: date
    topics_completed: list[str]
    vocabulary_learned: int
    grammar_mastered: list[str]
    frequent_mistakes: list[dict[str, Any]]
    estimated_level: str
    recommendations: list[str]


# Bulk Vocabulary Import Models
class BulkGenerateItem(BaseModel):
    german: str
    translation: str | None = None


class BulkGenerateRequest(BaseModel):
    items: list[BulkGenerateItem]


class BulkGenerateResponseItem(BaseModel):
    german: str
    translation: str
    example_sentence: str
    cefr_level: str
    category: str


class BulkImportItem(BaseModel):
    german: str
    translation: str
    example_sentence: str
    cefr_level: str = "A1"
    category: str = "General"
    lesson: str = "Lektion 7"


class BulkImportRequest(BaseModel):
    words: list[BulkImportItem]


class BulkImportResponse(BaseModel):
    imported: int
    skipped: int
    failed: int
