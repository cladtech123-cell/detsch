"""Central module registry.

Modules register themselves here at import time. The registry is the single
source of truth for "which modules are available", used by the
``/api/v1/modules`` endpoint and by the orchestration services.
"""

from __future__ import annotations

from collections.abc import Iterator

from app.modules.base import AbstractModule


class ModuleRegistry:
    """A thread-unsafe, in-memory registry of OSINT modules.

    Usage::

        from app.modules.registry import registry
        from app.modules.username.something import MyModule

        registry.register(MyModule())
        mod = registry.get("my_module")
    """

    def __init__(self) -> None:
        self._modules: dict[str, AbstractModule] = {}

    # -- registration -------------------------------------------------
    def register(self, module: AbstractModule) -> AbstractModule:
        """Register a module instance. Raises ValueError on duplicate id."""
        if not module.id:
            raise ValueError(
                f"Module {module.__class__.__name__} has no `id`; cannot register."
            )
        if module.id in self._modules:
            raise ValueError(f"Module '{module.id}' is already registered.")
        self._modules[module.id] = module
        return module

    def unregister(self, module_id: str) -> bool:
        """Remove a module by id. Returns True if it was present."""
        return self._modules.pop(module_id, None) is not None

    # -- access -------------------------------------------------------
    def get(self, module_id: str) -> AbstractModule | None:
        """Return a module by id, or None."""
        return self._modules.get(module_id)

    def all(self) -> list[AbstractModule]:
        """Return all registered modules."""
        return list(self._modules.values())

    def enabled(self) -> list[AbstractModule]:
        """Return only enabled modules."""
        return [m for m in self._modules.values() if m.enabled]

    def describe_all(self) -> list[dict]:
        """Serializable descriptions of all modules (for the API/UI)."""
        return [m.describe() for m in self._modules.values()]

    def __contains__(self, module_id: object) -> bool:
        return module_id in self._modules

    def __iter__(self) -> Iterator[AbstractModule]:
        return iter(self._modules.values())

    def __len__(self) -> int:
        return len(self._modules)


# Module-level singleton imported throughout the app.
registry = ModuleRegistry()
