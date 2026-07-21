from lxml import etree as ET
from typing import Optional, List, Union
from loguru import logger

class XMLModifier:
    """
    Core utility wrapper around lxml for safe, strict XPath operations on Tableau templates.
    Never creates new complex hierarchies from scratch.
    """
    def __init__(self, tree: ET._ElementTree):
        self.tree = tree
        self.ns = {"user": "http://www.tableausoftware.com/xml/user"}

    def safe_update_attr(self, xpath: str, attr_name: str, new_value: str) -> bool:
        """
        Updates an attribute on the first node matching the xpath.
        Returns True if updated, False if node not found.
        """
        node = self.find_node(xpath)
        if node is not None:
            node.set(attr_name, new_value)
            return True
        logger.warning(f"XMLModifier: Node not found for xpath {xpath}")
        return False

    def safe_update_node_text(self, xpath: str, text: str) -> bool:
        """
        Updates the text content of the first node matching the xpath.
        Returns True if updated, False if node not found.
        """
        node = self.find_node(xpath)
        if node is not None:
            node.text = text
            return True
        logger.warning(f"XMLModifier: Node not found for xpath {xpath}")
        return False

    def find_node(self, xpath: str) -> Optional[ET._Element]:
        """Finds the first node matching the xpath."""
        result = self.tree.xpath(xpath, namespaces=self.ns)
        if result and isinstance(result, list):
            return result[0]
        return None

    def find_nodes(self, xpath: str) -> List[ET._Element]:
        """Finds all nodes matching the xpath."""
        result = self.tree.xpath(xpath, namespaces=self.ns)
        return result if isinstance(result, list) else []

    def insert_node(self, parent_xpath: str, element: ET._Element) -> bool:
        """
        Appends a fully formed Element to a parent matching the xpath.
        Useful for calculated fields where we insert predefined safe structures.
        """
        parent = self.find_node(parent_xpath)
        if parent is not None:
            parent.append(element)
            return True
        logger.warning(f"XMLModifier: Parent not found for xpath {parent_xpath}")
        return False

    def insert_node_before(self, target_xpath: str, element: ET._Element) -> bool:
        """
        Inserts an element immediately before the first node matching target_xpath.
        """
        target = self.find_node(target_xpath)
        if target is not None:
            parent = target.getparent()
            index = parent.index(target)
            parent.insert(index, element)
            return True
        logger.warning(f"XMLModifier: Target anchor not found for xpath {target_xpath}")
        return False

    def remove_node(self, xpath: str) -> bool:
        """Removes the first node matching the xpath."""
        node = self.find_node(xpath)
        if node is not None:
            parent = node.getparent()
            if parent is not None:
                parent.remove(node)
                return True
        return False
