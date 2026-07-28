from __future__ import annotations

from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete

from app.core.dependencies import get_german_repo
from app.repositories.german import GermanRepository
from app.models.german import CurriculumBook, CurriculumLesson, Vocabulary, GrammarTopic
from app.schemas.german import CurriculumBookSchema, CurriculumLessonSchema
from app.core.curriculum_seed import SEED_BOOKS, SEED_LESSONS
from app.api.v1.endpoints.grammar import check_and_seed_grammar
from app.services.learning_engine import IntelligentLearningEngine

router = APIRouter()


def enrich_vocab_metadata(v: dict, lesson_number: int) -> dict:
    german = v.get("german", "")
    translation = v.get("translation", "")
    
    # 1. Lesson ID
    lesson_id = v.get("lesson_id") or v.get("lesson_number") or lesson_number
    
    # 2. Article & Plural
    article = v.get("article") or None
    plural = v.get("plural") or None
    
    # 3. Part of speech
    part_of_speech = v.get("part_of_speech")
    if not part_of_speech:
        if article or plural or german.startswith(("der ", "die ", "das ")) or (german and german[0].isupper() and not german.startswith(("Ich", "Du", "Er", "Sie", "Wir"))):
            part_of_speech = "noun"
        elif german.endswith(("en", "n")) and not translation.startswith(("o'sha", "bu")):
            part_of_speech = "verb"
        else:
            part_of_speech = "other"
            
    # 4. Infinitive
    infinitive = v.get("infinitive")
    if part_of_speech == "verb" and not infinitive:
        infinitive = german.strip()
        
    # 5. Grammar topic
    grammar_topic = v.get("grammar_topic")
    if not grammar_topic:
        if lesson_number == 1:
            grammar_topic = "Verbkonjugation & Personalpronomen"
        elif lesson_number == 2:
            grammar_topic = "Possessivartikel"
        elif lesson_number == 7:
            grammar_topic = "Modalverben"
        elif lesson_number == 8:
            grammar_topic = "Wechselpräpositionen & Dativ/Akkusativ"
        else:
            grammar_topic = "General"
            
    # 6. Difficulty
    difficulty = v.get("difficulty")
    if not difficulty:
        if lesson_number <= 2:
            difficulty = "easy"
        elif lesson_number <= 8:
            difficulty = "medium"
        else:
            difficulty = "hard"
            
    return {
        "part_of_speech": part_of_speech,
        "article": article,
        "plural": plural,
        "infinitive": infinitive,
        "lesson_id": lesson_id,
        "grammar_topic": grammar_topic,
        "difficulty": difficulty
    }


