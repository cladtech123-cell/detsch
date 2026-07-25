from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter, Depends

from app.core.dependencies import get_german_repo
from app.repositories.german import GermanRepository
from app.schemas.german import MistakeSchema, WeeklyReportData

router = APIRouter()


@router.get("/mistakes", response_model=list[MistakeSchema], summary="List all logged student mistakes")
async def list_mistakes(repo: GermanRepository = Depends(get_german_repo)):
    mistakes = await repo.get_all_mistakes()
    return [MistakeSchema.from_orm(m) for m in mistakes]


@router.get("/reports/weekly", response_model=WeeklyReportData, summary="Generate weekly progress report in Uzbek")
async def generate_weekly_report(repo: GermanRepository = Depends(get_german_repo)):
    one_week_ago = date.today() - timedelta(days=7)

    vocab_count = await repo.get_vocabulary_count()
    completed_topics = await repo.get_all_grammar_topics()
    completed_titles = [t.title for t in completed_topics if t.is_completed]

    recent_mistakes = await repo.get_all_mistakes()
    # top 3
    recent_mistakes = recent_mistakes[:3]
    frequent_mistakes = [
        {
            "category": m.category,
            "wrong": m.incorrect_text,
            "right": m.corrected_text,
            "explanation": m.explanation,
            "count": m.occurrence_count
        }
        for m in recent_mistakes
    ]

    progress = await repo.get_progress()
    estimated_level = progress.grammar_level

    strengths = []
    weaknesses = []
    recommendations = []

    if len(completed_titles) > 0:
        strengths.append(f"Tarkibiy grammatika bo'yicha yaxshi natija: {', '.join(completed_titles)}")
    else:
        weaknesses.append("Ushbu haftada yangi grammatika darslari yakunlanmadi.")

    if vocab_count > 0:
        strengths.append(f"Lug'at bazangiz kengaymoqda ({vocab_count} ta faol so'z).")
    else:
        weaknesses.append("Lug'at zaxirasini boyitish ustida ishlash kerak.")

    if len(frequent_mistakes) > 0:
        categories = {str(m["category"]) for m in frequent_mistakes}
        weaknesses.append(f"Quyidagi mavzularda xatolar qayd etildi: {', '.join(categories)}")
        for m in frequent_mistakes:
            recommendations.append(f"\"{m['wrong']}\" xatosini tuzatish uchun \"{m['right']}\" shaklini va qoidasini takrorlang.")
    else:
        strengths.append("Hafta davomida xatolar kam qayd etildi. Ajoyib ko'rsatkich!")
        recommendations.append("Yangi darsga o'tish orqali qiyinchilik darajasini oshiring (+10% qiyinlik).")

    recommendations.append("Lug'at kartalarini har kuni takrorlang (Spaced Repetition).")
    recommendations.append("AI Tutor bilan kuniga 10 daqiqa yozma muloqot mashqini bajaring.")

    return WeeklyReportData(
        start_date=one_week_ago,
        end_date=date.today(),
        topics_completed=completed_titles,
        vocabulary_learned=vocab_count,
        grammar_mastered=completed_titles,
        frequent_mistakes=frequent_mistakes,
        estimated_level=estimated_level,
        recommendations=recommendations
    )
