from __future__ import annotations

import pytest
import time
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import async_session_factory
from app.models.german import UserProgress
from sqlalchemy import select

@pytest.mark.asyncio
async def test_legacy_progress_validation() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Register a test user
        unique_id = int(time.time() * 1000)
        username = f"legacy_user_{unique_id}"
        email = f"legacy_user_{unique_id}@example.com"
        reg_res = await ac.post(
            "/api/v1/auth/register",
            json={"email": email, "username": username, "password": "testpassword"}
        )
        assert reg_res.status_code == 201

        # Log in to get the user ID and token
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"username": username, "password": "testpassword"}
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        user_id = login_res.json()["user"]["id"]

        # 2. Modify their progress row directly in DB to set fields to NULL (None)
        async with async_session_factory() as session:
            q = select(UserProgress).filter(UserProgress.user_id == user_id)
            res = await session.execute(q)
            progress = res.scalars().first()
            assert progress is not None
            
            # Explicitly force fields to NULL
            progress.completed_lessons = None
            progress.lesson_progress = None
            progress.completed_grammar_topics = None
            
            await session.commit()

        # Verify the database state has NULL
        async with async_session_factory() as session:
            res_check = await session.execute(
                select(
                    UserProgress.completed_lessons,
                    UserProgress.lesson_progress,
                    UserProgress.completed_grammar_topics
                ).filter(UserProgress.user_id == user_id)
            )
            row = res_check.first()
            assert row[0] is None
            assert row[1] is None
            assert row[2] is None

        # 3. Call GET /api/v1/progress as this legacy user
        ac.headers["Authorization"] = f"Bearer {token}"
        res_prog = await ac.get("/api/v1/progress")
        
        # Verify it succeeds (HTTP 200) instead of throwing ValidationError (HTTP 500)
        assert res_prog.status_code == 200
        
        # Verify the response JSON fields are normalized
        prog_data = res_prog.json()
        assert prog_data["completed_lessons"] == []
        assert prog_data["lesson_progress"] == {}
        assert prog_data["completed_grammar_topics"] == []

        # 4. Test updating progress on this user
        res_update = await ac.post("/api/v1/progress/update?current_lesson=8")
        assert res_update.status_code == 200
        
        # Verify that it returned normalized fields as well
        prog_data_updated = res_update.json()
        assert prog_data_updated["current_lesson"] == 8
        assert prog_data_updated["completed_lessons"] == []
        assert prog_data_updated["lesson_progress"] == {}
        assert prog_data_updated["completed_grammar_topics"] == []

        # Verify that the DB fields are updated/normalized (no longer NULL)
        async with async_session_factory() as session:
            res_check2 = await session.execute(
                select(
                    UserProgress.completed_lessons,
                    UserProgress.lesson_progress,
                    UserProgress.completed_grammar_topics
                ).filter(UserProgress.user_id == user_id)
            )
            row2 = res_check2.first()
            assert row2[0] == []
            assert row2[1] == {}
            assert row2[2] == []
