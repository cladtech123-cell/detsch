from __future__ import annotations

import hashlib
import hmac
import json
import re
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.core.config import settings
from app.core.dependencies import get_german_repo
from app.repositories.german import GermanRepository
from app.models.german import ExamResult
from app.schemas.german import ExamResultCreate, ExamResultSchema
from app.services.ai import get_ai_provider

router = APIRouter()


def validate_and_clean_questions(questions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    validated_questions = []
    for q in questions:
        if not isinstance(q, dict):
            raise ValueError("Question must be a dictionary")
        
        q_id = q.get("id")
        question_text = q.get("question")
        hint = q.get("hint")
        answer = q.get("answer")
        options = q.get("options", [])
        
        if not q_id or not question_text or not answer:
            raise ValueError("Missing required fields in question")
            
        answer = str(answer).strip()
        question_text = str(question_text).strip()
        
        # 1. Blank placeholder validation
        blank_match = re.search(r'_{3,}', question_text)
        if not blank_match:
            raise ValueError("Question must contain a blank placeholder like '___'")
            
        # 2. Answer format: blank never requires multiple words
        if len(answer.split()) > 1:
            raise ValueError("Answer must be a single word")
            
        # 3. Question consistency: if options are present, answer must be in options
        if options:
            cleaned_opts = [str(o).strip().lower() for o in options]
            if answer.lower() not in cleaned_opts:
                raise ValueError("Expected answer must be one of the options")
        
        validated_questions.append(q)
    return validated_questions




def generate_exam_signature(questions: list[dict[str, Any]]) -> str:
    """Generate a single HMAC-SHA256 signature for the entire set of questions to prevent tampering, adding, or deleting questions."""
    # Canonicalize by sorting questions by their ID
    sorted_questions = sorted(questions, key=lambda x: str(x.get("id", "")))

    # Create a canonical representation of the IDs and correct answers
    serialized_parts = []
    for q in sorted_questions:
        q_id = str(q.get("id", ""))
        q_ans = str(q.get("answer", ""))
        serialized_parts.append(f"{q_id}:{q_ans}")

    canonical_string = "|".join(serialized_parts)
    message = canonical_string.encode("utf-8")
    return hmac.new(settings.JWT_SECRET_KEY.encode("utf-8"), message, hashlib.sha256).hexdigest()


@router.post("/exams/generate", summary="Generate custom quiz/exam based on lesson or past mistakes")
async def generate_exam(
    exam_type: str = "lesson",
    repo: GermanRepository = Depends(get_german_repo)
):
    ai = get_ai_provider()
    prog = await repo.get_progress()
    lesson_name = f"Lektion {prog.current_lesson}"

    if exam_type == "mistakes":
        mistakes = await repo.get_all_mistakes()
        # limit to top 5
        mistakes = mistakes[:5]

        if not mistakes:
            raise HTTPException(
                status_code=400,
                detail="Tizimda hali xatoliklar qayd etilmagan. Avval AI Tutor yoki Uy ishi bo'limidan foydalaning!"
            )

        mistakes_str = "\n".join([
            f"- Wrong: {m.incorrect_text} | Correct: {m.corrected_text} | Why: {m.explanation}"
            for m in mistakes
        ])

        prompt = (
            f"Generate a customized German practice test targeting these common mistakes the student makes:\n"
            f"{mistakes_str}\n\n"
            f"Generate 5 fill-in-the-blank questions (each question MUST contain a blank represented by '_____'). Return the questions in JSON format with the fields:\n"
            f"- 'title': Title of the practice test.\n"
            f"- 'questions': list of objects, each with:\n"
            f"    * 'id': e.g., 'q1', 'q2'\n"
            f"    * 'question': the question prompt (German, with Uzbek instructions if needed, containing a blank represented by '_____')\n"
            f"    * 'hint': a hint explaining the rule (in Uzbek/English)\n"
            f"    * 'answer': the correct single-word answer expected\n"
            f"Return ONLY the valid, parsable JSON. No markdown tags."
        )
    elif exam_type == "cefr":
        prompt = (
            "Generate a mini CEFR A1 diagnostic exam. Consist of 5 multiple choice or fill-in-the-blank questions "
            "covering reading, grammar, and vocabulary.\n"
            "Return the questions in JSON format with fields:\n"
            "- 'title': 'CEFR A1 Diagnostic Test'\n"
            "- 'questions': list of objects with fields: 'id', 'question', 'hint', 'answer', 'options' (list of strings if multiple choice, else empty).\n"
            "Return ONLY the valid, parsable JSON. No markdown tags."
        )
    else:
        # Fetch lesson grammar context if available
        from app.models.german import CurriculumLesson
        from sqlalchemy import select
        book_code = prog.current_course.replace("Momente ", "")
        lesson_res = await repo.db.execute(
            select(CurriculumLesson).filter(
                CurriculumLesson.book_code == book_code,
                CurriculumLesson.number == prog.current_lesson
            )
        )
        curr_lesson = lesson_res.scalars().first()

        grammar_context = ""
        vocab_context = ""
        if curr_lesson:
            grammar_context = f"Grammar focus: {curr_lesson.grammar_title}. "
            vocab_words = [v.get("german", "") for v in (curr_lesson.vocabulary_json or [])[:6]]
            vocab_context = f"Key vocabulary for this lesson: {', '.join(vocab_words)}. "

        prompt = (
            f"Generate a German practice quiz for {lesson_name} of {prog.current_course}.\n"
            f"{grammar_context}{vocab_context}"
            f"Focus on practical use of lesson grammar and vocabulary.\n"
            f"Generate 5 questions mixing fill-in-the-blank and multiple choice. "
            f"Return the questions in JSON format with fields:\n"
            f"- 'title': '{lesson_name} Review Quiz'\n"
            f"- 'questions': list of objects with fields: 'id', 'question', 'hint', 'answer', 'options' (list of strings if multiple choice, else empty list).\n"
            f"Return ONLY the valid, parsable JSON. No markdown tags."
        )

    try:
        system_instruction = (
            "You are a strict, helpful German exam designer. Output JSON only.\n"
            "CRITICAL RULES for Fill-in-the-Blank questions:\n"
            "1. Every sentence must be grammatically correct German.\n"
            "2. Fill-in-the-blank questions must contain exactly one blank represented by at least 3 underscores (e.g., '_____').\n"
            "3. The expected answer key must be a single word (no spaces, no multiple words) and must fit the blank perfectly to form a grammatically correct sentence.\n"
            "4. Verbs (including modal verbs like können, müssen, sollen, wollen, dürfen, mögen) must be conjugated correctly according to the subject pronoun (ich, du, er/sie/es, wir, ihr, sie/Sie) in the sentence.\n"
            "5. The expected answer must not be included in the question text instead of the blank."
        )
        res = await ai.generate_content(
            prompt=prompt,
            system_instruction=system_instruction,
            json_mode=True
        )
        quiz_data = json.loads(res)
        if not isinstance(quiz_data, dict) or "questions" not in quiz_data:
            raise ValueError("Invalid quiz structure")
        quiz_data["questions"] = validate_and_clean_questions(quiz_data["questions"])
    except Exception:
        quiz_data = {
            "title": f"{lesson_name} Fallback Quiz",
            "questions": [
                {
                    "id": "q1",
                    "question": "Ich __________ (wohnen) in Taschkent.",
                    "hint": "Conjugate for 'ich'",
                    "answer": "wohne",
                    "options": []
                },
                {
                    "id": "q2",
                    "question": "Er __________ (haben) einen Hund.",
                    "hint": "Conjugate 'haben' for 'er'",
                    "answer": "hat",
                    "options": []
                },
                {
                    "id": "q3",
                    "question": "Wie __________ Sie? (heißen)",
                    "hint": "Formal form of 'heißen'",
                    "answer": "heißen",
                    "options": []
                },
                {
                    "id": "q4",
                    "question": "Wir __________ aus Deutschland. (kommen)",
                    "hint": "Conjugate 'kommen' for 'wir'",
                    "answer": "kommen",
                    "options": []
                },
                {
                    "id": "q5",
                    "question": "Das Kind __________ (spielen) im Garten.",
                    "hint": "3rd person singular present tense",
                    "answer": "spielt",
                    "options": []
                }
            ]
        }

    # Inject signature to each question to prevent payload tampering (all carry the same total exam signature)
    sig = generate_exam_signature(quiz_data.get("questions", []))
    for q in quiz_data.get("questions", []):
        if isinstance(q, dict):
            q["signature"] = sig

    return quiz_data


@router.post("/exams/submit", response_model=ExamResultSchema, summary="Save exam result to database")
async def submit_exam_result(
    payload: ExamResultCreate,
    repo: GermanRepository = Depends(get_german_repo)
):
    """Persists exam result to the database so history survives across sessions."""
    prog = await repo.get_progress()

    # Recalculate and verify the score from questions_json to ensure accuracy and prevent cheating
    questions_data = payload.questions_json or {}
    questions = questions_data.get("questions", [])
    user_answers = questions_data.get("answers", {})

    correct_count = 0
    total_questions = len(questions)

    if questions:
        # Extract signature from the first question
        signature = questions[0].get("signature", "")
        if not signature:
            raise HTTPException(
                status_code=400,
                detail="Invalid exam question structure or missing signature."
            )

        expected_sig = generate_exam_signature(questions)
        if not hmac.compare_digest(signature, expected_sig):
            raise HTTPException(
                status_code=400,
                detail="Exam integrity check failed. Modified, added, or deleted questions detected."
            )

    for q in questions:
        q_id = q.get("id")
        user_ans = user_answers.get(q_id, "")
        correct_ans = q.get("answer", "")
        if isinstance(user_ans, str) and isinstance(correct_ans, str):
            if user_ans.strip().lower() == correct_ans.strip().lower():
                correct_count += 1
        elif user_ans == correct_ans:
            correct_count += 1

    import math
    score = 0
    if total_questions > 0:
        score = int(math.floor(((correct_count / total_questions) * 100) + 0.5))

    result = ExamResult(
        exam_type=payload.exam_type,
        title=payload.title,
        score=score,
        correct_count=correct_count,
        total_questions=total_questions,
        lesson_number=payload.lesson_number if payload.lesson_number is not None else prog.current_lesson,
        time_taken_seconds=payload.time_taken_seconds,
        questions_json=payload.questions_json,
    )
    saved = await repo.save_exam_result(result)

    # Also log a study session for XP tracking
    from app.models.german import StudySession
    from datetime import date
    xp = max(10, int(score * 0.6))  # Up to 60 XP for perfect score
    session = StudySession(
        session_date=date.today(),
        activity_type="exam",
        xp_earned=xp,
        duration_minutes=max(1, payload.time_taken_seconds // 60),
        lesson_number=saved.lesson_number,
    )
    await repo.log_study_session(session)

    return ExamResultSchema.from_orm(saved)


@router.get("/exams/history", response_model=list[ExamResultSchema], summary="Get exam history from database")
async def get_exam_history(
    limit: int = 20,
    repo: GermanRepository = Depends(get_german_repo)
):
    """Returns the user's exam history ordered by most recent first."""
    results = await repo.get_exam_history(limit=limit)
    return [ExamResultSchema.from_orm(r) for r in results]
