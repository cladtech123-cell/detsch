from __future__ import annotations

import logging
from typing import Any

from app.core.config import settings
from app.services.ai.base import BaseAIProvider
from app.services.ai.gemini import GeminiProvider
from app.services.ai.groq import GroqProvider
from app.services.ai.openai import OpenAIProvider

logger = logging.getLogger(__name__)


class FailoverAIProvider(BaseAIProvider):
    """Failover wrapper that automatically switches to fallback providers if primary fails."""

    def __init__(self, primary: BaseAIProvider, fallbacks: list[BaseAIProvider]):
        self.primary = primary
        self.fallbacks = fallbacks
        self.last_active_provider = primary

    def get_active_provider_info(self) -> str:
        """Returns details about the last active provider."""
        provider = self.last_active_provider
        name = provider.__class__.__name__.replace("Provider", "")
        
        # Check active model
        if hasattr(provider, "current_model"):
            model = getattr(provider, "current_model")
        elif hasattr(provider, "configured_model"):
            model = getattr(provider, "configured_model")
        else:
            model = "unknown"
            
        return f"Powered by {name} • {model}"

    async def generate_content(
        self,
        prompt: str,
        system_instruction: str | None = None,
        json_mode: bool = False,
    ) -> str:
        providers = [self.primary] + self.fallbacks
        for provider in providers:
            self.last_active_provider = provider
            try:
                res = await provider.generate_content(prompt, system_instruction, json_mode)
                # Check for standard error payloads
                is_error = (
                    "quota has been exceeded" in res.lower() 
                    or "ai xizmati vaqtincha ishlamayapti" in res.lower() 
                    or res.startswith("Xatolik:") 
                    or "error" in res.lower() 
                    or "unauthorized" in res.lower()
                )
                if is_error:
                    logger.warning(f"Failover trigger: {provider.__class__.__name__} returned error message: {res}. Trying next fallback...")
                    continue
                return res
            except Exception as e:
                logger.error(f"Failover trigger: {provider.__class__.__name__} raised: {e}. Trying next fallback...")
                continue
        return "Xatolik: Barcha AI provayderlari (Groq, Gemini, OpenAI) ishdan chiqdi."

    async def chat_response(
        self,
        history: list[dict[str, str]],
        message: str,
        system_instruction: str | None = None,
        json_mode: bool = False,
    ) -> str:
        providers = [self.primary] + self.fallbacks
        for provider in providers:
            self.last_active_provider = provider
            try:
                res = await provider.chat_response(history, message, system_instruction, json_mode)
                is_error = (
                    "quota has been exceeded" in res.lower() 
                    or "ai xizmati vaqtincha ishlamayapti" in res.lower() 
                    or res.startswith("Xatolik:") 
                    or "error" in res.lower() 
                    or "unauthorized" in res.lower()
                )
                if is_error:
                    logger.warning(f"Failover trigger: {provider.__class__.__name__} returned error message: {res}. Trying next fallback...")
                    continue
                return res
            except Exception as e:
                logger.error(f"Failover trigger: {provider.__class__.__name__} raised: {e}. Trying next fallback...")
                continue
        return "Xatolik: Barcha AI provayderlari (Groq, Gemini, OpenAI) ishdan chiqdi."


def get_ai_provider(provider_name: str | None = None, model_name: str | None = None) -> BaseAIProvider:
    """Factory yielding a FailoverAIProvider based on active/fallback configurations."""
    primary_name = (provider_name or settings.AI_PROVIDER).lower()

    # Initialize all available providers
    gemini = GeminiProvider(
        api_key=settings.GEMINI_API_KEY, 
        model=model_name if primary_name == "gemini" and model_name else settings.GEMINI_MODEL
    )
    groq = GroqProvider(
        api_key=settings.GROQ_API_KEY, 
        model=model_name if primary_name == "groq" and model_name else settings.GROQ_MODEL
    )
    openai = OpenAIProvider(
        api_key=settings.OPENAI_API_KEY
    )

    # Establish fallback order based on primary selection
    if primary_name == "groq":
        primary = groq
        fallbacks = [gemini, openai]
    elif primary_name == "openai":
        primary = openai
        fallbacks = [groq, gemini]
    else:
        primary = gemini
        fallbacks = [groq, openai]

    return FailoverAIProvider(primary=primary, fallbacks=fallbacks)
