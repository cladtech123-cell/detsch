from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class BaseOCRProvider(ABC):
    """Abstract Base Class for OCR providers."""

    @abstractmethod
    async def extract_text(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
        """Extracts raw text from an image."""
        pass

    @abstractmethod
    async def parse_classroom_material(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> dict[str, Any]:
        """Parses classroom whiteboard photos or notes, returning structured JSON with vocabulary, grammar, and summary."""
        pass

    @abstractmethod
    async def parse_pdf(self, pdf_bytes: bytes) -> dict[str, Any]:
        """Parses classroom PDFs, returning structured JSON with vocabulary, grammar, and summary."""
        pass
