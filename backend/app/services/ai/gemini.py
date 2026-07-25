from __future__ import annotations

import asyncio
import logging
from typing import Any

import httpx

from app.services.ai.base import BaseAIProvider

logger = logging.getLogger(__name__)


class QuotaExceededError(Exception):
    """Exception raised when the Gemini API returns a 429 quota exhaustion code."""
    pass


class GeminiProvider(BaseAIProvider):
    """Gemini API implementation using direct REST calls with robust fallbacks and retries."""

    def __init__(self, api_key: str, model: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.configured_model = model
        self._cached_supported_models: list[str] | None = None

    async def _get_supported_models(self) -> list[str]:
        if self._cached_supported_models is not None:
            return self._cached_supported_models

        if not self.api_key:
            return []

        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={self.api_key}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)
                if response.status_code == 429:
                    raise QuotaExceededError()
                response.raise_for_status()
                data = response.json()
                
                api_models = []
                for m in data.get("models", []):
                    name = m.get("name", "")
                    if name.startswith("models/"):
                        name = name[len("models/"):]
                    api_models.append(name)
                
                # Check preferred order
                preferred = [self.configured_model, "gemini-2.5-flash", "gemini-2.0-flash"]
                # Keep order, remove duplicates
                unique_preferred = []
                for p in preferred:
                    if p not in unique_preferred:
                        unique_preferred.append(p)
                        
                supported = [p for p in unique_preferred if p in api_models]
                self._cached_supported_models = supported
                return supported
        except QuotaExceededError:
            raise
        except Exception as e:
            logger.error(f"Failed to list supported Gemini models: {e}")
            raise

    async def _post_request(
        self,
        payload: dict[str, Any],
        json_mode: bool = False
    ) -> str:
        if not self.api_key:
            return (
                '{"error": "GEMINI_API_KEY sozlanmagan. Iltimos Sozlamalar bo\'limidan kalitni kiriting."}' 
                if json_mode 
                else "Xatolik: GEMINI_API_KEY sozlanmagan. Iltimos Sozlamalar bo'limidan kalitni kiriting."
            )

        # Step 1: Get confirmed supported models
        try:
            supported_models = await self._get_supported_models()
        except QuotaExceededError:
            err_msg = "Gemini API quota has been exceeded. Please try again later or configure another AI provider."
            return f'{{"error": "{err_msg}"}}' if json_mode else err_msg
        except Exception as e:
            err_msg = f"AI xizmatini tekshirishda xatolik yuz berdi: {e}"
            return f'{{"error": "{err_msg}"}}' if json_mode else f"Xatolik: {err_msg}"

        if not supported_models:
            err_msg = "No supported Gemini model (gemini-2.5-flash, gemini-2.0-flash) is available under this API key."
            return f'{{"error": "{err_msg}"}}' if json_mode else f"Xatolik: {err_msg}"

        last_error_message = "Noma'lum xatolik"

        # Step 2: Try confirmed supported models in order
        for model_name in list(supported_models):
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
            
            # Retry loop for the current model
            max_retries = 3
            for attempt in range(max_retries + 1):
                try:
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        response = await client.post(url, json=payload)
                        
                        if response.status_code == 200:
                            res_data = response.json()
                            try:
                                text_out = res_data["candidates"][0]["content"]["parts"][0]["text"]
                                return text_out
                            except (KeyError, IndexError) as parse_err:
                                logger.error(f"Gemini parse error: {parse_err}. Response data: {res_data}")
                                last_error_message = "API javobini o'qib bo'lmadi."
                                break  # parse error, try next model fallback
                                
                        # Log real API response on errors
                        logger.error(
                            f"Gemini API Error (Model: {model_name}, Attempt: {attempt + 1}): "
                            f"Status {response.status_code}, Response: {response.text}"
                        )
                        
                        # Problem 1: If the error is 429, stop immediately, do not retry
                        if response.status_code == 429:
                            err_msg = "Gemini API quota has been exceeded. Please try again later or configure another AI provider."
                            return f'{{"error": "{err_msg}"}}' if json_mode else err_msg

                        # Problem 2: If the error is 404/400 (model not found), remove model and try next fallback
                        is_not_found = response.status_code in (404, 400)
                        if is_not_found:
                            last_error_message = f"Model {model_name} topilmadi yoki qo'llab-quvvatlanmaydi."
                            if self._cached_supported_models is not None and model_name in self._cached_supported_models:
                                self._cached_supported_models.remove(model_name)
                            break  # breakout of retry loop
                            
                        # Other transient errors (5xx, timeouts) -> retry with backoff
                        if attempt < max_retries:
                            backoff_seconds = 2 ** attempt
                            logger.info(f"Retrying transient error in {backoff_seconds} seconds...")
                            await asyncio.sleep(backoff_seconds)
                        else:
                            last_error_message = f"API transient error: Status {response.status_code}"
                            
                except httpx.RequestError as req_err:
                    logger.error(f"Gemini connection error: {req_err}")
                    last_error_message = "Tarmoq ulanishida xatolik yuz berdi."
                    if attempt < max_retries:
                        backoff_seconds = 2 ** attempt
                        await asyncio.sleep(backoff_seconds)
            else:
                # Retries exhausted for this model without breaks
                continue
                
            # Broke out of retry loop -> go to next fallback model
            logger.info(f"Model {model_name} failed. Attempting next fallback model...")

        # If all confirmed models fail
        err_msg = f"AI xizmati vaqtincha ishlamayapti ({last_error_message})."
        return f'{{"error": "{err_msg}"}}' if json_mode else f"Xatolik: {err_msg}"

    async def generate_content(
        self,
        prompt: str,
        system_instruction: str | None = None,
        json_mode: bool = False,
    ) -> str:
        # Build contents payload
        payload: dict[str, Any] = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ]
        }

        # Add system instruction if present
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        # Configure JSON response mode if requested
        if json_mode:
            payload["generationConfig"] = {"responseMimeType": "application/json"}

        return await self._post_request(payload, json_mode=json_mode)

    async def chat_response(
        self,
        history: list[dict[str, str]],
        message: str,
        system_instruction: str | None = None,
        json_mode: bool = False,
    ) -> str:
        # Map conversation history into Gemini format
        gemini_contents = []
        for msg in history:
            role = "model" if msg["role"] == "assistant" else "user"
            gemini_contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })

        # Append new user message
        gemini_contents.append({
            "role": "user",
            "parts": [{"text": message}]
        })

        payload: dict[str, Any] = {
            "contents": gemini_contents
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        if json_mode:
            payload["generationConfig"] = {"responseMimeType": "application/json"}

        return await self._post_request(payload, json_mode=json_mode)
