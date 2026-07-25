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
