from __future__ import annotations

from datetime import date

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.models.german import Base, MistakeLog, Vocabulary
from app.repositories.german import GermanRepository


@pytest.mark.asyncio
async def test_german_repository_operations() -> None:
    # Setup clean in-memory database for testing
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        repo = GermanRepository(session)

        # 1. Test get_progress (triggers auto-seeding if empty)
        progress = await repo.get_progress()
        assert progress.id == 1
        assert progress.current_course == "Momente A1.1"
        assert progress.current_lesson == 7

        # 2. Test add_vocabulary
        word = Vocabulary(
            german="wohnen",
            translation="yashamoq",
            example_sentence="Ich wohne in Taschkent.",
            cefr_level="A1",
            lesson="Lektion 7",
            category="Verbs",
            next_review=date.today()
        )
        await repo.add_vocabulary(word)

        # Test count
        count = await repo.get_vocabulary_count()
        assert count == 1

        # Test search
        word_found = await repo.get_vocabulary_by_german("wohnen")
        assert word_found is not None
        assert word_found.translation == "yashamoq"

        # 3. Test add_mistake
        mistake = MistakeLog(
            category="grammar",
            incorrect_text="Ich wohnen",
            corrected_text="Ich wohne",
            explanation="Tuslash xatosi",
            lesson="Lektion 7"
        )
        await repo.add_mistake(mistake)

        mistakes = await repo.get_all_mistakes()
        assert len(mistakes) == 1
        assert mistakes[0].incorrect_text == "Ich wohnen"

    await engine.dispose()


@pytest.mark.asyncio
async def test_study_streak_updates() -> None:
    from datetime import date, timedelta
    from app.models.german import StudySession

    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        repo = GermanRepository(session, user_id=1)

        # 1. Initially streak should be 0
        progress = await repo.get_progress()
        assert progress.study_streak == 0
        assert progress.last_study_date is None

        # 2. Log first study session today -> streak becomes 1
        session1 = StudySession(
            session_date=date.today(),
            activity_type="ai_tutor",
            xp_earned=15,
            duration_minutes=2,
        )
        await repo.log_study_session(session1)
        
        progress = await repo.get_progress()
        assert progress.study_streak == 1
        assert progress.last_study_date == date.today()

        # 3. Log another session today -> streak remains 1
        session2 = StudySession(
            session_date=date.today(),
            activity_type="vocab",
            xp_earned=10,
            duration_minutes=1,
        )
        await repo.log_study_session(session2)
        
        progress = await repo.get_progress()
        assert progress.study_streak == 1

        # 4. Simulate consecutive day (mock last_study_date to yesterday)
        progress.last_study_date = date.today() - timedelta(days=1)
        repo.db.add(progress)
        await repo.db.commit()

        session3 = StudySession(
            session_date=date.today(),
            activity_type="exam",
            xp_earned=60,
            duration_minutes=5,
        )
        await repo.log_study_session(session3)
        
        progress = await repo.get_progress()
        assert progress.study_streak == 2
        assert progress.last_study_date == date.today()

        # 5. Simulate gap in study (mock last_study_date to 3 days ago)
        progress.last_study_date = date.today() - timedelta(days=3)
        repo.db.add(progress)
        await repo.db.commit()

        session4 = StudySession(
            session_date=date.today(),
            activity_type="lesson",
            xp_earned=30,
            duration_minutes=5,
        )
        await repo.log_study_session(session4)
        
        progress = await repo.get_progress()
        assert progress.study_streak == 1
        assert progress.last_study_date == date.today()

    await engine.dispose()
