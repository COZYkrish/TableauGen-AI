from ..utils.xml_modifier import XMLModifier
from ..planning.blueprint_models import DashboardBlueprint
from loguru import logger

class DashboardBinder:
    """
    Updates dashboard titles and text objects.
    """
    def bind_dashboard(self, modifier: XMLModifier, blueprint: DashboardBlueprint) -> bool:
        # Update the main dashboard title if there is one
        # Assuming the template has a title text block we can identify
        # Here we just look for a well-known placeholder string in the text runs
        xpath = "//dashboard//run[contains(text(), 'Dashboard_Title_Placeholder')]"
        if modifier.find_node(xpath) is not None:
            modifier.safe_update_node_text(xpath, blueprint.dashboard_title)
            logger.info("Bound dashboard title.")
            return True
        else:
            logger.info("No dashboard title placeholder found, skipping.")
            return True # Not a critical failure
