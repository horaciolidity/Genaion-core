"""
GENAION Skills — Base Skill Architecture
Every skill has metadata, permissions declaration, configuration, an execution method, and self-tests.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BaseSkill(ABC):
    """Abstract base class for all GENAION skills."""

    id: str = "base_skill"
    name: str = "Base Skill"
    description: str = "Skill description"
    category: str = "general"
    version: str = "0.1.0"
    required_permissions: List[str] = []
    default_config: Dict[str, Any] = {}

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = {**self.default_config, **(config or {})}
        self.is_active: bool = True

    @abstractmethod
    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the skill with provided parameters."""
        pass

    @abstractmethod
    def run_tests(self) -> Dict[str, Any]:
        """Execute built-in self-tests to verify skill integrity."""
        pass

    def get_manifest(self) -> Dict[str, Any]:
        """Return full manifest representation."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "version": self.version,
            "permissions": self.required_permissions,
            "config": self.config,
            "is_active": self.is_active
        }
