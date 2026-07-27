from __future__ import annotations

import json
from datetime import date, timedelta
from typing import Any

from sqlalchemy import select

from app.models.german import (
    ChatMessage,
    CurriculumLesson,
    HomeworkSubmission,
    MistakeLog,
    StudySession,
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

        # Get completion percentage of the current lesson
        lesson_progress_dict = progress.lesson_progress or {}
        curr_lesson_str = str(progress.current_lesson)
        curr_lesson_completions = lesson_progress_dict.get(curr_lesson_str, {})
        completed_count = sum(1 for completed in curr_lesson_completions.values() if completed)
        lesson_progress_pct = int((completed_count / 10) * 100) if completed_count > 0 else 0

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

        weekly_study_hours = await self.repo.get_weekly_study_hours()
        weekly_goal_progress = weekly_study_hours / max(0.1, progress.weekly_goal_hours)
        today_xp = await self.repo.get_today_xp()

        return {
            "streak": progress.study_streak,
            "current_lesson": f"{progress.current_course} - Lektion {progress.current_lesson}",
            "cefr_estimate": cefr_estimate,
            "progress_percentage": lesson_progress_pct,  # Now represents current lesson completion percentage
            "vocab_total": vocab_total,
            "vocab_due_today": vocab_due_today,
            "grammar_completed": grammar_completed,
            "grammar_total": grammar_total,
            "weekly_goal_progress": weekly_goal_progress,
            "today_tasks": today_tasks,
            "recent_mistakes": recent_mistakes,
            "today_xp": today_xp
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

        # --- Fetch curriculum lesson context for AI enrichment ---
        book_code = progress.current_course.replace("Momente ", "")
        lesson_res = await self.repo.db.execute(
            select(CurriculumLesson).filter(
                CurriculumLesson.book_code == book_code,
                CurriculumLesson.number == progress.current_lesson
            )
        )
        curr_lesson = lesson_res.scalars().first()

        vocab_context = ""
        grammar_context = ""
        speaking_topic_context = ""
        if curr_lesson:
            vocab_words = [v.get("german", "") for v in (curr_lesson.vocabulary_json or [])[:10] if v.get("german")]
            if vocab_words:
                vocab_context = f"Current lesson vocabulary to practice: {', '.join(vocab_words)}. "
            if curr_lesson.grammar_title:
                grammar_context = (
                    f"Grammar focus: {curr_lesson.grammar_title}. "
                    f"Rule: {curr_lesson.grammar_explanation[:250]}. "
                )
            if curr_lesson.speaking_topic:
                speaking_topic_context = f"Suggested speaking topic: {curr_lesson.speaking_topic}. "

        # --- Get recent mistake patterns ---
        recent_mistakes = await self.repo.get_recent_mistakes(limit=3)
        mistake_context = ""
        if recent_mistakes:
            mistake_patterns = [
                f'{m.category}: "{m.incorrect_text}" → "{m.corrected_text}"'
                for m in recent_mistakes
            ]
            mistake_context = f"Watch for these recurring mistakes: {'; '.join(mistake_patterns)}. "

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
                    await self.repo.update_progress(progress)  # trigger save
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

        # --- Build curriculum-aware system instruction ---
        system_instruction = (
            f"You are an expert, warm but pedagogically strict German Language Tutor. "
            f"You are teaching Momente {progress.current_course}, Lektion {progress.current_lesson}. "
            f"{grammar_context}"
            f"{vocab_context}"
            f"{speaking_topic_context}"
            f"{mistake_context}"
            f"CRITICAL RULES:\n"
            f"1. Always respond primarily in German at A1-A2 level appropriate for a beginner.\n"
            f"2. When the student makes a grammar or vocabulary mistake, IMMEDIATELY correct it in German and then explain the rule clearly in Uzbek (with English in parentheses as fallback).\n"
            f"3. Keep responses focused and under 4-5 sentences.\n"
            f"4. Actively encourage the student to use the current lesson's vocabulary and practice the grammar topic.\n"
            f"5. Be encouraging - celebrate correct usage and small wins."
        )

        tutor_reply = await ai.chat_response(
            history=history_formatted,
            message=user_content,
            system_instruction=system_instruction
        )

        tutor_msg = ChatMessage(role="assistant", content=tutor_reply)
        await self.repo.add_chat_message(tutor_msg)

        # Log AI tutor study session
        session = StudySession(
            session_date=date.today(),
            activity_type="ai_tutor",
            xp_earned=15,
            duration_minutes=1,
            lesson_number=progress.current_lesson,
        )
        await self.repo.log_study_session(session)

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
            word.mastery_percentage = min(100, word.mastery_percentage + 20)
        else:
            word.box = 1
            word.interval_days = box_intervals[1]
            word.ease_factor = max(word.ease_factor - 0.2, 1.3)
            word.mistake_count = word.mistake_count + 1
            word.mastery_percentage = max(0, word.mastery_percentage - 10)

        word.next_review = date.today() + timedelta(days=word.interval_days)
        await self.repo.db.commit()

        # Log vocab review study session
        progress = await self.repo.get_progress()
        session = StudySession(
            session_date=date.today(),
            activity_type="vocab",
            xp_earned=10 if is_correct else 2,
            duration_minutes=1,
            lesson_number=progress.current_lesson,
        )
        await self.repo.log_study_session(session)

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
