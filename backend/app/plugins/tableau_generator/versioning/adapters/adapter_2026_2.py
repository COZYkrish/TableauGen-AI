from ..manager import VersionAdapter
from ...utils.xml_modifier import XMLModifier

class Adapter2026_2(VersionAdapter):
    """
    Adapter for Tableau Desktop 2026.2 (Schema).
    Implements safe operations for replacing dimensions and measures in placeholders.
    """
    def update_dimension(self, modifier: XMLModifier, placeholder_id: str, dimension_field: str) -> bool:
        # Example XPath: Find the placeholder worksheet, find the column shelf, replace the reference.
        # This is highly specific to Tableau's schema.
        xpath = f"//worksheet[@name='{placeholder_id}']//cols/dimension"
        return modifier.safe_update_attr(xpath, "name", dimension_field)

    def update_measure(self, modifier: XMLModifier, placeholder_id: str, measure_field: str) -> bool:
        xpath = f"//worksheet[@name='{placeholder_id}']//rows/measure"
        return modifier.safe_update_attr(xpath, "name", measure_field)
