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
        datasource_xpath = "//datasource"
        success = True
        for kpi in kpis:
            # We construct the element here, but strictly following Tableau valid syntax
            col_el = ET.Element("column", {
                "caption": kpi.title,
                "datatype": "real",
                "name": f"[{kpi.id}]",
                "role": "measure",
                "type": "quantitative"
            })
            calc_el = ET.SubElement(col_el, "calculation", {
                "class": "tableau",
                "formula": kpi.formula
            })
            
            if not modifier.insert_node(datasource_xpath, col_el):
                logger.warning(f"Failed to inject KPI {kpi.title}")
                success = False
                
        return success
