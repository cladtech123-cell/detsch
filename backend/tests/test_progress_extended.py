from __future__ import annotations

import pytest
import time
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_extended_progress_tracking() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Register user A
        unique_id = int(time.time() * 1000)
        username_a = f"usera_{unique_id}"
        email_a = f"usera_{unique_id}@example.com"
        reg_a = await ac.post(
            "/api/v1/auth/register",
            json={"email": email_a, "username": username_a, "password": "testpassword"}
        )
        assert reg_a.status_code == 201

        # Register user B
        username_b = f"userb_{unique_id}"
        email_b = f"userb_{unique_id}@example.com"
        reg_b = await ac.post(
            "/api/v1/auth/register",
            json={"email": email_b, "username": username_b, "password": "testpassword"}
        )
        assert reg_b.status_code == 201

        # Log in User A
        login_a = await ac.post(
            "/api/v1/auth/login",
            json={"username": username_a, "password": "testpassword"}
        )
        assert login_a.status_code == 200
        token_a = login_a.json()["access_token"]

        # Log in User B
        login_b = await ac.post(
            "/api/v1/auth/login",
            json={"username": username_b, "password": "testpassword"}
        )
        assert login_b.status_code == 200
        token_b = login_b.json()["access_token"]

        # --- Test independent lesson completions and section checks ---
        # Call for User A
        ac.headers["Authorization"] = f"Bearer {token_a}"
        
        # Complete section "einstieg" for Lektion 7
        res_sec_a = await ac.post("/api/v1/progress/lesson/section?lesson_number=7&section_name=einstieg")
        assert res_sec_a.status_code == 200
        prog_a = res_sec_a.json()
        assert prog_a["lesson_progress"]["7"]["einstieg"] is True

        # Call for User B
        ac.headers["Authorization"] = f"Bearer {token_b}"
        res_sec_b = await ac.get("/api/v1/progress")
        assert res_sec_b.status_code == 200
        prog_b = res_sec_b.json()
        # User B should have default einstieg: True for Lektion 7 by default seed
        assert prog_b["lesson_progress"]["7"]["einstieg"] is True
        
        # Let's test a section that is NOT seeded by default, like "hoeren"
        # User A completes "hoeren" on Lektion 7
        ac.headers["Authorization"] = f"Bearer {token_a}"
        res_hoeren_a = await ac.post("/api/v1/progress/lesson/section?lesson_number=7&section_name=hoeren")
        assert res_hoeren_a.status_code == 200
        assert res_hoeren_a.json()["lesson_progress"]["7"]["hoeren"] is True

        # Check that User B does NOT have "hoeren" completed
        ac.headers["Authorization"] = f"Bearer {token_b}"
        res_get_b = await ac.get("/api/v1/progress")
        assert "hoeren" not in res_get_b.json()["lesson_progress"]["7"]

        # Check total_xp is present in progress response (defaults to 0 initially)
        assert res_get_b.json()["total_xp"] == 0

        # Log a study session for User B (earning 30 XP)
        log_res = await ac.post("/api/v1/progress/log-session", json={
            "activity_type": "lesson",
            "xp_earned": 30,
            "duration_minutes": 5,
            "lesson_number": 7
        })
        assert log_res.status_code == 200
        
        # Check total_xp is now 30
        res_get_b2 = await ac.get("/api/v1/progress")
        assert res_get_b2.json()["total_xp"] == 30

        # Test duplicate completion of "einstieg" section for User B (which is default seeded)
        dup_res = await ac.post("/api/v1/progress/lesson/section?lesson_number=7&section_name=einstieg")
        assert dup_res.status_code == 200

        # Test lesson auto-advancement when completing all remaining sections of Lektion 7 for User B.
        sections_to_complete = ["hoeren", "lesen", "schreiben", "sprechen", "quiz", "uebungen", "wiederholung"]
        for sec in sections_to_complete:
            sec_res = await ac.post(f"/api/v1/progress/lesson/section?lesson_number=7&section_name={sec}")
            assert sec_res.status_code == 200
        
        # User B completed all 10 sections of Lektion 7, current_lesson should auto-advance to 8
        final_prog_b = await ac.get("/api/v1/progress")
        assert final_prog_b.json()["current_lesson"] == 8

        # --- Test independent grammar completions ---
        # Fetch topics for User A
        ac.headers["Authorization"] = f"Bearer {token_a}"
        res_g_a = await ac.get("/api/v1/grammar")
        assert res_g_a.status_code == 200
        grammar_list = res_g_a.json()
        topic_id = grammar_list[0]["id"]

        # Toggle complete for User A
        res_toggle_a = await ac.post(f"/api/v1/grammar/{topic_id}/toggle-complete")
        assert res_toggle_a.status_code == 200
        assert res_toggle_a.json()["is_completed"] is True

        # User B lists grammar topics, this topic should be is_completed == False
        ac.headers["Authorization"] = f"Bearer {token_b}"
        res_g_b = await ac.get("/api/v1/grammar")
        assert res_g_b.json()[0]["is_completed"] is False