async def ensure_user_vocabulary_seeded(repo: GermanRepository):
    """Ensure that vocabulary table is populated with cards for the user from the seed lessons."""
    count = await repo.get_vocabulary_count()
    if count == 0:
        for l in SEED_LESSONS:
            for v in l["vocabulary_json"]:
                existing = await repo.get_vocabulary_by_german(v["german"])
                if not existing:
                    meta = enrich_vocab_metadata(v, l["number"])
                    word = Vocabulary(
                        user_id=repo.user_id,
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
                        times_reviewed=0,
                        part_of_speech=meta["part_of_speech"],
                        infinitive=meta["infinitive"],
                        lesson_id=meta["lesson_id"],
                        grammar_topic=meta["grammar_topic"],
                        difficulty=meta["difficulty"]
                    )
                    repo.db.add(word)
        await repo.db.commit()


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
                vocabulary_json=l["vocabulary_json"],
                exercises_json=l.get("exercises_json", [])
            )
            repo.db.add(lesson_obj)
        await repo.db.commit()
        result = await repo.db.execute(select(CurriculumLesson).order_by(CurriculumLesson.book_code.asc(), CurriculumLesson.number.asc()))
        lessons = result.scalars().all()

    # Seed grammar topics and user vocabularies
    await check_and_seed_grammar(repo)
    await ensure_user_vocabulary_seeded(repo)

    # Fetch and map vocabulary from the database
    vocab_result = await repo.db.execute(
        select(Vocabulary)
        .filter(Vocabulary.user_id == repo.user_id)
    )
    all_vocab = vocab_result.scalars().all()
    vocab_by_lesson = {}
    for v in all_vocab:
        if v.lesson_number not in vocab_by_lesson:
            vocab_by_lesson[v.lesson_number] = []
        vocab_by_lesson[v.lesson_number].append(v)

    # Fetch and map grammar topics from the database
    grammar_result = await repo.db.execute(
        select(GrammarTopic).order_by(GrammarTopic.id.asc())
    )
    all_grammar = grammar_result.scalars().all()
    grammar_by_lesson = {}
    for gt in all_grammar:
        if gt.lesson not in grammar_by_lesson:
            grammar_by_lesson[gt.lesson] = []
        grammar_by_lesson[gt.lesson].append(gt)

    # Fetch progress to pass to exercise generator
    progress = await repo.get_progress()

    schemas = []
    for lesson in lessons:
        vocab_list = vocab_by_lesson.get(lesson.number, [])
        vocab_json = [
            {
                "german": v.german,
                "translation": v.translation,
                "article": v.article or "",
                "plural": v.plural or "",
                "pronunciation": v.pronunciation or "",
                "ipa": v.ipa or "",
                "textbook_page": v.textbook_page,
                "part_of_speech": v.part_of_speech or "",
                "infinitive": v.infinitive or "",
                "lesson_id": v.lesson_id,
                "grammar_topic": v.grammar_topic or "",
                "difficulty": v.difficulty or ""
            }
            for v in vocab_list
        ]
        if not vocab_json:
            vocab_json = lesson.vocabulary_json or []

        grammar_topics = grammar_by_lesson.get(f"Lektion {lesson.number}", [])
        if grammar_topics:
            grammar_title = " & ".join([gt.title for gt in grammar_topics])
            grammar_explanation = "\n\n".join([gt.explanation_uz for gt in grammar_topics])
            grammar_examples_json = []
            for gt in grammar_topics:
                grammar_examples_json.extend(gt.examples_json or [])
        else:
            grammar_title = lesson.grammar_title
            grammar_explanation = lesson.grammar_explanation
            grammar_examples_json = lesson.grammar_examples_json

        # Dynamically generate compatible exercises
        generated_exercises = IntelligentLearningEngine.generate_exercises(
            lesson=lesson,
            vocab_list=vocab_list,
            grammar_topics=grammar_topics,
            user_progress=progress
        )

        schema = CurriculumLessonSchema(
            id=lesson.id,
            book_code=lesson.book_code,
            number=lesson.number,
            title_uz=lesson.title_uz,
            title_de=lesson.title_de,
            description_uz=lesson.description_uz,
            description_de=lesson.description_de,
            grammar_title=grammar_title,
            grammar_explanation=grammar_explanation,
            grammar_examples_json=grammar_examples_json,
            listening_dialogue=lesson.listening_dialogue,
            listening_quiz_json=lesson.listening_quiz_json,
            reading_passage=lesson.reading_passage,
            reading_quiz_json=lesson.reading_quiz_json,
            writing_prompt=lesson.writing_prompt,
            speaking_topic=lesson.speaking_topic,
            quiz_questions_json=lesson.quiz_questions_json,
            vocabulary_json=vocab_json,
            exercises_json=generated_exercises
        )
        schemas.append(schema)
    return schemas


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

    # Fetch vocab items belonging to the lesson from database
    vocab_result = await repo.db.execute(
        select(Vocabulary)
        .filter(Vocabulary.user_id == repo.user_id, Vocabulary.lesson_number == lesson_number)
        .order_by(Vocabulary.german.asc())
    )
    vocab_list = vocab_result.scalars().all()
    vocab_json = [
        {
            "german": v.german,
            "translation": v.translation,
            "article": v.article or "",
            "plural": v.plural or "",
            "pronunciation": v.pronunciation or "",
            "ipa": v.ipa or "",
            "textbook_page": v.textbook_page,
            "part_of_speech": v.part_of_speech or "",
            "infinitive": v.infinitive or "",
            "lesson_id": v.lesson_id,
            "grammar_topic": v.grammar_topic or "",
            "difficulty": v.difficulty or ""
        }
        for v in vocab_list
    ]
    if not vocab_json:
        vocab_json = lesson.vocabulary_json or []

    # Fetch grammar topics from database
    grammar_result = await repo.db.execute(
        select(GrammarTopic)
        .filter(GrammarTopic.lesson == f"Lektion {lesson_number}")
        .order_by(GrammarTopic.id.asc())
    )
    grammar_topics = grammar_result.scalars().all()
    if grammar_topics:
        grammar_title = " & ".join([gt.title for gt in grammar_topics])
        grammar_explanation = "\n\n".join([gt.explanation_uz for gt in grammar_topics])
        grammar_examples_json = []
        for gt in grammar_topics:
            grammar_examples_json.extend(gt.examples_json or [])
    else:
        grammar_title = lesson.grammar_title
        grammar_explanation = lesson.grammar_explanation
        grammar_examples_json = lesson.grammar_examples_json

    # Fetch user progress
    progress = await repo.get_progress()
    generated_exercises = IntelligentLearningEngine.generate_exercises(
        lesson=lesson,
        vocab_list=vocab_list,
        grammar_topics=grammar_topics,
        user_progress=progress
    )

    return CurriculumLessonSchema(
        id=lesson.id,
        book_code=lesson.book_code,
        number=lesson.number,
        title_uz=lesson.title_uz,
        title_de=lesson.title_de,
        description_uz=lesson.description_uz,
        description_de=lesson.description_de,
        grammar_title=grammar_title,
        grammar_explanation=grammar_explanation,
        grammar_examples_json=grammar_examples_json,
        listening_dialogue=lesson.listening_dialogue,
        listening_quiz_json=lesson.listening_quiz_json,
        reading_passage=lesson.reading_passage,
        reading_quiz_json=lesson.reading_quiz_json,
        writing_prompt=lesson.writing_prompt,
        speaking_topic=lesson.speaking_topic,
        quiz_questions_json=lesson.quiz_questions_json,
        vocabulary_json=vocab_json,
        exercises_json=generated_exercises
    )


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
                meta = enrich_vocab_metadata(v, l["number"])
                word = Vocabulary(
                    user_id=repo.user_id,
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
                    times_reviewed=0,
                    part_of_speech=meta["part_of_speech"],
                    infinitive=meta["infinitive"],
                    lesson_id=meta["lesson_id"],
                    grammar_topic=meta["grammar_topic"],
                    difficulty=meta["difficulty"]
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
            vocabulary_json=l["vocabulary_json"],
            exercises_json=l.get("exercises_json", [])
        ))
    await repo.db.commit()
    return {"status": "success", "detail": "Curriculum books and lessons seeded successfully."}
