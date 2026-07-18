"""
Tableau Generator — Produces a valid Tableau Workbook (.twb) XML file
from a Dashboard Blueprint.

Architecture:
  Blueprint JSON → TableauGenerator → .twb XML

The generated .twb targets Tableau Desktop 2021.1+ (schema version 18.1).
It creates:
  1. A data source with all columns correctly typed
  2. Calculated field definitions (from KPI formulas)
  3. One worksheet per chart recommendation
  4. A dashboard sheet with the blueprint's grid layout
  5. Proper color palette injection

References:
  - Tableau XML format: standard XML with tableau namespace
  - Generated files are valid for Tableau Desktop 2021.1+
"""

from __future__ import annotations

import xml.etree.ElementTree as ET
from xml.dom import minidom
from pathlib import Path
from typing import Any
from loguru import logger

# Tableau column type mappings
DTYPE_TO_TABLEAU: dict[str, dict] = {
    "numeric": {"datatype": "real", "role": "measure", "type": "quantitative"},
    "datetime": {"datatype": "datetime", "role": "dimension", "type": "ordinal"},
    "boolean": {"datatype": "boolean", "role": "dimension", "type": "nominal"},
    "categorical": {"datatype": "string", "role": "dimension", "type": "nominal"},
    "identifier": {"datatype": "string", "role": "dimension", "type": "nominal"},
}

AGGREGATION_MAP: dict[str, str] = {
    "SUM": "Sum",
    "AVG": "Average",
    "MAX": "Maximum",
    "MIN": "Minimum",
    "COUNT": "Count",
    "COUNTD": "CountDistinct",
    "MEDIAN": "Median",
    "NONE": "None",
}

MARK_TYPE_MAP: dict[str, str] = {
    "Bar": "Bar",
    "Line": "Line",
    "Circle": "Circle",
    "Square": "Square",
    "Map": "Map",
    "Pie": "Pie",
    "Text": "Text",
    "Area": "Area",
}


