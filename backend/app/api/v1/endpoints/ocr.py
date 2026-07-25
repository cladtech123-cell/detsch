from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core.dependencies import get_german_repo
from app.models.german import GrammarTopic, Vocabulary
from app.repositories.german import GermanRepository
from app.services.ocr import get_ocr_provider

router = APIRouter()


@router.post("/ocr/import", summary="Upload classroom notes/whiteboard image to parse and update database")
async def import_classroom_notes(
    file: UploadFile = File(...),
    repo: GermanRepository = Depends(get_german_repo)
):
    # 1. Read bytes
    content_type = file.content_type or "image/jpeg"
    if not (content_type.startswith("image/") or content_type == "application/pdf"):
        raise HTTPException(status_code=400, detail="Faqat rasm (JPEG/PNG) yoki PDF fayllar qabul qilinadi.")

    file_bytes = await file.read()

    # 2. Call OCR Service
    ocr = get_ocr_provider()

    try:
        if content_type == "application/pdf":
            parsed_data = await ocr.parse_pdf(file_bytes)
        else:
            parsed_data = await ocr.parse_classroom_material(file_bytes, content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Faylni tahlil qilishda xatolik yuz berdi: {str(e)}") from e

    if "error" in parsed_data:
        raise HTTPException(status_code=400, detail=parsed_data["error"])

    # 3. Save new vocabulary to database
    added_words = []
    vocab_list = parsed_data.get("vocabulary", [])
    for v in vocab_list:
        german_word = v.get("german", "").strip()
        translation = v.get("translation", "").strip()
        example = v.get("example_sentence", "").strip()
        category = v.get("category", "General").strip()
        cefr_level = v.get("cefr_level", "A1").strip()

        if not german_word or not translation:
            continue

        # Check if already exists
        dup = await repo.get_vocabulary_by_german(german_word)
        if not dup:
            new_vocab = Vocabulary(
                german=german_word,
                translation=translation,
                example_sentence=example,
                category=category,
                cefr_level=cefr_level,
                lesson="Class Import",
                box=1,
                interval_days=1
            )
            await repo.add_vocabulary(new_vocab)
            added_words.append(german_word)

    # 4. Save grammar topic if detected
    grammar_list = parsed_data.get("grammar", [])
    added_grammar = []
    for g in grammar_list:
        topic_title = g.get("topic", "").strip()
        exp_uz = g.get("explanation_uz", "").strip()
        exp_en = g.get("explanation_en", "").strip()
        examples = g.get("examples", [])

        if not topic_title:
            continue

        dup_g = await repo.get_grammar_topic_by_title(topic_title)
        if not dup_g:
            new_grammar = GrammarTopic(
                title=topic_title,
                lesson="Class Import",
                explanation_uz=exp_uz,
                explanation_en=exp_en,
                examples_json=examples,
                is_completed=False
            )
            await repo.add_grammar_topic(new_grammar)
            added_grammar.append(topic_title)

    # Increment streak or save progress
    progress = await repo.get_progress()
    progress.study_streak += 1
    await repo.update_progress(progress)

    return {
        "summary": parsed_data.get("summary", "Dars materiali muvaffaqiyatli import qilindi."),
        "added_vocabulary": added_words,
        "added_grammar": added_grammar,
        "raw_parsed": parsed_data
    }
