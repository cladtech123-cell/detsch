from __future__ import annotations

from app.core.config import settings
from app.services.ocr.base import BaseOCRProvider
from app.services.ocr.gemini import GeminiOCRProvider


def get_ocr_provider() -> BaseOCRProvider:
    """Factory function to retrieve the configured OCR provider."""
    # Currently default to GeminiOCRProvider. Can be expanded in future to load other OCR libraries
    return GeminiOCRProvider(api_key=settings.GEMINI_API_KEY)
