from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete

from app.core.dependencies import get_german_repo
from app.models.german import GrammarTopic
from app.repositories.german import GermanRepository
from app.schemas.german import GrammarQuizSubmit, GrammarTopicSchema
from app.core.grammar_seed import SEED_GRAMMAR_TOPICS

router = APIRouter()


async def check_and_seed_grammar(repo: GermanRepository):
    """Seed grammar topics if database table count does not match the full seed list."""
    count = await repo.get_total_grammar_count()
    if count == len(SEED_GRAMMAR_TOPICS):
        return

    # Clear old placeholders to prevent duplicates
    await repo.db.execute(delete(GrammarTopic))
    await repo.db.commit()

    for t in SEED_GRAMMAR_TOPICS:
        new_topic = GrammarTopic(
            title=t.title,
            lesson=t.lesson,
            explanation_uz=t.explanation_uz,
            explanation_en=t.explanation_en,
            examples_json=t.examples_json,
            common_mistakes_json=t.common_mistakes_json,
            practice_questions_json=t.practice_questions_json,
            is_completed=t.is_completed
        )
        await repo.add_grammar_topic(new_topic)


@router.get("/grammar", response_model=list[GrammarTopicSchema], summary="List all grammar topics")
async def list_grammar_topics(repo: GermanRepository = Depends(get_german_repo)):
    await check_and_seed_grammar(repo)
    topics = await repo.get_all_grammar_topics()
    return [GrammarTopicSchema.from_orm(t) for t in topics]


@router.get("/grammar/{topic_id}", response_model=GrammarTopicSchema, summary="Get details of a specific grammar topic")
async def get_grammar_topic(topic_id: int, repo: GermanRepository = Depends(get_german_repo)):
    topic = await repo.get_grammar_topic_by_id(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Mavzu topilmadi.")
    return GrammarTopicSchema.from_orm(topic)


@router.post("/grammar/{topic_id}/toggle-complete", response_model=GrammarTopicSchema, summary="Toggle completion status of a grammar topic")
async def toggle_grammar_complete(topic_id: int, repo: GermanRepository = Depends(get_german_repo)):
    topic = await repo.get_grammar_topic_by_id(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Mavzu topilmadi.")

    topic.is_completed = not topic.is_completed
    await repo.update_progress(await repo.get_progress()) # trigger save
    return GrammarTopicSchema.from_orm(topic)


@router.post("/grammar/quiz", summary="Check quiz answers and provide Uzbek feedback")
async def submit_grammar_quiz(
    payload: GrammarQuizSubmit,
    repo: GermanRepository = Depends(get_german_repo)
):
    topic = await repo.get_grammar_topic_by_id(payload.topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Mavzu topilmadi.")

    questions = topic.practice_questions_json
    feedback = {}
    correct_count = 0
    total = len(questions)

    for q in questions:
        q_id = q["id"]
        user_ans = payload.answers.get(q_id, "").strip().lower()
        correct_ans = q["answer"].strip().lower()

        is_correct = user_ans == correct_ans
        if is_correct:
            correct_count += 1
            feedback[q_id] = {
                "is_correct": True,
                "feedback": "Barakalla! To'g'ri javob."
            }
        else:
            feedback[q_id] = {
                "is_correct": False,
                "correct_answer": q["answer"],
                "hint": q["hint"],
                "feedback": f"Noto'g'ri. To'g'ri javob: {q['answer']}."
            }

    # If user got 100% correct, mark topic as complete
    if correct_count == total and not topic.is_completed:
        topic.is_completed = True
        await repo.update_progress(await repo.get_progress()) # trigger save

    return {
        "score": int((correct_count / total) * 100) if total > 0 else 0,
        "correct_count": correct_count,
        "total": total,
        "results": feedback
    }
