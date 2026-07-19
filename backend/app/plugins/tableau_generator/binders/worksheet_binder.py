from typing import List
from ..utils.xml_modifier import XMLModifier
from ..planning.blueprint_models import ChartBlueprint
from ..versioning.manager import VersionManager
from loguru import logger

class WorksheetBinder:
    """
    Replaces Placeholder components with actual Blueprint dimensions/measures.
    """
    def __init__(self, version_manager: VersionManager, version: str):
        self.adapter = version_manager.get_adapter(version)
        
    def bind_charts(self, modifier: XMLModifier, charts: List[ChartBlueprint]) -> bool:
        success = True
        for chart in charts:
            logger.info(f"Binding {chart.type} chart to {chart.placeholder}")
            
            # Use adapter to update dimension (x-axis)
            if chart.x:
                if not self.adapter.update_dimension(modifier, chart.placeholder, f"[{chart.x}]"):
                    logger.warning(f"Failed to bind dimension {chart.x} to {chart.placeholder}")
                    success = False
                    
            # Use adapter to update measure (y-axis)
            if chart.y:
                if not self.adapter.update_measure(modifier, chart.placeholder, f"[sum:{chart.y}:qk]"):
                    logger.warning(f"Failed to bind measure {chart.y} to {chart.placeholder}")
                    success = False
                    
        return success
