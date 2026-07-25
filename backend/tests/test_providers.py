from __future__ import annotations

from app.core.config import settings
from app.services.ai import GeminiProvider, OpenAIProvider, get_ai_provider
from app.services.ocr import GeminiOCRProvider, get_ocr_provider


def test_ai_provider_factory() -> None:
    # Test default/gemini configuration
    settings.AI_PROVIDER = "gemini"
    provider = get_ai_provider()
    assert isinstance(provider.primary, GeminiProvider)

    # Test openai configuration
    settings.AI_PROVIDER = "openai"
    provider = get_ai_provider()
    assert isinstance(provider.primary, OpenAIProvider)


def test_ocr_provider_factory() -> None:
    provider = get_ocr_provider()
    assert isinstance(provider, GeminiOCRProvider)
