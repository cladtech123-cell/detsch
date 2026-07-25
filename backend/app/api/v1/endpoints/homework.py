from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.core.dependencies import get_german_repo, get_german_service
from app.repositories.german import GermanRepository
from app.schemas.german import HomeworkSubmissionSchema
from app.services.german_service import GermanService
from app.services.ocr import get_ocr_provider

router = APIRouter()


@router.get("/homework/history", response_model=list[HomeworkSubmissionSchema], summary="Get past homework submissions")
async def get_homework_history(repo: GermanRepository = Depends(get_german_repo)):
    submissions = await repo.get_homework_history()
    return [HomeworkSubmissionSchema.from_orm(s) for s in submissions]


@router.post("/homework/submit", response_model=HomeworkSubmissionSchema, summary="Submit text or photo homework for AI grading")
async def submit_homework(
    title: str = Form(...),
    homework_text: str | None = Form(None),
    file: UploadFile | None = File(None),
    service: GermanService = Depends(get_german_service)
):
    extracted_text = ""
    file_type = "text"

    # 1. Handle file upload if present
    if file:
        file_bytes = await file.read()
        content_type = file.content_type or "image/jpeg"
        file_type = "image" if content_type.startswith("image/") else "pdf"

        # Call OCR service
        ocr = get_ocr_provider()
        try:
            extracted_text = await ocr.extract_text(file_bytes, content_type)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OCR error: {str(e)}") from e
    else:
        # Text-only submission
        if not homework_text:
            raise HTTPException(status_code=400, detail="Fayl yoki matn yuborilishi shart.")
        extracted_text = homework_text

    # 2. Call service layer grading function
    submission = await service.grade_homework(
        title=title,
        raw_content=extracted_text,
        file_type=file_type
    )
    return HomeworkSubmissionSchema.from_orm(submission)
