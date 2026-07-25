from __future__ import annotations

import base64
import json
from typing import Any

import httpx

from app.services.ocr.base import BaseOCRProvider


class GeminiOCRProvider(BaseOCRProvider):
    """OCR implementation using Gemini's multi-modal API capabilities."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

    async def extract_text(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
        if not self.api_key:
            return "Error: GEMINI_API_KEY is not set."

        base64_data = base64.b64encode(image_bytes).decode("utf-8")
        url = f"{self.endpoint}?key={self.api_key}"

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": "Extract all German text from this image. Output only the extracted text. Maintain layout as much as possible."},
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": base64_data
                            }
                        }
                    ]
                }
            ]
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            res_data = response.json()

            try:
                return res_data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError):
                return "Error: Could not extract text from the image."

    async def parse_classroom_material(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> dict[str, Any]:
        if not self.api_key:
            return {"error": "GEMINI_API_KEY is not configured."}

        base64_data = base64.b64encode(image_bytes).decode("utf-8")
        url = f"{self.endpoint}?key={self.api_key}"

        prompt = (
            "Analyze this classroom note or whiteboard image. Extract the German content, then return a JSON object with "
            "the following keys:\n"
            "1. 'summary': a brief summary of the lesson/notes in Uzbek (fallback to English if difficult).\n"
            "2. 'vocabulary': a list of new German words found. Each item must be an object with: "
            "'german' (German word), 'translation' (Uzbek translation), 'example_sentence' (German example), "
            "'category' (e.g. Nouns, Verbs, Greetings), 'cefr_level' (e.g. A1).\n"
            "3. 'grammar': a list of grammar points taught. Each item must have: 'topic', 'explanation_uz' (Uzbek explanation), "
            "'explanation_en' (English explanation), and 'examples' (list of objects with keys 'de' and 'uz' translation).\n\n"
            "Respond ONLY with a valid, parsable JSON block. No markdown, no triple backticks."
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": base64_data
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            res_data = response.json()

            try:
                text_out = res_data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text_out)
            except Exception as e:
                return {
                    "error": f"Failed to parse OCR content: {str(e)}",
                    "raw_response": res_data
                }

    async def parse_pdf(self, pdf_bytes: bytes) -> dict[str, Any]:
        if not self.api_key:
            return {"error": "GEMINI_API_KEY is not configured."}

        base64_data = base64.b64encode(pdf_bytes).decode("utf-8")
        url = f"{self.endpoint}?key={self.api_key}"

        prompt = (
            "Analyze this PDF lesson material. Extract the German content, then return a JSON object with "
            "the following keys:\n"
            "1. 'summary': a brief summary of the lesson/notes in Uzbek (fallback to English if difficult).\n"
            "2. 'vocabulary': a list of new German words found. Each item must be an object with: "
            "'german' (German word), 'translation' (Uzbek translation), 'example_sentence' (German example), "
            "'category' (e.g. Nouns, Verbs, Greetings), 'cefr_level' (e.g. A1).\n"
            "3. 'grammar': a list of grammar points taught. Each item must have: 'topic', 'explanation_uz' (Uzbek explanation), "
            "'explanation_en' (English explanation), and 'examples' (list of objects with 'de' and 'uz' translation).\n\n"
            "Respond ONLY with a valid, parsable JSON block. No markdown, no triple backticks."
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": "application/pdf",
                                "data": base64_data
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            res_data = response.json()

            try:
                text_out = res_data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text_out)
            except Exception as e:
                return {
                    "error": f"Failed to parse PDF content: {str(e)}",
                    "raw_response": res_data
                }

            # To switch OCR providers, we can define alternatives like Tesseract/Google Cloud Vision here.
