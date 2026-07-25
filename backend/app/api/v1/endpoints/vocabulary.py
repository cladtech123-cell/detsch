from __future__ import annotations

import json
from datetime import date

from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_german_repo, get_german_service
from app.models.german import Vocabulary
from app.repositories.german import GermanRepository
from app.schemas.german import (
    VocabularyCreate, 
    VocabularyReview, 
    VocabularySchema,
    BulkGenerateRequest,
    BulkGenerateResponseItem,
    BulkImportRequest,
    BulkImportResponse
)
from app.services.ai import get_ai_provider
from app.services.german_service import GermanService

router = APIRouter()


@router.get("/vocabulary", response_model=list[VocabularySchema], summary="List all vocabulary words")
async def list_vocabulary(repo: GermanRepository = Depends(get_german_repo)):
    words = await repo.get_all_vocabulary()
    return [VocabularySchema.from_orm(w) for w in words]


@router.get("/vocabulary/due", response_model=list[VocabularySchema], summary="Get due vocabulary words for review")
async def get_due_vocabulary(repo: GermanRepository = Depends(get_german_repo)):
    words = await repo.get_due_vocabulary()
    return [VocabularySchema.from_orm(w) for w in words]


@router.post("/vocabulary", response_model=VocabularySchema, summary="Add a new vocabulary word")
async def add_vocabulary(
    payload: VocabularyCreate,
    repo: GermanRepository = Depends(get_german_repo)
):
    existing = await repo.get_vocabulary_by_german(payload.german)
    if existing:
        raise HTTPException(status_code=400, detail="So'z allaqachon lug'atga qo'shilgan!")

    word = Vocabulary(
        german=payload.german,
        translation=payload.translation,
        example_sentence=payload.example_sentence,
        cefr_level=payload.cefr_level,
        lesson=payload.lesson,
        category=payload.category,
        box=1,
        interval_days=1,
        next_review=date.today(),
        ease_factor=2.5,
        times_reviewed=0
    )
    new_word = await repo.add_vocabulary(word)
    return VocabularySchema.from_orm(new_word)


@router.post("/vocabulary/review", response_model=VocabularySchema, summary="Submit a word review result")
async def review_vocabulary(
    payload: VocabularyReview,
    service: GermanService = Depends(get_german_service)
):
    try:
        updated = await service.process_vocab_review(payload.word_id, payload.is_correct)
        return VocabularySchema.from_orm(updated)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.post("/vocabulary/generate-example", summary="Generate German example sentence with Uzbek translation")
async def generate_example_sentence(word: str, translation: str):
    ai = get_ai_provider()
    prompt = (
        f"Create a simple, natural German example sentence using the word \"{word}\" (German for \"{translation}\").\n"
        f"Keep the grammar suitable for A1.1/A1.2 German level.\n"
        f"Provide the output in JSON format with two fields:\n"
        f"- 'example_de': the German sentence.\n"
        f"- 'example_uz': the Uzbek translation of that sentence.\n"
        f"Return ONLY the JSON string. Do not use formatting tags or markdown."
    )

    try:
        res = await ai.generate_content(
            prompt=prompt,
            system_instruction="You are a helpful German language helper. Output JSON.",
            json_mode=True
        )
        data = json.loads(res)
        return data
    except Exception:
        return {
            "example_de": f"Ich benutze {word} in einem Satz.",
            "example_uz": f"Men gapda {translation} so'zidan foydalanaman."
        }


@router.post("/vocabulary/bulk-generate", response_model=list[BulkGenerateResponseItem], summary="Generate missing details for multiple vocabulary words via AI")
async def bulk_generate_vocabulary(
    payload: BulkGenerateRequest,
    repo: GermanRepository = Depends(get_german_repo)
):
    if not payload.items:
        return []
        
    progress = await repo.get_progress()
    ai = get_ai_provider(provider_name=progress.ai_provider, model_name=progress.ai_model)
    
    words_list = [{"german": item.german, "translation": item.translation} for item in payload.items]
    prompt = (
        "Sizga nemischa so'zlar ro'yxati beriladi. Agarda tarjimasi berilmagan bo'lsa, uni o'zbek tiliga tarjima qiling. "
        "Har bir so'z uchun quyidagi ma'lumotlarni to'ldiring:\n"
        "- 'german': So'zning o'zi\n"
        "- 'translation': So'zning o'zbekcha tarjimasi\n"
        "- 'example_sentence': So'z ishtirok etgan sodda nemischa gap va uning o'zbekcha tarjimasi qavs ichida, "
        "masalan: 'Ich wohne in einem Haus (Men uyda yashayman)'. Joriy o'quvchi A1 darajasida bo'lgani sababli gaplarni juda sodda qiling.\n"
        "- 'cefr_level': So'zning qiyinlik darajasi (A1, A2, B1, yoki B2)\n"
        "- 'category': So'z turkumi yoki mavzusi (Noun, Verb, Adjective, Greetings, Family va h.k.)\n\n"
        "So'zlar ro'yxati:\n"
        f"{json.dumps(words_list, ensure_ascii=False)}\n\n"
        "Natijani faqatgina JSON ro'yxat formatida qaytaring, boshqa hech qanday izoh va markdown belgilari (masalan ```json) ishlatmang!"
    )

    try:
        res_text = await ai.generate_content(
            prompt=prompt,
            system_instruction="You are a helpful German language tutor. Output JSON.",
            json_mode=True
        )
        res_text_clean = res_text.strip()
        if res_text_clean.startswith("```"):
            lines = res_text_clean.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            res_text_clean = "\n".join(lines).strip()

        parsed = json.loads(res_text_clean)
        if not isinstance(parsed, list):
            raise ValueError("AI response is not a JSON list")
            
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sun'iy intellekt ma'lumot to'ldirishda xatolik yuz berdi: {str(e)}")


@router.post("/vocabulary/bulk-import", response_model=BulkImportResponse, summary="Import multiple vocabulary words at once, skipping duplicates")
async def bulk_import_vocabulary(
    payload: BulkImportRequest,
    repo: GermanRepository = Depends(get_german_repo)
):
    imported = 0
    skipped = 0
    failed = 0

    for item in payload.words:
        try:
            existing = await repo.get_vocabulary_by_german(item.german)
            if existing:
                skipped += 1
                continue

            word = Vocabulary(
                german=item.german,
                translation=item.translation,
                example_sentence=item.example_sentence,
                cefr_level=item.cefr_level,
                lesson=item.lesson,
                category=item.category,
                box=1,
                interval_days=1,
                next_review=date.today(),
                ease_factor=2.5,
                times_reviewed=0
            )
            await repo.add_vocabulary(word)
            imported += 1
        except Exception as e:
            failed += 1

    return BulkImportResponse(imported=imported, skipped=skipped, failed=failed)
