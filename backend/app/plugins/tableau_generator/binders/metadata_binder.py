from typing import Dict, Any
from ..utils.xml_modifier import XMLModifier
from loguru import logger

class MetadataBinder:
    """
    Updates the aliases and default formats for fields inside the template.
    """
    def bind_metadata(self, modifier: XMLModifier, semantic_metadata: Dict[str, Any]) -> bool:
        success_count = 0
        for col_name, meta in semantic_metadata.items():
            # In a real template, we update the <column> tags to reflect correct datatype and role
            # We assume Tableau uses [FieldName] notation internally
            xpath = f"//datasource/column[@name='[{col_name}]']"
            
            # This is a safe update - if the column doesn't explicitly exist as an override,
            # we don't force create it from scratch to avoid breaking schema.
            if modifier.find_node(xpath) is not None:
                modifier.safe_update_attr(xpath, "datatype", meta["tableau_datatype"])
                modifier.safe_update_attr(xpath, "role", meta["role"])
                success_count += 1
                
        logger.info(f"Bound {success_count} explicit column metadata overrides.")
        return True
