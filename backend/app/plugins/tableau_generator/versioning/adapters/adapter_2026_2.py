from ..manager import VersionAdapter
from ...utils.xml_modifier import XMLModifier

class Adapter2026_2(VersionAdapter):
    """
    Adapter for Tableau Desktop 2026.2 (Schema).
    Implements safe operations for replacing dimensions and measures in placeholders.
    """
    def update_dimension(self, modifier: XMLModifier, placeholder_id: str, dimension_field: str) -> bool:
        field_name = dimension_field.strip("[]")
        
        # We need to replace all occurrences of dummy_dimension in text and attributes 
        # (e.g. <column-instance> and <cols> text)
        nodes = modifier.find_nodes(f"//worksheet[@name='{placeholder_id}']//*")
        if not nodes:
            return False
            
        for node in nodes:
            if node.text and "dummy_dimension" in node.text:
                node.text = node.text.replace("dummy_dimension", field_name)
            for attr, val in node.attrib.items():
                if "dummy_dimension" in val:
                    node.set(attr, val.replace("dummy_dimension", field_name))
                    
        return True

    def update_measure(self, modifier: XMLModifier, placeholder_id: str, measure_field: str) -> bool:
        # measure_field is passed as [usr:Field:qk] from WorksheetBinder
        field_raw = measure_field.strip("[]")
        field_name = field_raw.split(":")[1] if ":" in field_raw else field_raw
        
        nodes = modifier.find_nodes(f"//worksheet[@name='{placeholder_id}']//*")
        if not nodes:
            return False
            
        for node in nodes:
            if node.text:
                if "sum:dummy_measure:qk" in node.text:
                    node.text = node.text.replace("sum:dummy_measure:qk", field_raw)
                if "dummy_measure" in node.text:
                    node.text = node.text.replace("dummy_measure", field_name)
                    
            for attr, val in node.attrib.items():
                if "sum:dummy_measure:qk" in val:
                    node.set(attr, val.replace("sum:dummy_measure:qk", field_raw))
                if "dummy_measure" in val:
                    node.set(attr, val.replace("dummy_measure", field_name))
                    
        return True