class TableauGenerator:
    """
    Generates a Tableau Workbook XML (.twb) from a Dashboard Blueprint.

    Usage:
        gen = TableauGenerator(blueprint, metadata, csv_path, output_dir)
        twb_path = gen.generate()
    """

    def __init__(
        self,
        blueprint: dict[str, Any],
        metadata: dict[str, Any],
        csv_path: str,
        output_dir: Path,
        project_name: str = "TableauGen Dashboard",
    ):
        self.blueprint = blueprint
        self.metadata = metadata
        self.csv_path = csv_path
        self.output_dir = output_dir
        self.project_name = project_name
        self.columns = metadata.get("columns", {})
        self.theme = blueprint.get("theme", {})
        self.palette = self.theme.get("palette", [
            "#4E79A7", "#F28E2B", "#E15759", "#76B7B2",
            "#59A14F", "#EDC948", "#B07AA1", "#FF9DA7",
        ])

    def generate(self) -> Path:
        """
        Generate the .twb XML file and return its path.

        Returns
        -------
        Path
            Absolute path to the generated .twb file.
        """
        logger.info(f"Tableau Generator: building workbook for '{self.project_name}'")

        root = ET.Element("workbook")
        root.set("source-build", "2021.1.0")
        root.set("source-platform", "win")
        root.set("version", "18.1")
        root.set("xmlns:user", "http://www.tableausoftware.com/xml/user")

        # ── Preferences (color palette) ──────────────────────────────
        prefs = ET.SubElement(root, "preferences")
        color_pref = ET.SubElement(prefs, "color-palette")
        color_pref.set("name", "TableauGen Theme")
        color_pref.set("type", "regular")
        for hex_color in self.palette:
            c = ET.SubElement(color_pref, "color")
            c.text = hex_color

        # ── Data source ──────────────────────────────────────────────
        datasources = ET.SubElement(root, "datasources")
        ds = self._build_datasource()
        datasources.append(ds)

        # ── Worksheets ───────────────────────────────────────────────
        worksheets = ET.SubElement(root, "worksheets")
        sheet_names: list[str] = []

        # KPI sheets
        for kpi in self.blueprint.get("kpis", [])[:4]:
            sheet_name = self._safe_name(f"KPI {kpi['title']}")
            ws = self._build_kpi_worksheet(kpi, sheet_name)
            worksheets.append(ws)
            sheet_names.append(sheet_name)

        # Chart sheets
        for rec in self.blueprint.get("recommendations", [])[:6]:
            sheet_name = self._safe_name(rec["title"])
            ws = self._build_chart_worksheet(rec, sheet_name)
            worksheets.append(ws)
            sheet_names.append(sheet_name)

        # ── Dashboard ────────────────────────────────────────────────
        dashboards = ET.SubElement(root, "dashboards")
        db = self._build_dashboard(sheet_names)
        dashboards.append(db)

        # ── Write to file ────────────────────────────────────────────
        self.output_dir.mkdir(parents=True, exist_ok=True)
        safe_project = self.project_name.replace(" ", "_").replace("/", "_")
        twb_path = self.output_dir / f"{safe_project}.twb"

        pretty_xml = self._pretty_print(root)
        twb_path.write_text(pretty_xml, encoding="utf-8")

        logger.info(f"Tableau Generator: wrote {twb_path} ({twb_path.stat().st_size / 1024:.1f} KB)")
        return twb_path

    # ── Data Source ──────────────────────────────────────────────────────

    def _build_datasource(self) -> ET.Element:
        ds = ET.Element("datasource")
        ds.set("hasconnection", "false")
        ds.set("inline", "true")
        ds.set("name", "TableauGenData")

        # Connection
        conn = ET.SubElement(ds, "connection")
        conn.set("class", "textscan")
        conn.set("filename", self.csv_path)
        conn.set("filetype", "csv")

        relation = ET.SubElement(conn, "relation")
        relation.set("name", Path(self.csv_path).name)
        relation.set("table", f"[{Path(self.csv_path).stem}#csv]")
        relation.set("type", "table")

        # Column metadata
        for col_name, col in self.columns.items():
            tc = self._build_column_element(col_name, col)
            ds.append(tc)

        # Calculated fields (KPI formulas)
        for kpi in self.blueprint.get("kpis", []):
            calc = ET.SubElement(ds, "column")
            calc.set("caption", kpi["title"])
            calc.set("datatype", "real")
            calc.set("name", f"[Calc_{self._safe_name(kpi['id'])}]")
            calc.set("role", "measure")
            calc.set("type", "quantitative")
            formula_el = ET.SubElement(calc, "calculation")
            formula_el.set("class", "tableau")
            formula_el.set("formula", kpi["formula"])

        return ds

    def _build_column_element(self, col_name: str, col: dict) -> ET.Element:
        dtype = col.get("inferred_dtype", "categorical")
        tableau_type = DTYPE_TO_TABLEAU.get(dtype, DTYPE_TO_TABLEAU["categorical"])

        el = ET.Element("column")
        el.set("caption", col_name)
        el.set("datatype", tableau_type["datatype"])
        el.set("name", f"[{col_name}]")
        el.set("role", tableau_type["role"])
        el.set("type", tableau_type["type"])

        # Default aggregation
        agg = col.get("default_aggregation", "Sum")
        if agg != "NONE":
            el.set("aggregation", AGGREGATION_MAP.get(agg, "Sum"))

        # Geographic role
        if col.get("semantic_type") == "geographic":
            geo = ET.SubElement(el, "geographic-role")
            geo.text = col.get("geo_role", "country")

        # Number format: stored as attribute on <column>, NOT as a child element
        display_format = col.get("display_format", "")
        if display_format == "currency":
            el.set("default-number-format", "$#,##0.00")
        elif display_format == "percentage":
            el.set("default-number-format", "0.00%")

        return el

    # ── KPI Worksheet ────────────────────────────────────────────────────

    def _build_kpi_worksheet(self, kpi: dict, sheet_name: str) -> ET.Element:
        ws = ET.Element("worksheet")
        ws.set("name", sheet_name)

        table = ET.SubElement(ws, "table")

        # Empty <view/> required before rows/cols per Tableau schema
        ET.SubElement(table, "view")

        # Empty shelves for a text/KPI card
        rows_el = ET.SubElement(table, "rows")
        rows_el.text = ""
        cols_el = ET.SubElement(table, "cols")
        cols_el.text = ""

        # Panes — mark lives inside pane, not inside view
        panes = ET.SubElement(table, "panes")
        pane = ET.SubElement(panes, "pane")
        mark = ET.SubElement(pane, "mark")
        mark.set("class", "Text")

        # Style inside table
        style = ET.SubElement(table, "style")
        rule = ET.SubElement(style, "style-rule")
        rule.set("element", "mark")
        fmt = ET.SubElement(rule, "format")
        fmt.set("attr", "size")
        fmt.set("value", "32")

        return ws

    # ── Chart Worksheet ──────────────────────────────────────────────────

    def _build_chart_worksheet(self, rec: dict, sheet_name: str) -> ET.Element:
        ws = ET.Element("worksheet")
        ws.set("name", sheet_name)

        table = ET.SubElement(ws, "table")

        # Required empty <view/> before rows/cols
        ET.SubElement(table, "view")

        tc = rec.get("tableau_config", {})
        mark_type = MARK_TYPE_MAP.get(tc.get("mark_type", "Bar"), "Bar")
        chart_type = rec.get("chart_type", "bar")

        # ── Rows / Columns shelf assignments ─────────────────────────
        rows_field = tc.get("rows", "")
        cols_field = tc.get("columns", "")

        if chart_type == "bar":
            measure = rec["fields"].get("measure", "")
            dim = rec["fields"].get("dimension", "")
            rows_el = ET.SubElement(table, "rows")
            rows_el.text = f"SUM([{measure}])" if measure else ""
            cols_el = ET.SubElement(table, "cols")
            cols_el.text = f"[{dim}]" if dim else ""

        elif chart_type == "line":
            measure = rec["fields"].get("measure", "")
            date = rec["fields"].get("date", "")
            granularity = tc.get("date_granularity", "Month")
            rows_el = ET.SubElement(table, "rows")
            rows_el.text = f"SUM([{measure}])" if measure else ""
            cols_el = ET.SubElement(table, "cols")
            cols_el.text = f"DATETRUNC('{granularity.lower()}', [{date}])" if date else ""

        elif chart_type == "scatter":
            x = rec["fields"].get("x", "")
            y = rec["fields"].get("y", "")
            rows_el = ET.SubElement(table, "rows")
            rows_el.text = f"SUM([{y}])" if y else ""
            cols_el = ET.SubElement(table, "cols")
            cols_el.text = f"SUM([{x}])" if x else ""

        elif chart_type == "pie":
            rows_el = ET.SubElement(table, "rows")
            rows_el.text = ""
            cols_el = ET.SubElement(table, "cols")
            cols_el.text = ""

        elif chart_type == "map":
            rows_el = ET.SubElement(table, "rows")
            rows_el.text = "Latitude (generated)"
            cols_el = ET.SubElement(table, "cols")
            cols_el.text = "Longitude (generated)"

        elif chart_type == "treemap":
            rows_el = ET.SubElement(table, "rows")
            rows_el.text = ""
            cols_el = ET.SubElement(table, "cols")
            cols_el.text = ""

        else:
            rows_el = ET.SubElement(table, "rows")
            rows_el.text = rows_field
            cols_el = ET.SubElement(table, "cols")
            cols_el.text = cols_field

        # ── Panes — mark lives inside pane ───────────────────────────
        panes = ET.SubElement(table, "panes")
        pane = ET.SubElement(panes, "pane")
        mark = ET.SubElement(pane, "mark")
        mark.set("class", mark_type)

        # ── Style inside table ────────────────────────────────────────
        bg_color = self.theme.get("worksheet_background", "#FFFFFF")
        style = ET.SubElement(table, "style")
        bg_rule = ET.SubElement(style, "style-rule")
        bg_rule.set("element", "pane")
        bg_fmt = ET.SubElement(bg_rule, "format")
        bg_fmt.set("attr", "background-color")
        bg_fmt.set("value", bg_color)

        return ws

    # ── Dashboard ────────────────────────────────────────────────────────

    def _build_dashboard(self, sheet_names: list[str]) -> ET.Element:
        db = ET.Element("dashboard")
        db.set("name", self._safe_name(self.project_name))

        # Size
        size_el = ET.SubElement(db, "size")
        size_el.set("maxheight", "1080")
        size_el.set("maxwidth", "1920")
        size_el.set("minheight", "600")
        size_el.set("minwidth", "800")

        # Outer container zone
        zones = ET.SubElement(db, "zones")
        outer_zone = ET.SubElement(zones, "zone")
        outer_zone.set("id", "1")
        outer_zone.set("type", "layout-basic")
        outer_zone.set("x", "0")
        outer_zone.set("y", "0")
        outer_zone.set("w", "1920")
        outer_zone.set("h", "1080")

        # Inner flow zone
        flow_zone = ET.SubElement(outer_zone, "zone")
        flow_zone.set("id", "2")
        flow_zone.set("type", "layout-flow")
        flow_zone.set("x", "0")
        flow_zone.set("y", "0")
        flow_zone.set("w", "1920")
        flow_zone.set("h", "1080")
        flow_zone.set("direction", "vertical")

        # Sheet zones — stacked vertically, type="view" (not "sheet")
        n = max(len(sheet_names), 1)
        h_each = 1080 // n
        for i, sheet_name in enumerate(sheet_names):
            sheet_zone = ET.SubElement(flow_zone, "zone")
            sheet_zone.set("id", str(10 + i))
            sheet_zone.set("name", sheet_name)
            sheet_zone.set("type", "view")   # "view" is valid; "sheet" is not in DTD
            sheet_zone.set("x", "0")
            sheet_zone.set("y", str(i * h_each))
            sheet_zone.set("w", "1920")
            sheet_zone.set("h", str(h_each))

        return db

    # ── Utilities ────────────────────────────────────────────────────────

    @staticmethod
    def _safe_name(name: str) -> str:
        """Make a string safe for use as a Tableau sheet name (max 30 chars)."""
        safe = "".join(c if c.isalnum() or c in " -_" else " " for c in name)
        return safe[:30].strip()

    @staticmethod
    def _pretty_print(element: ET.Element) -> str:
        """Return a pretty-printed XML string."""
        raw = ET.tostring(element, encoding="unicode")
        parsed = minidom.parseString(raw)
        return parsed.toprettyxml(indent="  ", encoding=None)
