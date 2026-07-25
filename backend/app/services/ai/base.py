from __future__ import annotations

from abc import ABC, abstractmethod


class BaseAIProvider(ABC):
    """Abstract Base Class defining the AI Provider interface."""

    @abstractmethod
    async def generate_content(
        self,
        prompt: str,
        system_instruction: str | None = None,
        json_mode: bool = False,
    ) -> str:
        """Generates simple content response from prompt."""
        pass

    @abstractmethod
    async def chat_response(
        self,
        history: list[dict[str, str]],
        message: str,
        system_instruction: str | None = None,
        json_mode: bool = False,
    ) -> str:
        """Generates a response inside a chat history thread."""
        pass
