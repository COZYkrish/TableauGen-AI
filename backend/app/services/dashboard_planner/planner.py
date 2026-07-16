"""
Dashboard Planner — Assembles a platform-agnostic Dashboard Blueprint.

Fifth stage of the pipeline:
    Recommendation Engine + KPI Generator → Dashboard Planner → Blueprint JSON

The Blueprint JSON is the single source of truth for the Tableau Generator.
It describes:
- Which charts to create (from Recommendation Engine)
- KPI cards (from KPI Generator)
- Layout grid (rows × columns, spans)
- Theme configuration
- Dashboard template type (Executive, Sales, Finance, etc.)
- Filter fields

The Tableau Generator reads this Blueprint and generates the .twb XML.
"""

from __future__ import annotations

import json
from typing import Any
from loguru import logger

from app.services.recommendation_engine.engine import RecommendationEngine
from app.services.kpi_generator.engine import KPIGenerator
from app.services.dashboard_planner.themes import get_theme, list_themes


# ── Template Selection Rules ─────────────────────────────────────────────────

def _select_template(summary: dict, recommendations: list[dict]) -> str:
    """Infer the best dashboard template based on dataset characteristics."""
    has_currency = summary.get("has_currency", False)
    has_temporal = summary.get("has_temporal", False)
    has_geographic = summary.get("has_geographic", False)
    measure_count = summary.get("measure_count", 0)

    chart_types = {r["chart_type"] for r in recommendations}

    if has_geographic and "map" in chart_types:
        return "geographic"
    if has_currency and has_temporal:
        return "finance"
    if has_currency and measure_count >= 3:
        return "sales"
    if has_temporal and "line" in chart_types:
        return "executive"
    return "minimal"


def _select_theme(template: str) -> str:
    """Map template type to a default theme."""
    mapping = {
        "executive": "executive",
        "sales": "sales",
        "finance": "finance",
        "geographic": "executive",
        "minimal": "minimal",
    }
    return mapping.get(template, "executive")


# ── Grid Layout Builder ──────────────────────────────────────────────────────

def _build_grid(
    kpis: list[dict],
    recommendations: list[dict],
) -> list[dict]:
    """
    Build a grid layout descriptor.

    Returns a list of layout cells, each with:
    - row, col: grid position (1-indexed)
    - row_span, col_span: cell size in grid units
    - content_type: "kpi" | "chart"
    - content_id: id from KPI list or chart title

    Grid is 12 columns wide.
    """
    cells = []
    current_row = 1

    # ── KPI Strip (row 1): up to 4 KPIs in a horizontal strip ────────
    kpi_count = min(len(kpis), 4)
    if kpi_count > 0:
        span = 12 // kpi_count
        for i, kpi in enumerate(kpis[:kpi_count]):
            cells.append({
                "row": current_row,
                "col": i * span + 1,
                "row_span": 1,
                "col_span": span,
                "content_type": "kpi",
                "content_id": kpi["id"],
                "title": kpi["title"],
            })
        current_row += 1

    # ── Charts: prioritise line charts as wide top chart ─────────────
    chart_recs = list(recommendations)
    wide_chart = None

    # Pull out the best line/map chart for the full-width slot
    for i, rec in enumerate(chart_recs):
        if rec["chart_type"] in ("line", "map"):
            wide_chart = chart_recs.pop(i)
            break

    if wide_chart:
        cells.append({
            "row": current_row,
            "col": 1,
            "row_span": 2,
            "col_span": 12,
            "content_type": "chart",
            "content_id": wide_chart["title"],
            "chart_type": wide_chart["chart_type"],
            "title": wide_chart["title"],
        })
        current_row += 2

    # ── Remaining charts: 2 per row (6 cols each) ─────────────────────
    for i in range(0, len(chart_recs), 2):
        batch = chart_recs[i: i + 2]
        col = 1
        for rec in batch:
            span = 12 // len(batch)
            cells.append({
                "row": current_row,
                "col": col,
                "row_span": 2,
                "col_span": span,
                "content_type": "chart",
                "content_id": rec["title"],
                "chart_type": rec["chart_type"],
                "title": rec["title"],
            })
            col += span
        current_row += 2

    return cells


