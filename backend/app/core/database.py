"""Database engine and session management (SQLAlchemy 2.x async).

The engine is created here; table creation is intentionally deferred to a
later phase (migrations / `create_all`). Phase 1 only wires the engine so
the app boots and the dependency is importable.
"""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator
from pathlib import Path

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import BACKEND_ROOT, settings


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""

    pass


def _ensure_sqlite_dir() -> None:
    """Make sure the SQLite data directory exists for the local file DB."""
    if settings.DATABASE_URL.startswith("sqlite"):
        db_part = settings.DATABASE_URL.split("///")[-1]
        db_path = db_part.replace("///", "/")
        # Resolve relative to backend root if not absolute
        if not os.path.isabs(db_path):
            db_path = str(BACKEND_ROOT / db_path)
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)


_ensure_sqlite_dir()

# Create the async engine. SQLite uses NullPool-friendly defaults; for SQLite
# we disable `check_same_thread` to allow async usage.
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG and False,  # set True to log SQL
    future=True,
    connect_args=connect_args,
)

# Session factory bound to the engine.
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an async DB session."""
    async with async_session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
