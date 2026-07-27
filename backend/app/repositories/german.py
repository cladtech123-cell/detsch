from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.german import (
    ChatMessage,
    ExamResult,
    GrammarTopic,
    HomeworkSubmission,
    MistakeLog,
    StudySession,
    UserProgress,
    Vocabulary,
)


class GermanRepository:
    def __init__(self, db: AsyncSession, user_id: int | None = None):
        self.db = db
        self.user_id = user_id

    # --- UserProgress ---
    async def get_progress(self) -> UserProgress:
        result = await self.db.execute(select(UserProgress).filter(UserProgress.user_id == self.user_id))
        progress = result.scalars().first()
        if not progress:
            progress = UserProgress(
                user_id=self.user_id,
                current_course="Momente A1.1",
                current_lesson=7,
                study_streak=0,
                last_study_date=None,
                weekly_goal_hours=10.0,
                reading_level="A1.1",
                listening_level="A1.1",
                writing_level="A1.1",
                speaking_level="A1.1",
                grammar_level="A1.1",
                vocabulary_level="A1.1",
                completed_lessons=[],
                lesson_progress={"7": {"einstieg": True, "wortschatz": True, "grammatik": True}},
                completed_grammar_topics=[]
            )
            self.db.add(progress)
            await self.db.commit()
            await self.db.refresh(progress)
        return progress

    async def update_progress(self, progress: UserProgress) -> UserProgress:
        progress.user_id = self.user_id
        self.db.add(progress)
        await self.db.commit()
        await self.db.refresh(progress)
        return progress

    # --- Vocabulary ---
    async def get_all_vocabulary(self) -> list[Vocabulary]:
        result = await self.db.execute(
            select(Vocabulary)
            .filter(Vocabulary.user_id == self.user_id)
            .order_by(Vocabulary.german.asc())
        )
        return list(result.scalars().all())

    async def get_due_vocabulary(self) -> list[Vocabulary]:
        result = await self.db.execute(
            select(Vocabulary)
            .filter(Vocabulary.user_id == self.user_id, Vocabulary.next_review <= date.today())
            .order_by(Vocabulary.box.asc())
        )
        return list(result.scalars().all())

    async def get_vocabulary_by_german(self, german: str) -> Vocabulary | None:
        result = await self.db.execute(
            select(Vocabulary)
            .filter(Vocabulary.user_id == self.user_id, Vocabulary.german == german)
        )
        return result.scalars().first()

    async def get_vocabulary_count(self) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(Vocabulary)
            .filter(Vocabulary.user_id == self.user_id)
        )
        return result.scalar() or 0

    async def get_due_vocabulary_count(self) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(Vocabulary)
            .filter(Vocabulary.user_id == self.user_id, Vocabulary.next_review <= date.today())
        )
        return result.scalar() or 0

    async def add_vocabulary(self, word: Vocabulary) -> Vocabulary:
        word.user_id = self.user_id
        self.db.add(word)
        await self.db.commit()
        await self.db.refresh(word)
        return word

    # --- MistakeLog ---
    async def get_all_mistakes(self) -> list[MistakeLog]:
        result = await self.db.execute(
            select(MistakeLog)
            .filter(MistakeLog.user_id == self.user_id)
            .order_by(MistakeLog.occurrence_count.desc())
        )
        return list(result.scalars().all())

    async def get_recent_mistakes(self, limit: int = 3) -> list[MistakeLog]:
        result = await self.db.execute(
            select(MistakeLog)
            .filter(MistakeLog.user_id == self.user_id)
            .order_by(MistakeLog.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_mistake_by_text_and_category(self, incorrect_text: str, category: str) -> MistakeLog | None:
        result = await self.db.execute(
            select(MistakeLog)
            .filter(
                MistakeLog.user_id == self.user_id,
                MistakeLog.incorrect_text == incorrect_text,
                MistakeLog.category == category
            )
        )
        return result.scalars().first()

    async def add_mistake(self, mistake: MistakeLog) -> MistakeLog:
        mistake.user_id = self.user_id
        self.db.add(mistake)
        await self.db.commit()
        await self.db.refresh(mistake)
        return mistake

    # --- ChatMessage ---
    async def get_chat_messages(self, limit: int = 50) -> list[ChatMessage]:
        result = await self.db.execute(
            select(ChatMessage)
            .filter(ChatMessage.user_id == self.user_id)
            .order_by(ChatMessage.timestamp.asc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def add_chat_message(self, message: ChatMessage) -> ChatMessage:
        message.user_id = self.user_id
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def clear_chat_history(self) -> None:
        await self.db.execute(
            delete(ChatMessage)
            .filter(ChatMessage.user_id == self.user_id)
        )
        await self.db.commit()

    # --- HomeworkSubmission ---
    async def get_homework_history(self) -> list[HomeworkSubmission]:
        result = await self.db.execute(
            select(HomeworkSubmission)
            .filter(HomeworkSubmission.user_id == self.user_id)
            .order_by(HomeworkSubmission.created_at.desc())
        )
        return list(result.scalars().all())

    async def add_homework_submission(self, sub: HomeworkSubmission) -> HomeworkSubmission:
        sub.user_id = self.user_id
        self.db.add(sub)
        await self.db.commit()
        await self.db.refresh(sub)
        return sub

    # --- GrammarTopic ---
    async def get_all_grammar_topics(self) -> list[GrammarTopic]:
        result = await self.db.execute(select(GrammarTopic).order_by(GrammarTopic.id.asc()))
        return list(result.scalars().all())

    async def get_grammar_topic_by_id(self, topic_id: int) -> GrammarTopic | None:
        result = await self.db.execute(select(GrammarTopic).filter(GrammarTopic.id == topic_id))
        return result.scalars().first()

    async def get_grammar_topic_by_title(self, title: str) -> GrammarTopic | None:
        result = await self.db.execute(select(GrammarTopic).filter(GrammarTopic.title == title))
        return result.scalars().first()

    async def get_completed_grammar_count(self) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(GrammarTopic)
            .filter(GrammarTopic.is_completed)
        )
        return result.scalar() or 0

    async def get_total_grammar_count(self) -> int:
        result = await self.db.execute(select(func.count()).select_from(GrammarTopic))
        return result.scalar() or 0

    async def add_grammar_topic(self, topic: GrammarTopic) -> GrammarTopic:
        self.db.add(topic)
        await self.db.commit()
        await self.db.refresh(topic)
        return topic

    # --- StudySession ---
    async def log_study_session(self, session: StudySession) -> StudySession:
        session.user_id = self.user_id
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def get_study_sessions_last_7_days(self) -> list[StudySession]:
        seven_days_ago = date.today() - timedelta(days=6)
        result = await self.db.execute(
            select(StudySession)
            .filter(StudySession.user_id == self.user_id, StudySession.session_date >= seven_days_ago)
            .order_by(StudySession.session_date.asc())
        )
        return list(result.scalars().all())

    async def get_xp_by_date_last_7_days(self) -> dict[str, int]:
        """Returns a dict mapping date strings (YYYY-MM-DD) to total XP for last 7 days."""
        sessions = await self.get_study_sessions_last_7_days()
        xp_map: dict[str, int] = {}
        for s in sessions:
            key = s.session_date.isoformat()
            xp_map[key] = xp_map.get(key, 0) + s.xp_earned
        return xp_map

    async def get_weekly_study_hours(self) -> float:
        """Returns the total study hours accumulated in the current week (since Monday)."""
        today = date.today()
        start_of_week = today - timedelta(days=today.weekday())
        result = await self.db.execute(
            select(func.sum(StudySession.duration_minutes))
            .filter(StudySession.user_id == self.user_id, StudySession.session_date >= start_of_week)
        )
        minutes = result.scalar() or 0
        return float(minutes) / 60.0

    async def get_today_xp(self) -> int:
        """Returns the total XP earned by the user today."""
        today = date.today()
        result = await self.db.execute(
            select(func.sum(StudySession.xp_earned))
            .filter(StudySession.user_id == self.user_id, StudySession.session_date == today)
        )
        return result.scalar() or 0

    # --- ExamResult ---
    async def save_exam_result(self, exam_result: ExamResult) -> ExamResult:
        exam_result.user_id = self.user_id
        self.db.add(exam_result)
        await self.db.commit()
        await self.db.refresh(exam_result)
        return exam_result

    async def get_exam_history(self, limit: int = 20) -> list[ExamResult]:
        result = await self.db.execute(
            select(ExamResult)
            .filter(ExamResult.user_id == self.user_id)
            .order_by(ExamResult.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
