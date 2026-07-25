from __future__ import annotations

from datetime import date

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.german import (
    ChatMessage,
    GrammarTopic,
    HomeworkSubmission,
    MistakeLog,
    UserProgress,
    Vocabulary,
)


class GermanRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # --- UserProgress ---
    async def get_progress(self) -> UserProgress:
        result = await self.db.execute(select(UserProgress).filter(UserProgress.id == 1))
        progress = result.scalars().first()
        if not progress:
            progress = UserProgress(
                id=1,
                current_course="Momente A1.1",
                current_lesson=7,
                study_streak=3,
                last_study_date=date.today(),
                weekly_goal_hours=10.0,
                reading_level="A1.1",
                listening_level="A1.1",
                writing_level="A1.1",
                speaking_level="A1.1",
                grammar_level="A1.1",
                vocabulary_level="A1.1"
            )
            self.db.add(progress)
            await self.db.commit()
            await self.db.refresh(progress)
        return progress

    async def update_progress(self, progress: UserProgress) -> UserProgress:
        self.db.add(progress)
        await self.db.commit()
        await self.db.refresh(progress)
        return progress

    # --- Vocabulary ---
    async def get_all_vocabulary(self) -> list[Vocabulary]:
        result = await self.db.execute(select(Vocabulary).order_by(Vocabulary.german.asc()))
        return list(result.scalars().all())

    async def get_due_vocabulary(self) -> list[Vocabulary]:
        result = await self.db.execute(
            select(Vocabulary)
            .filter(Vocabulary.next_review <= date.today())
            .order_by(Vocabulary.box.asc())
        )
        return list(result.scalars().all())

    async def get_vocabulary_by_german(self, german: str) -> Vocabulary | None:
        result = await self.db.execute(select(Vocabulary).filter(Vocabulary.german == german))
        return result.scalars().first()

    async def get_vocabulary_count(self) -> int:
        result = await self.db.execute(select(func.count()).select_from(Vocabulary))
        return result.scalar() or 0

    async def get_due_vocabulary_count(self) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(Vocabulary)
            .filter(Vocabulary.next_review <= date.today())
        )
        return result.scalar() or 0

    async def add_vocabulary(self, word: Vocabulary) -> Vocabulary:
        self.db.add(word)
        await self.db.commit()
        await self.db.refresh(word)
        return word

    # --- MistakeLog ---
    async def get_all_mistakes(self) -> list[MistakeLog]:
        result = await self.db.execute(select(MistakeLog).order_by(MistakeLog.occurrence_count.desc()))
        return list(result.scalars().all())

    async def get_recent_mistakes(self, limit: int = 3) -> list[MistakeLog]:
        result = await self.db.execute(
            select(MistakeLog)
            .order_by(MistakeLog.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_mistake_by_text_and_category(self, incorrect_text: str, category: str) -> MistakeLog | None:
        result = await self.db.execute(
            select(MistakeLog)
            .filter(MistakeLog.incorrect_text == incorrect_text, MistakeLog.category == category)
        )
        return result.scalars().first()

    async def add_mistake(self, mistake: MistakeLog) -> MistakeLog:
        self.db.add(mistake)
        await self.db.commit()
        await self.db.refresh(mistake)
        return mistake

    # --- ChatMessage ---
    async def get_chat_messages(self, limit: int = 50) -> list[ChatMessage]:
        result = await self.db.execute(
            select(ChatMessage)
            .order_by(ChatMessage.timestamp.asc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def add_chat_message(self, message: ChatMessage) -> ChatMessage:
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def clear_chat_history(self) -> None:
        await self.db.execute(delete(ChatMessage))
        await self.db.commit()

    # --- HomeworkSubmission ---
    async def get_homework_history(self) -> list[HomeworkSubmission]:
        result = await self.db.execute(
            select(HomeworkSubmission)
            .order_by(HomeworkSubmission.created_at.desc())
        )
        return list(result.scalars().all())

    async def add_homework_submission(self, sub: HomeworkSubmission) -> HomeworkSubmission:
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
