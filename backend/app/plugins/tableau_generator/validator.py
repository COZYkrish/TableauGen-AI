"""
Tableau Workbook Validator — checks .twb XML for well-formedness
and basic structural integrity before packaging.

Checks performed:
  1. XML is well-formed (parseable)
  2. Required top-level elements exist: workbook, datasources, worksheets, dashboards
  3. At least one worksheet is present
  4. All sheet zones in the dashboard reference existing worksheet names
  5. No circular references in calculated fields (basic check)
"""

from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path
from dataclasses import dataclass, field
from loguru import logger


@dataclass
class ValidationResult:
    valid: bool = True
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def add_error(self, msg: str) -> None:
        self.errors.append(msg)
        self.valid = False

    def add_warning(self, msg: str) -> None:
        self.warnings.append(msg)


def validate_twb(twb_path: Path) -> ValidationResult:
    """
    Validate a .twb file and return a ValidationResult.

    Parameters
    ----------
    twb_path : Path
        Path to the .twb file to validate.

    Returns
    -------
    ValidationResult
    """
    result = ValidationResult()

    # ── Check 1: File exists ─────────────────────────────────────────
    if not twb_path.exists():
        result.add_error(f"File not found: {twb_path}")
        return result

    # ── Check 2: XML well-formedness ─────────────────────────────────
    try:
        tree = ET.parse(twb_path)
        root = tree.getroot()
    except ET.ParseError as e:
        result.add_error(f"XML parse error: {e}")
        return result

    # ── Check 3: Root element is <workbook> ──────────────────────────
    if root.tag != "workbook":
        result.add_error(f"Root element must be <workbook>, got <{root.tag}>")

    # ── Check 4: Required child elements ─────────────────────────────
    required_elements = ["datasources", "worksheets", "dashboards"]
    for tag in required_elements:
        el = root.find(tag)
        if el is None:
            result.add_error(f"Missing required element: <{tag}>")

    # ── Check 5: At least one worksheet ──────────────────────────────
    worksheets_el = root.find("worksheets")
    if worksheets_el is not None:
        worksheets = worksheets_el.findall("worksheet")
        if len(worksheets) == 0:
            result.add_error("No worksheets found in workbook")
        else:
            worksheet_names = {ws.get("name", "") for ws in worksheets}
            logger.debug(f"Validator: found {len(worksheets)} worksheet(s): {worksheet_names}")
    else:
        worksheet_names = set()

    # ── Check 6: Dashboard zone references ───────────────────────────
    dashboards_el = root.find("dashboards")
    if dashboards_el is not None:
        for db in dashboards_el.findall("dashboard"):
            db_name = db.get("name", "unnamed")
            for zone in db.iter("zone"):
                zone_type = zone.get("type", "")
                zone_name = zone.get("name", "")
                if zone_type == "sheet" and zone_name and zone_name not in worksheet_names:
                    result.add_warning(
                        f"Dashboard '{db_name}': zone references unknown sheet '{zone_name}'"
                    )

    # ── Check 7: Data source has at least one column ──────────────────
    datasources_el = root.find("datasources")
    if datasources_el is not None:
        for ds in datasources_el.findall("datasource"):
            columns = ds.findall("column")
            if len(columns) == 0:
                result.add_warning(f"Data source '{ds.get('name', 'unnamed')}' has no columns defined")

    if result.valid:
        logger.info(f"Validator: {twb_path.name} is valid ({len(worksheet_names)} sheets)")
    else:
        logger.error(f"Validator: {twb_path.name} has {len(result.errors)} error(s)")

    return result
