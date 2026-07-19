from pathlib import Path
from ..utils.xml_modifier import XMLModifier
from loguru import logger

class DatasourceBinder:
    """
    Replaces the connection properties (e.g., CSV/Hyper path) without touching 
    the internal metadata or IDs.
    """
    def bind_datasource(self, modifier: XMLModifier, data_path: str) -> bool:
        """
        Updates the connection path to point to the uploaded dataset.
        """
        path_obj = Path(data_path)
        
        # In a real template, we might search for connection[@class='textscan'] or similar
        xpath_conn = "//datasource/connection/named-connections/named-connection/connection"
        
        # Update filename
        success1 = modifier.safe_update_attr(xpath_conn, "filename", str(path_obj))
        
        # Update relation name if applicable
        xpath_rel = "//datasource/connection/relation"
        success2 = modifier.safe_update_attr(xpath_rel, "name", path_obj.name)
        
        if success1 and success2:
            logger.info(f"Successfully bound datasource to {data_path}")
            return True
        else:
            logger.warning("Failed to bind datasource. Check template connection schema.")
            return False
