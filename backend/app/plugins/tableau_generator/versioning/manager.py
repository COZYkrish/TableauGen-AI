from abc import ABC, abstractmethod
from typing import Any
from ..utils.xml_modifier import XMLModifier

class VersionAdapter(ABC):
    """
    Interface for version-specific Tableau XML adaptations.
    """
    @abstractmethod
    def update_dimension(self, modifier: XMLModifier, placeholder_id: str, dimension_field: str) -> bool:
        pass

    @abstractmethod
    def update_measure(self, modifier: XMLModifier, placeholder_id: str, measure_field: str) -> bool:
        pass

class VersionManager:
    """
    Factory for retrieving the correct VersionAdapter.
    """
    def __init__(self):
        self._adapters = {}

    def register(self, version: str, adapter: VersionAdapter):
        self._adapters[version] = adapter

    def get_adapter(self, version: str) -> VersionAdapter:
        if version not in self._adapters:
            raise ValueError(f"Unsupported Tableau version: {version}")
        return self._adapters[version]
