"""Abstract OSINT module interface.

Every OSINT capability in the toolkit is implemented as a module that
subclasses :class:`AbstractModule` and implements :meth:`run`.

This file defines the contract only; concrete modules are added in a later
phase.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ModuleCategory(str, Enum):
    """Coarse category a module belongs to (drives UI grouping)."""

    USERNAME = "username"
    PEOPLE = "people"
    IMAGES = "images"
    SOCIAL = "social"
    DOMAINS = "domains"
    NETWORK = "network"
    WEB = "web"
    FILES = "files"
    OTHER = "other"


class ModuleInput(BaseModel):
    """Normalized input handed to a module's :meth:`run`.

    Modules declare which ``input_type`` they accept; the orchestration layer
    is responsible for constructing the right payload for each module.
    """

    input_type: str = Field(..., description="Type of the target: username, email, image, url, ip, domain…")
    value: str = Field(..., description="The raw target value")
    options: dict[str, Any] = Field(default_factory=dict, description="Module-specific options")


class ModuleFinding(BaseModel):
    """A single finding/artifact produced by a module."""

    label: str
    value: Any
    source: str | None = None
    confidence: float = Field(1.0, ge=0.0, le=1.0)
    raw: dict[str, Any] | None = None


class ModuleResult(BaseModel):
    """The structured result returned by a module run."""

    module_id: str
    success: bool = True
    findings: list[ModuleFinding] = Field(default_factory=list)
    error: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class AbstractModule(ABC):
    """Base class all OSINT modules must implement.

    Subclasses set the class attributes and implement :meth:`run`. The module
    is registered automatically when instantiated, or explicitly via the
    :class:`~app.modules.registry.ModuleRegistry`.
    """

    # --- Identity (override in subclasses) ---
    id: str = ""
    name: str = ""
    description: str = ""
    category: ModuleCategory = ModuleCategory.OTHER
    input_types: tuple[str, ...] = ()
    enabled: bool = True
    requires_api_key: bool = False

    @abstractmethod
    async def run(self, module_input: ModuleInput) -> ModuleResult:
        """Execute the module against the given input and return findings.

        This is the only method subclasses MUST implement. Phase 1 ships no
        concrete modules, so no subclass overrides exist yet.
        """
        raise NotImplementedError

    # --- Introspection helpers ---
    def describe(self) -> dict[str, Any]:
        """Return a serializable description of this module (for the UI)."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category.value,
            "input_types": list(self.input_types),
            "enabled": self.enabled,
            "requires_api_key": self.requires_api_key,
        }

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Module {self.id or self.__class__.__name__}>"
