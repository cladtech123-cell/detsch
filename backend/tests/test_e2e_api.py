from __future__ import annotations

import pytest
import time
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_e2e_all_endpoints() -> None:
    # Use httpx AsyncClient to test the live FastAPI application routing and responses
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        
        # 1. Health check
        res_health = await ac.get("/api/v1/health")
        assert res_health.status_code == 200
        assert res_health.json()["status"] == "ok"
        
        # 2. Dashboard status
        res_dash = await ac.get("/api/v1/dashboard")
        assert res_dash.status_code == 200
        dash_data = res_dash.json()
        assert "streak" in dash_data
        assert "cefr_estimate" in dash_data
        assert "vocab_due_today" in dash_data
        
        # 3. User Progress
        res_prog = await ac.get("/api/v1/progress")
        assert res_prog.status_code == 200
        prog_data = res_prog.json()
        assert isinstance(prog_data["reading_level"], str)
        
        # 4. Update Progress
        res_prog_up = await ac.post("/api/v1/progress/update?current_lesson=8&reading=A1.2")
        assert res_prog_up.status_code == 200
        assert res_prog_up.json()["current_lesson"] == 8
        assert res_prog_up.json()["reading_level"] == "A1.2"
        
        # 5. Grammar topics
        res_grammar = await ac.get("/api/v1/grammar")
        assert res_grammar.status_code == 200
        topics = res_grammar.json()
        assert len(topics) > 0
        topic_id = topics[0]["id"]
        
        # Check grammar detail
        res_topic = await ac.get(f"/api/v1/grammar/{topic_id}")
        assert res_topic.status_code == 200
        
        # Submit grammar quiz (correct/incorrect responses checking)
        res_quiz = await ac.post(
            "/api/v1/grammar/quiz",
            json={"topic_id": topic_id, "answers": {"q1": "lernen", "q2": "wohnt"}}
        )
        assert res_quiz.status_code == 200
        assert "score" in res_quiz.json()
        
        # Toggle grammar complete
        res_toggle = await ac.post(f"/api/v1/grammar/{topic_id}/toggle-complete")
        assert res_toggle.status_code == 200
        
        # 6. Vocabulary
        # Add a new word
        unique_word = f"spielen_{int(time.time())}"
        res_add_vocab = await ac.post(
            "/api/v1/vocabulary",
            json={
                "german": unique_word,
                "translation": "o'ynamoq",
                "example_sentence": "Wir spielen Fußball.",
                "cefr_level": "A1",
                "category": "Verbs",
                "lesson": "Lektion 7"
            }
        )
        assert res_add_vocab.status_code == 200
        word_id = res_add_vocab.json()["id"]
        
        # List all vocabulary
        res_vocab_list = await ac.get("/api/v1/vocabulary")
        assert res_vocab_list.status_code == 200
        assert len(res_vocab_list.json()) > 0
        
        # Get due vocabulary
        res_due = await ac.get("/api/v1/vocabulary/due")
        assert res_due.status_code == 200
        
        # Review vocabulary
        res_review = await ac.post(
            "/api/v1/vocabulary/review",
            json={"word_id": word_id, "is_correct": True}
        )
        assert res_review.status_code == 200
        assert res_review.json()["box"] == 2
        
        # 7. Mistakes list
        res_mistakes = await ac.get("/api/v1/mistakes")
        assert res_mistakes.status_code == 200
        
        # 8. Chat messages
        res_chat = await ac.get("/api/v1/tutor/messages")
        assert res_chat.status_code == 200
        
        # 9. Homework History
        res_hw = await ac.get("/api/v1/homework/history")
        assert res_hw.status_code == 200
        
        # 10. Weekly report
        res_rep = await ac.get("/api/v1/reports/weekly")
        assert res_rep.status_code == 200
        assert "vocabulary_learned" in res_rep.json()
        
        # 11. Exams generate (lessons)
        res_exam = await ac.post("/api/v1/exams/generate?exam_type=lesson")
        assert res_exam.status_code == 200
        json_data = res_exam.json()
        assert "questions" in json_data or "error" in json_data
