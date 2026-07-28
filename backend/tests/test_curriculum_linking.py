from __future__ import annotations

import pytest
import time
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import get_db
from app.core.dependencies import get_german_repo
from app.models.german import Vocabulary, GrammarTopic
from sqlalchemy import select

@pytest.mark.asyncio
async def test_curriculum_linking_endpoints() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Register a test user
        unique_id = int(time.time() * 1000)
        username = f"user_curr_{unique_id}"
        email = f"user_curr_{unique_id}@example.com"
        reg_res = await ac.post(
            "/api/v1/auth/register",
            json={"email": email, "username": username, "password": "testpassword"}
        )
        assert reg_res.status_code == 201

        # Log in
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"username": username, "password": "testpassword"}
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        ac.headers["Authorization"] = f"Bearer {token}"

        # 1. Fetch curriculum books
        res_books = await ac.get("/api/v1/curriculum/books")
        assert res_books.status_code == 200
        assert len(res_books.json()) > 0

        # 2. Fetch all curriculum lessons (this should trigger check_and_seed_grammar and ensure_user_vocabulary_seeded)
        res_lessons = await ac.get("/api/v1/curriculum/lessons")
        assert res_lessons.status_code == 200
        lessons = res_lessons.json()
        assert len(lessons) > 0

        # Let's inspect Lektion 1 (index 0)
        lesson_1 = lessons[0]
        assert lesson_1["number"] == 1
        
        # Check that vocabulary is returned from database (which should have been auto-seeded)
        vocab = lesson_1["vocabulary_json"]
        assert len(vocab) > 0
        assert any(item["german"] == "hallo" for item in vocab)

        # Check grammar topics
        # Since check_and_seed_grammar ran, we should have grammar_title containing the database-seeded grammar topic
        assert "Personalpronomen" in lesson_1["grammar_title"]
        assert "Hilfsverben" in lesson_1["grammar_title"]
        assert "W-Fragen" in lesson_1["grammar_title"]
        
        # 3. Test retrieving a single lesson
        res_single = await ac.get("/api/v1/curriculum/lessons/A1.1/1")
        assert res_single.status_code == 200
        single_lesson = res_single.json()
        assert single_lesson["number"] == 1
        assert len(single_lesson["vocabulary_json"]) > 0
        assert "Personalpronomen" in single_lesson["grammar_title"]