# ── Dashboard Planner ────────────────────────────────────────────────────────

class DashboardPlanner:
    """
    Orchestrates the Recommendation Engine and KPI Generator, then
    assembles a complete Dashboard Blueprint JSON object.
    """

    def __init__(self, metadata: dict[str, Any], theme: str | None = None):
        """
        Parameters
        ----------
        metadata : dict
            Full MetadataEngine output (overview + columns + summary).
        theme : str | None
            Explicit theme override (executive / sales / finance / minimal).
            If None, the planner auto-selects based on dataset.
        """
        self.metadata = metadata
        self.forced_theme = theme

    def plan(self) -> dict[str, Any]:
        """
        Run the full planning pipeline and return the Dashboard Blueprint.

        Returns
        -------
        dict
            {
              "template": str,
              "theme": dict,
              "kpis": list[dict],
              "recommendations": list[dict],
              "layout": list[dict],
              "filters": list[str],
              "available_themes": list[dict],
            }
        """
        summary = self.metadata.get("summary", {})
        columns = self.metadata.get("columns", {})

        # ── Stage 1: Recommendations ────────────────────────────────
        rec_engine = RecommendationEngine(self.metadata)
        recommendations = rec_engine.recommend()
        logger.info(f"Dashboard Planner: {len(recommendations)} chart recommendations")

        # ── Stage 2: KPIs ────────────────────────────────────────────
        kpi_gen = KPIGenerator(self.metadata)
        kpis = kpi_gen.generate()
        logger.info(f"Dashboard Planner: {len(kpis)} KPI cards")

        # ── Stage 3: Template & Theme ────────────────────────────────
        template = _select_template(summary, recommendations)
        theme_name = self.forced_theme or _select_theme(template)
        theme = get_theme(theme_name)
        logger.info(f"Dashboard Planner: template='{template}', theme='{theme_name}'")

        # ── Stage 4: Grid Layout ─────────────────────────────────────
        layout = _build_grid(kpis, recommendations)
        logger.info(f"Dashboard Planner: layout has {len(layout)} cells")

        # ── Stage 5: Filter suggestions ──────────────────────────────
        filters = self._suggest_filters(columns, summary)

        blueprint = {
            "template": template,
            "theme_name": theme_name,
            "theme": theme,
            "kpis": kpis,
            "recommendations": recommendations,
            "layout": layout,
            "filters": filters,
            "available_themes": list_themes(),
            "metadata_summary": {
                "dimension_count": summary.get("dimension_count", 0),
                "measure_count": summary.get("measure_count", 0),
                "date_count": summary.get("date_count", 0),
                "has_geographic": summary.get("has_geographic", False),
                "has_temporal": summary.get("has_temporal", False),
                "has_currency": summary.get("has_currency", False),
            },
        }

        return blueprint

    @staticmethod
    def _suggest_filters(columns: dict, summary: dict) -> list[dict]:
        """Suggest which columns should be interactive filter controls."""
        filters = []

        # Date columns → date range picker
        for date_col in summary.get("dates", [])[:2]:
            col = columns.get(date_col, {})
            filters.append({
                "field": date_col,
                "filter_type": "date_range",
                "label": date_col.replace("_", " ").title(),
                "hierarchy": col.get("date_hierarchy", ["Year", "Month"]),
            })

        # Low-cardinality dimensions → multi-select dropdown
        for dim in summary.get("dimensions", []):
            col = columns.get(dim, {})
            unique = col.get("unique_count", 9999)
            if 2 <= unique <= 25 and col.get("field_role") != "identifier":
                filters.append({
                    "field": dim,
                    "filter_type": "multiselect",
                    "label": dim.replace("_", " ").title(),
                    "values_count": unique,
                })

        return filters[:5]  # max 5 filters
