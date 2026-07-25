from __future__ import annotations

from typing import Any

import httpx

from app.services.ai.base import BaseAIProvider


class OpenAIProvider(BaseAIProvider):
    """OpenAI API implementation using direct REST calls."""

    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model = model
        self.endpoint = "https://api.openai.com/v1/chat/completions"

    async def generate_content(
        self,
        prompt: str,
        system_instruction: str | None = None,
        json_mode: bool = False,
    ) -> str:
        if not self.api_key:
            return '{"error": "OPENAI_API_KEY is not configured."}' if json_mode else "Error: OPENAI_API_KEY is not configured."

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload: dict[str, Any] = {
            "model": self.model,
            "messages": messages
        }

        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(self.endpoint, headers=headers, json=payload)
            response.raise_for_status()
            res_data = response.json()

            try:
                return res_data["choices"][0]["message"]["content"]
            except (KeyError, IndexError):
                return '{"error": "Failed to parse OpenAI response."}' if json_mode else "Error: Empty or malformed response."

    async def chat_response(
        self,
        history: list[dict[str, str]],
        message: str,
        system_instruction: str | None = None,
        json_mode: bool = False,
    ) -> str:
        if not self.api_key:
            return '{"error": "OPENAI_API_KEY is not configured."}' if json_mode else "Error: OPENAI_API_KEY is not configured."

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})

        # Append history
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})

        # Append current user message
        messages.append({"role": "user", "content": message})

        payload: dict[str, Any] = {
            "model": self.model,
            "messages": messages
        }

        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(self.endpoint, headers=headers, json=payload)
            response.raise_for_status()
            res_data = response.json()

            try:
                return res_data["choices"][0]["message"]["content"]
            except (KeyError, IndexError):
                return '{"error": "Failed to parse OpenAI response."}' if json_mode else "Error: Empty or malformed response."
