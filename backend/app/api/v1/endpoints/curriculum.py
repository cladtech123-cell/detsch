from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete

from app.core.dependencies import get_german_repo
from app.repositories.german import GermanRepository
from app.models.german import CurriculumBook, CurriculumLesson, Vocabulary
from app.schemas.german import CurriculumBookSchema, CurriculumLessonSchema
from app.core.curriculum_seed import SEED_BOOKS, SEED_LESSONS

router = APIRouter()


@router.get("/curriculum/books", response_model=list[CurriculumBookSchema])
async def list_books(repo: GermanRepository = Depends(get_german_repo)):
    result = await repo.db.execute(select(CurriculumBook).order_by(CurriculumBook.code.asc()))
    books = result.scalars().all()
    # Auto-seed if empty
    if not books:
        for b in SEED_BOOKS:
            book_obj = CurriculumBook(code=b["code"], title=b["title"], cefr=b["cefr"])
            repo.db.add(book_obj)
        await repo.db.commit()
        result = await repo.db.execute(select(CurriculumBook).order_by(CurriculumBook.code.asc()))
        books = result.scalars().all()
    return books


@router.get("/curriculum/lessons", response_model=list[CurriculumLessonSchema])
async def list_all_lessons(repo: GermanRepository = Depends(get_german_repo)):
    result = await repo.db.execute(select(CurriculumLesson).order_by(CurriculumLesson.book_code.asc(), CurriculumLesson.number.asc()))
    lessons = result.scalars().all()
    # Auto-seed if empty
    if not lessons:
        for l in SEED_LESSONS:
            lesson_obj = CurriculumLesson(
                book_code=l["book_code"],
                number=l["number"],
                title_uz=l["title_uz"],
                title_de=l["title_de"],
                description_uz=l["description_uz"],
                description_de=l["description_de"],
                grammar_title=l["grammar_title"],
                grammar_explanation=l["grammar_explanation"],
                grammar_examples_json=l["grammar_examples_json"],
                listening_dialogue=l["listening_dialogue"],
                listening_quiz_json=l["listening_quiz_json"],
                reading_passage=l["reading_passage"],
                reading_quiz_json=l["reading_quiz_json"],
                writing_prompt=l["writing_prompt"],
                speaking_topic=l["speaking_topic"],
                quiz_questions_json=l["quiz_questions_json"],
                vocabulary_json=l["vocabulary_json"]
            )
            repo.db.add(lesson_obj)
        await repo.db.commit()
        result = await repo.db.execute(select(CurriculumLesson).order_by(CurriculumLesson.book_code.asc(), CurriculumLesson.number.asc()))
        lessons = result.scalars().all()
    return lessons


@router.get("/curriculum/lessons/{book_code}/{lesson_number}", response_model=CurriculumLessonSchema)
async def get_lesson(book_code: str, lesson_number: int, repo: GermanRepository = Depends(get_german_repo)):
    # Trigger auto-seeding first by querying all lessons if empty
    await list_all_lessons(repo)
    
    result = await repo.db.execute(
        select(CurriculumLesson)
        .filter(CurriculumLesson.book_code == book_code, CurriculumLesson.number == lesson_number)
    )
    lesson = result.scalars().first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.post("/curriculum/seed")
async def seed_curriculum(repo: GermanRepository = Depends(get_german_repo)):
    # Clear existing
    await repo.db.execute(delete(CurriculumBook))
    await repo.db.execute(delete(CurriculumLesson))
    await repo.db.commit()
    
    # Reload Books
    for b in SEED_BOOKS:
        repo.db.add(CurriculumBook(code=b["code"], title=b["title"], cefr=b["cefr"]))
        
    # Reload Lessons and insert vocabulary cards
    for l in SEED_LESSONS:
        # Load vocab items belonging to the lesson as cards in Vocabulary table!
        for v in l["vocabulary_json"]:
            existing_vocab = await repo.get_vocabulary_by_german(v["german"])
            if not existing_vocab:
                word = Vocabulary(
                    german=v["german"],
                    translation=v["translation"],
                    example_sentence=f"Das ist {v['german']}.",
                    cefr_level="A1",
                    lesson=f"Lektion {l['number']}",
                    category=v.get("article", "General") or "General",
                    article=v.get("article"),
                    plural=v.get("plural"),
                    pronunciation=v.get("pronunciation"),
                    ipa=v.get("ipa"),
                    textbook_page=v.get("textbook_page"),
                    lesson_number=l["number"],
                    box=1,
                    interval_days=1,
                    next_review=date.today(),
                    times_reviewed=0
                )
                repo.db.add(word)
        
        repo.db.add(CurriculumLesson(
            book_code=l["book_code"],
            number=l["number"],
            title_uz=l["title_uz"],
            title_de=l["title_de"],
            description_uz=l["description_uz"],
            description_de=l["description_de"],
            grammar_title=l["grammar_title"],
            grammar_explanation=l["grammar_explanation"],
            grammar_examples_json=l["grammar_examples_json"],
            listening_dialogue=l["listening_dialogue"],
            listening_quiz_json=l["listening_quiz_json"],
            reading_passage=l["reading_passage"],
            reading_quiz_json=l["reading_quiz_json"],
            writing_prompt=l["writing_prompt"],
            speaking_topic=l["speaking_topic"],
            quiz_questions_json=l["quiz_questions_json"],
            vocabulary_json=l["vocabulary_json"]
        ))
    await repo.db.commit()
    return {"status": "success", "detail": "Curriculum books and lessons seeded successfully."}
