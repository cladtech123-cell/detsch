"""OSINT module package.

This package hosts the pluggable OSINT modules. Each module conforms to the
:class:`~app.modules.base.AbstractModule` interface and registers itself in
the :class:`~app.modules.registry.ModuleRegistry`.
"""

from app.modules.base import AbstractModule, ModuleInput, ModuleResult
from app.modules.registry import registry

__all__ = ["AbstractModule", "ModuleInput", "ModuleResult", "registry"]
