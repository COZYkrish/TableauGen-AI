from pydantic import BaseModel
from typing import Dict, List
from pathlib import Path
from loguru import logger
from .capability_matrix import CapabilityMatrix, get_capability_matrix

class TemplateInfo(BaseModel):
    id: str
    name: str
    version: str
    theme: str
    file_path: str
    worksheets: List[str]
    filters: List[str]
    capabilities: CapabilityMatrix

class TemplateRegistry:
    """
    Source of truth for all available baseline templates.
    """
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.templates: Dict[str, TemplateInfo] = {}
        self._load_registry()

    def _load_registry(self):
        # In a real system, this might parse YAML metadata files.
        # Here we mock it for the specified standard templates.
        
        self.templates["executive_v1"] = TemplateInfo(
            id="executive_v1",
            name="Executive Summary",
            version="2026.2",
            theme="Executive",
            file_path=str(self.base_dir / "executive" / "executive.twb"),
            worksheets=["Sales Trend", "Profit Analysis", "Region Performance"],
            filters=["Region", "Year"],
            capabilities=get_capability_matrix("executive")
        )
        
        self.templates["operations_v1"] = TemplateInfo(
            id="operations_v1",
            name="Operations Dashboard",
            version="2026.2",
            theme="Operations",
            file_path=str(self.base_dir / "operations" / "operations.twb"),
            worksheets=["Fulfillment Rate", "Inventory Levels"],
            filters=["Region", "Status"],
            capabilities=get_capability_matrix("operations")
        )
        
        self.templates["minimal_v1"] = TemplateInfo(
            id="minimal_v1",
            name="Minimal Summary",
            version="2026.2",
            theme="Minimal",
            file_path=str(self.base_dir / "minimal" / "minimal.twb"),
            worksheets=["Basic Chart 1", "Basic Chart 2"],
            filters=[],
            capabilities=get_capability_matrix("minimal")
        )

    def get_template(self, target_id: str) -> TemplateInfo:
        """
        Retrieves template info, with a fallback to minimal if not found.
        """
        if target_id not in self.templates:
            logger.warning(f"Template {target_id} not found. Falling back to minimal_v1.")
            return self.templates["minimal_v1"]
        return self.templates[target_id]

    def get_capabilities(self, theme: str) -> CapabilityMatrix:
        return get_capability_matrix(theme)
