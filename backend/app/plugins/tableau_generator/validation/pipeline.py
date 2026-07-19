from lxml import etree as ET
from loguru import logger
from ..planning.blueprint_models import DashboardBlueprint

class ValidationPipeline:
    """
    Layered approach ensures failures are caught early and gracefully.
    """
    def validate_blueprint(self, blueprint: DashboardBlueprint) -> bool:
        if not blueprint.charts:
            logger.warning("Validation failed: Blueprint has no charts.")
            return False
        return True

    def validate_xml(self, tree: ET._ElementTree) -> bool:
        # Check basic XML structure for Tableau
        if tree.getroot().tag != "workbook":
            logger.warning("Validation failed: Root is not 'workbook'.")
            return False
        return True

    def validate_references(self, tree: ET._ElementTree) -> bool:
        # Ensure that no empty names exist in calculations
        empty_calcs = tree.xpath("//calculation[@formula='']", namespaces={"user": "http://www.tableausoftware.com/xml/user"})
        if empty_calcs:
            logger.warning("Validation failed: Empty calculation formula found.")
            return False
        return True

    def run_all_layers(self, blueprint: DashboardBlueprint, tree: ET._ElementTree) -> bool:
        """
        Runs all validation layers sequentially.
        """
        if not self.validate_blueprint(blueprint): return False
        if not self.validate_xml(tree): return False
        if not self.validate_references(tree): return False
        
        logger.info("All validation layers passed successfully.")
        return True
