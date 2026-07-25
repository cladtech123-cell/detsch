from __future__ import annotations

from datetime import date

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.models.german import Base, Vocabulary
from app.repositories.german import GermanRepository
from app.services.german_service import GermanService


@pytest.mark.asyncio
async def test_leitner_box_spaced_repetition_logic() -> None:
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        repo = GermanRepository(session)
        service = GermanService(repo)

        # Create a test word
        word = Vocabulary(
            german="sprechen",
            translation="gapirmoq",
            example_sentence="Ich spreche Deutsch.",
            cefr_level="A1",
            lesson="Lektion 7",
            category="Verbs",
            box=1,
            interval_days=1,
            next_review=date.today()
        )
        await repo.add_vocabulary(word)

        # 1. Review correct -> should move to Box 2
        updated_word = await service.process_vocab_review(word.id, is_correct=True)
        assert updated_word.box == 2
        assert updated_word.interval_days == 3
        assert updated_word.next_review > date.today()

        # 2. Review correct again -> should move to Box 3
        updated_word = await service.process_vocab_review(word.id, is_correct=True)
        assert updated_word.box == 3
        assert updated_word.interval_days == 7

        # 3. Review incorrect -> should reset to Box 1
        updated_word = await service.process_vocab_review(word.id, is_correct=False)
        assert updated_word.box == 1
        assert updated_word.interval_days == 1

    await engine.dispose()
