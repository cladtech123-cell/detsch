from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.german import GermanRepository
from app.services.german_service import GermanService


async def get_german_repo(db: AsyncSession = Depends(get_db)) -> GermanRepository:
    """FastAPI dependency yielding a GermanRepository instance."""
    return GermanRepository(db)


async def get_german_service(repo: GermanRepository = Depends(get_german_repo)) -> GermanService:
    """FastAPI dependency yielding a GermanService instance."""
    return GermanService(repo)
