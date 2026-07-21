from typing import List
from lxml import etree as ET
from ..utils.xml_modifier import XMLModifier
from ..planning.blueprint_models import KPIBlueprint
from loguru import logger

class CalculationBinder:
    """
    Injects calculated fields into the XML.
    """
    def inject_calculations(self, modifier: XMLModifier, kpis: List[KPIBlueprint]) -> bool:
        # Target the main datasource that contains a connection
        # Tableau requires <column> to appear before <column-instance>, <layout>, <semantic-values> etc.
        anchor_xpath = "//datasource[connection]/column-instance[1] | //datasource[connection]/layout | //datasource[connection]/semantic-values"
        
        success = True
        for kpi in kpis:
            # We construct the element here, but strictly following Tableau valid syntax
            col_el = ET.Element("column", {
                "caption": kpi.title,
                "datatype": "real",
                "name": f"[{kpi.title}]",
                "role": "measure",
                "type": "quantitative"
            })
            calc_el = ET.SubElement(col_el, "calculation", {
                "class": "tableau",
                "formula": kpi.formula
            })
            
            # Add tail for pretty formatting in the XML
            col_el.tail = "\n      "
            
            if not modifier.insert_node_before(anchor_xpath, col_el):
                logger.warning(f"Could not find anchor for KPI {kpi.title}. Attempting fallback append.")
                if not modifier.insert_node("//datasource[connection]", col_el):
                    success = False
                
        return success
