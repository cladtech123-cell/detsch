from __future__ import annotations

import json
from datetime import date, timedelta
from typing import Any

from sqlalchemy import select

from app.models.german import (
    ChatMessage,
    HomeworkSubmission,
    MistakeLog,
    Vocabulary,
)
from app.repositories.german import GermanRepository
from app.services.ai import get_ai_provider


class GermanService:
    def __init__(self, repository: GermanRepository):
        self.repo = repository

    async def get_dashboard_data(self) -> dict[str, Any]:
        progress = await self.repo.get_progress()
        vocab_total = await self.repo.get_vocabulary_count()
        vocab_due_today = await self.repo.get_due_vocabulary_count()
        grammar_completed = await self.repo.get_completed_grammar_count()
        grammar_total = await self.repo.get_total_grammar_count()
        recent_mistakes = await self.repo.get_recent_mistakes(limit=3)

        today_tasks = []
        if vocab_due_today > 0:
            today_tasks.append(f"Qaytarish uchun {vocab_due_today} ta so'z bor (Spaced Repetition)")
        else:
            today_tasks.append("Barcha so'zlar qaytarilgan! Yangi so'zlar qo'shing.")

        if grammar_completed < grammar_total:
            today_tasks.append("Grammatika kutubxonasidagi keyingi mavzuni o'rganing")
        else:
            today_tasks.append("Tabriklaymiz! Hamma grammatika mavzulari yakunlandi.")

        today_tasks.append(f"Kutubxonadagi Lektion {progress.current_lesson} bo'yicha gapirish mashqini bajaring")

        # CEFR average calculation
        levels = [
            progress.reading_level,
            progress.listening_level,
            progress.writing_level,
            progress.speaking_level,
            progress.grammar_level,
            progress.vocabulary_level
        ]
        level_map = {"A0": 0, "A1.1": 15, "A1.2": 30, "A2.1": 45, "A2.2": 60, "B1.1": 75, "B1.2": 85, "B2": 100}
        numeric_levels = [level_map.get(lvl, 15) for lvl in levels]
        avg_progress = int(sum(numeric_levels) / len(numeric_levels))

        if avg_progress < 15:
            cefr_estimate = "A0"
        elif avg_progress < 30:
            cefr_estimate = "A1.1"
        elif avg_progress < 45:
            cefr_estimate = "A1.2"
        elif avg_progress < 60:
            cefr_estimate = "A2.1"
        elif avg_progress < 75:
            cefr_estimate = "A2.2"
        elif avg_progress < 85:
            cefr_estimate = "B1.1"
        elif avg_progress < 100:
            cefr_estimate = "B1.2"
        else:
            cefr_estimate = "B2"

        return {
            "streak": progress.study_streak,
            "current_lesson": f"{progress.current_course} - Lektion {progress.current_lesson}",
            "cefr_estimate": cefr_estimate,
            "progress_percentage": avg_progress,
            "vocab_total": vocab_total,
            "vocab_due_today": vocab_due_today,
            "grammar_completed": grammar_completed,
            "grammar_total": grammar_total,
            "weekly_goal_progress": 4.5 / progress.weekly_goal_hours,
            "today_tasks": today_tasks,
            "recent_mistakes": recent_mistakes
        }

    async def process_chat(self, user_content: str) -> tuple[ChatMessage, str]:
        # Save user message
        user_msg = ChatMessage(role="user", content=user_content)
        await self.repo.add_chat_message(user_msg)

        # Retrieve chat history for context
        history = await self.repo.get_chat_messages(limit=8)
        # Exclude current user message for Gemini prompt formatting
        history_formatted = [
            {"role": m.role, "content": m.content} for m in history if m.id != user_msg.id
        ]

        progress = await self.repo.get_progress()
        course_context = f"Course: {progress.current_course}, Lesson: Lektion {progress.current_lesson}, Target: {progress.target_level}"
        ai = get_ai_provider(provider_name=progress.ai_provider, model_name=progress.ai_model)

        # Check grammar mistakes asynchronously via AI
        analysis_prompt = (
            f"Analyze this German input: \"{user_content}\". Check for mistakes. "
            f"Return JSON: {{'has_mistake': bool, 'category': str, 'incorrect_text': str, 'corrected_text': str, 'explanation': str}} (explanation in Uzbek)."
        )
        try:
            analysis_res = await ai.generate_content(prompt=analysis_prompt, json_mode=True)
            analysis_data = json.loads(analysis_res)
            if analysis_data.get("has_mistake") is True:
                inc = analysis_data["incorrect_text"]
                cat = analysis_data["category"]

                existing = await self.repo.get_mistake_by_text_and_category(inc, cat)
                if existing:
                    existing.occurrence_count += 1
                    await self.repo.update_progress(progress) # trigger save
                else:
                    mistake = MistakeLog(
                        category=cat,
                        incorrect_text=inc,
                        corrected_text=analysis_data["corrected_text"],
                        explanation=analysis_data["explanation"],
                        lesson=f"Lektion {progress.current_lesson}"
                    )
                    await self.repo.add_mistake(mistake)
        except Exception:
            pass

        # Generate conversational response
        system_instruction = (
            f"You are a strict, helpful German Language Tutor. The user is Dean. "
            f"Context: {course_context}. "
            f"RULES:\n"
            f"1. Speak German. A1-A2 levels.\n"
            f"2. Correct errors first in German and explain rules in Uzbek (with English fallback).\n"
            f"3. Keep responses under 4 sentences."
        )

        tutor_reply = await ai.chat_response(
            history=history_formatted,
            message=user_content,
            system_instruction=system_instruction
        )

        tutor_msg = ChatMessage(role="assistant", content=tutor_reply)
        await self.repo.add_chat_message(tutor_msg)
        
        # Get actual provider name and model after execution/failovers
        provider_info = "Powered by Gemini • gemini-2.0-flash"
        if hasattr(ai, "get_active_provider_info"):
            provider_info = ai.get_active_provider_info()
            
        return tutor_msg, provider_info

    async def process_vocab_review(self, word_id: int, is_correct: bool) -> Vocabulary:
        word_res = await self.repo.db.execute(select(Vocabulary).filter(Vocabulary.id == word_id))
        word = word_res.scalars().first()
        if not word:
            raise ValueError("Word not found")

        word.times_reviewed += 1
        box_intervals = {1: 1, 2: 3, 3: 7, 4: 14, 5: 30}

        if is_correct:
            if word.box < 5:
                word.box += 1
            word.interval_days = box_intervals[word.box]
            word.ease_factor = min(word.ease_factor + 0.15, 3.0)
        else:
            word.box = 1
            word.interval_days = box_intervals[1]
            word.ease_factor = max(word.ease_factor - 0.2, 1.3)

        word.next_review = date.today() + timedelta(days=word.interval_days)
        await self.repo.db.commit()
        return word

    async def grade_homework(self, title: str, raw_content: str, file_type: str) -> HomeworkSubmission:
        ai = get_ai_provider()
        progress = await self.repo.get_progress()
        lesson_context = f"Lektion {progress.current_lesson}"

        prompt = (
            f"Grade this German homework out of 100:\n\"{raw_content}\"\n\n"
            f"Return JSON: {{'score': int, 'feedback': str, 'corrections': [{{'incorrect_segment': str, 'corrected_segment': str, 'explanation_uz': str, 'explanation_en': str, 'category': str}}]}}"
        )

        try:
            grading_res = await ai.generate_content(prompt=prompt, json_mode=True)
            grading_data = json.loads(grading_res)
        except Exception:
            grading_data = {
                "score": 70,
                "corrections": [],
                "feedback": "Faylni baholashda AI xatosi yuz berdi. Iltimos qayta urinib ko'ring."
            }

        # Log mistakes
        for corr in grading_data.get("corrections", []):
            inc = corr.get("incorrect_segment", "").strip()
            cor = corr.get("corrected_segment", "").strip()
            cat = corr.get("category", "grammar").strip()
            expl = f"{corr.get('explanation_uz', '')} | {corr.get('explanation_en', '')}"

            if inc and cor:
                existing = await self.repo.get_mistake_by_text_and_category(inc, cat)
                if existing:
                    existing.occurrence_count += 1
                else:
                    mistake = MistakeLog(
                        category=cat,
                        incorrect_text=inc,
                        corrected_text=cor,
                        explanation=expl,
                        lesson=lesson_context
                    )
                    await self.repo.add_mistake(mistake)

        sub = HomeworkSubmission(
            title=title,
            file_type=file_type,
            raw_content=raw_content,
            corrections_json=grading_data,
            score=grading_data.get("score", 0)
        )
        return await self.repo.add_homework_submission(sub)
