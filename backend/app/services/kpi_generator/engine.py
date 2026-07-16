"""
KPI Generator — Produces KPI card definitions from measure columns.

Fourth stage of the pipeline:
    Metadata Engine → KPI Generator → Dashboard Planner

Each KPI card includes:
- A title and icon suggestion
- The aggregation formula (SUM, AVG, MAX, etc.)
- A Tableau Calculated Field expression
- Display format (currency, percentage, integer, etc.)
- Optional comparison (vs previous period if a date column exists)
"""

from __future__ import annotations

from typing import Any
from loguru import logger

# Priority order for KPI semantic types (most business-impactful first)
SEMANTIC_PRIORITY = [
    "currency",
    "quantity",
    "percentage",
    "ratio",
    "count",
    "numeric",
]

# Icon suggestions per semantic type (Lucide icon names)
SEMANTIC_ICONS = {
    "currency": "DollarSign",
    "quantity": "Package",
    "percentage": "Percent",
    "ratio": "TrendingUp",
    "count": "Hash",
    "numeric": "BarChart2",
}

# Aggregation → human label
AGG_LABELS = {
    "SUM": "Total",
    "AVG": "Average",
    "MAX": "Maximum",
    "MIN": "Minimum",
    "COUNT": "Count",
    "COUNTD": "Unique Count",
    "MEDIAN": "Median",
}

# Max KPI cards to generate
MAX_KPIS = 6


class KPIGenerator:
    """
    Generates KPI card definitions from column metadata produced by the
    MetadataEngine.

    Returns up to MAX_KPIS KPI objects, prioritised by business impact.
    """

    def __init__(self, metadata: dict[str, Any]):
        self.metadata = metadata
        self.columns: dict[str, Any] = metadata.get("columns", {})
        self.summary: dict[str, Any] = metadata.get("summary", {})

    def generate(self) -> list[dict[str, Any]]:
        """
        Produce a ranked list of KPI card definitions.

        Returns
        -------
        list[dict]
            Each item contains:
            - id: str                   Unique identifier
            - title: str                Display title (e.g. "Total Revenue")
            - field: str                Source column name
            - aggregation: str          SUM / AVG / MAX / etc.
            - formula: str              Tableau calculated field expression
            - display_format: str       currency / percentage / integer / decimal_2
            - icon: str                 Lucide icon name
            - semantic_type: str        currency / quantity / etc.
            - priority: int             Lower = more important (for layout)
        """
        measures = self.summary.get("measures", [])
        dates = self.summary.get("dates", [])
        has_date = len(dates) > 0

        logger.info(f"KPI Generator: {len(measures)} measure(s) → generating KPIs")

        kpis: list[dict] = []

        for measure_name in measures:
            col = self.columns.get(measure_name, {})
            semantic = col.get("semantic_type", "numeric")
            display_format = col.get("display_format", "decimal_2")
            agg = col.get("default_aggregation", "SUM")

            # Generate primary KPI (main aggregation)
            primary = self._build_kpi(
                measure_name=measure_name,
                semantic=semantic,
                display_format=display_format,
                aggregation=agg,
                priority=SEMANTIC_PRIORITY.index(semantic) if semantic in SEMANTIC_PRIORITY else 99,
            )
            kpis.append(primary)

            # For currency/quantity columns, also generate an AVG card
            if semantic in ("currency", "quantity") and agg == "SUM":
                avg_kpi = self._build_kpi(
                    measure_name=measure_name,
                    semantic=semantic,
                    display_format=display_format,
                    aggregation="AVG",
                    priority=SEMANTIC_PRIORITY.index(semantic) + 10,
                )
                kpis.append(avg_kpi)

        # Sort by priority
        kpis.sort(key=lambda k: k["priority"])

        # Deduplicate by (field, aggregation) — keep first occurrence
        seen: set[tuple] = set()
        unique_kpis: list[dict] = []
        for k in kpis:
            key = (k["field"], k["aggregation"])
            if key not in seen:
                seen.add(key)
                unique_kpis.append(k)

        result = unique_kpis[:MAX_KPIS]
        logger.info(f"KPI Generator: produced {len(result)} KPI card(s)")
        return result

    # ── Helpers ─────────────────────────────────────────────────────────

    def _build_kpi(
        self,
        measure_name: str,
        semantic: str,
        display_format: str,
        aggregation: str,
        priority: int,
    ) -> dict[str, Any]:
        """Construct a single KPI card dict."""
        agg_label = AGG_LABELS.get(aggregation, aggregation.title())
        title = f"{agg_label} {_humanize(measure_name)}"
        formula = self._build_formula(measure_name, aggregation)
        kpi_id = f"{measure_name}_{aggregation}".lower().replace(" ", "_")

        return {
            "id": kpi_id,
            "title": title,
            "field": measure_name,
            "aggregation": aggregation,
            "formula": formula,
            "display_format": display_format,
            "icon": SEMANTIC_ICONS.get(semantic, "BarChart2"),
            "semantic_type": semantic,
            "priority": priority,
        }

    @staticmethod
    def _build_formula(field: str, aggregation: str) -> str:
        """Generate a Tableau Calculated Field expression string."""
        safe_field = f"[{field}]"
        agg_map = {
            "SUM": f"SUM({safe_field})",
            "AVG": f"AVG({safe_field})",
            "MAX": f"MAX({safe_field})",
            "MIN": f"MIN({safe_field})",
            "COUNT": f"COUNT({safe_field})",
            "COUNTD": f"COUNTD({safe_field})",
            "MEDIAN": f"MEDIAN({safe_field})",
            "NONE": safe_field,
        }
        return agg_map.get(aggregation, f"{aggregation}({safe_field})")


def _humanize(field_name: str) -> str:
    """Convert snake_case or CamelCase field names to Title Case."""
    return field_name.replace("_", " ").replace("-", " ").title()
