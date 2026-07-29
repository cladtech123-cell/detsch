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
    completed_lessons: list[int] = []
    lesson_progress: dict[str, dict[str, bool]] = {}
    completed_grammar_topics: list[int] = []
    total_xp: int = 0

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
    article: str | None = None
    plural: str | None = None
    pronunciation: str | None = None
    ipa: str | None = None
    audio_url: str | None = None
    textbook_page: int | None = None
    lesson_number: int | None = None
    mastery_percentage: int = 0
    mistake_count: int = 0
    review_history_json: list[dict[str, Any]] = []

    # Metadata fields for Intelligent Learning Engine
    part_of_speech: str | None = None
    infinitive: str | None = None
    lesson_id: int | None = None
    grammar_topic: str | None = None
    difficulty: str | None = None

    class Config:
        from_attributes = True


class CurriculumBookSchema(BaseModel):
    id: int
    code: str
    title: str
    cefr: str

    class Config:
        from_attributes = True


class CurriculumLessonSchema(BaseModel):
    id: int
    book_code: str
    number: int
    title_uz: str
    title_de: str
    description_uz: str
    description_de: str
    grammar_title: str
    grammar_explanation: str
    grammar_examples_json: list[dict[str, str]]
    listening_dialogue: str
    listening_quiz_json: list[dict[str, Any]]
    reading_passage: str
    reading_quiz_json: list[dict[str, Any]]
    writing_prompt: str
    speaking_topic: str
    quiz_questions_json: list[dict[str, Any]]
    vocabulary_json: list[dict[str, Any]]
    exercises_json: list[dict[str, Any]] = []

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
    today_xp: int = 0


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


# Study Session schemas
class StudySessionCreate(BaseModel):
    activity_type: str = "general"
    xp_earned: int = 0
    duration_minutes: int = 0
    lesson_number: int | None = None


class StudySessionSchema(BaseModel):
    id: int
    session_date: date
    activity_type: str
    xp_earned: int
    duration_minutes: int
    lesson_number: int | None
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityDaySchema(BaseModel):
    date_str: str
    day_abbr: str
    xp: int
    is_today: bool


# Exam Result schemas
class ExamResultCreate(BaseModel):
    exam_type: str
    title: str
    score: int
    correct_count: int
    total_questions: int
    lesson_number: int | None = None
    time_taken_seconds: int = 0
    questions_json: dict[str, Any] = {}


class ExamResultSchema(BaseModel):
    id: int
    exam_type: str
    title: str
    score: int
    correct_count: int
    total_questions: int
    lesson_number: int | None
    time_taken_seconds: int
    created_at: datetime

    class Config:
        from_attributes = True
