from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_german_repo
from app.repositories.german import GermanRepository
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
        prompt = (
            f"Generate a German practice quiz for {lesson_name} of Momente A1.1.\n"
            f"Focus on present tense conjugation and basic accusative objects.\n"
            f"Generate 5 questions. Return the questions in JSON format with fields:\n"
            f"- 'title': f'{lesson_name} Review Quiz'\n"
            f"- 'questions': list of objects with fields: 'id', 'question', 'hint', 'answer'.\n"
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
            "title": "Fallback A1 German Quiz",
            "questions": [
                {
                    "id": "q1",
                    "question": "Ich __________ (wohnen) in Tashkent.",
                    "hint": "Conjugate for 'ich'",
                    "answer": "wohne"
                },
                {
                    "id": "q2",
                    "question": "Er __________ (haben) einen Hund.",
                    "hint": "Conjugate 'haben' for 'er'",
                    "answer": "hat"
                }
            ]
        }
