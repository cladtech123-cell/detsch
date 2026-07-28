from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_german_repo
from app.repositories.german import GermanRepository
from app.models.german import ExamResult
from app.schemas.german import ExamResultCreate, ExamResultSchema
from app.services.ai import get_ai_provider

router = APIRouter()


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
            f"Generate 5 fill-in-the-blank or correction questions. Return the questions in JSON format with the fields:\n"
            f"- 'title': Title of the practice test.\n"
            f"- 'questions': list of objects, each with:\n"
            f"    * 'id': e.g., 'q1', 'q2'\n"
            f"    * 'question': the question prompt (German, with Uzbek instructions if needed)\n"
            f"    * 'hint': a hint explaining the rule (in Uzbek/English)\n"
            f"    * 'answer': the correct answer expected\n"
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
        res = await ai.generate_content(
            prompt=prompt,
            system_instruction="You are a strict, helpful German exam designer. Output JSON only.",
            json_mode=True
        )
        quiz_data = json.loads(res)
        return quiz_data
    except Exception:
        return {
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
