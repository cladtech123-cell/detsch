from __future__ import annotations

import asyncio
import logging
from typing import Any

import httpx

from app.services.ai.base import BaseAIProvider

logger = logging.getLogger(__name__)


class GroqProvider(BaseAIProvider):
    """Groq API implementation using direct REST calls compatible with OpenAI spec."""

    def __init__(self, api_key: str, model: str = "llama-3.3-70b-versatile"):
        self.api_key = api_key
        self.configured_model = model
        self.current_model = model

    async def _post_request(
        self,
        messages: list[dict[str, str]],
        json_mode: bool = False
    ) -> str:
        if not self.api_key:
            return (
                '{"error": "GROQ_API_KEY sozlanmagan. Iltimos Sozlamalar bo\'limidan kalitni kiriting."}' 
                if json_mode 
                else "Xatolik: GROQ_API_KEY sozlanmagan. Iltimos Sozlamalar bo'limidan kalitni kiriting."
            )

        # Fallback list for Groq
        models_to_try = [self.configured_model, "llama-3.1-8b-instant", "openai/gpt-oss-120b"]
        unique_models = []
        for m in models_to_try:
            if m not in unique_models:
                unique_models.append(m)

        last_error_message = "Noma'lum xatolik"
        url = "https://api.groq.com/openai/v1/chat/completions"

        for model_name in unique_models:
            self.current_model = model_name
            payload: dict[str, Any] = {
                "model": model_name,
                "messages": messages,
                "temperature": 0.2
            }

            if json_mode:
                payload["response_format"] = {"type": "json_object"}

            max_retries = 3
            for attempt in range(max_retries + 1):
                try:
                    headers = {
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    }
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        response = await client.post(url, json=payload, headers=headers)
                        
                        if response.status_code == 200:
                            res_data = response.json()
                            try:
                                text_out = res_data["choices"][0]["message"]["content"]
                                return text_out
                            except (KeyError, IndexError) as parse_err:
                                logger.error(f"Groq parse error: {parse_err}. Response data: {res_data}")
                                last_error_message = "API javobini o'qib bo'lmadi."
                                break  # try next model fallback
                                
                        # Log real API response on errors
                        logger.error(
                            f"Groq API Error (Model: {model_name}, Attempt: {attempt + 1}): "
                            f"Status {response.status_code}, Response: {response.text}"
                        )
                        
                        # Problem 1: Stop retrying on 429 immediately
                        if response.status_code == 429:
                            raise ValueError("Groq API quota has been exceeded. Please try again later or configure another AI provider.")

                        # Problem 2: If model is not found (404/400) -> try next fallback model
                        if response.status_code in (404, 400):
                            last_error_message = f"Model {model_name} topilmadi yoki qo'llab-quvvatlanmaydi."
                            break  # breakout of retry loop
                            
                        # Other transient errors (5xx, timeouts) -> retry with backoff
                        if attempt < max_retries:
                            backoff_seconds = 2 ** attempt
                            logger.info(f"Retrying Groq transient error in {backoff_seconds} seconds...")
                            await asyncio.sleep(backoff_seconds)
                        else:
                            last_error_message = f"API transient error: Status {response.status_code}"
                            
                except httpx.RequestError as req_err:
                    logger.error(f"Groq connection error: {req_err}")
                    last_error_message = "Tarmoq ulanishida xatolik yuz berdi."
                    if attempt < max_retries:
                        backoff_seconds = 2 ** attempt
                        await asyncio.sleep(backoff_seconds)
                except ValueError as val_err:
                    # propagate rate limit error to exit quickly
                    return f'{{"error": "{str(val_err)}"}}' if json_mode else str(val_err)
            else:
                # Retries exhausted
                continue
                
            # Broke out of retry loop -> try next model fallback
            logger.info(f"Model {model_name} failed on Groq. Attempting next fallback model...")

        # If all fallback models fail
        err_msg = f"AI xizmati vaqtincha ishlamayapti ({last_error_message})."
        return f'{{"error": "{err_msg}"}}' if json_mode else f"Xatolik: {err_msg}"

    async def generate_content(
        self,
        prompt: str,
        system_instruction: str | None = None,
        json_mode: bool = False,
    ) -> str:
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})
        return await self._post_request(messages, json_mode=json_mode)

    async def chat_response(
        self,
        history: list[dict[str, str]],
        message: str,
        system_instruction: str | None = None,
        json_mode: bool = False,
    ) -> str:
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        
        # Append history
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})
            
        messages.append({"role": "user", "content": message})
        return await self._post_request(messages, json_mode=json_mode)
