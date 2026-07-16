"""
Recommendation Engine — Orchestrates all chart-type rule modules and
produces a ranked list of ChartRecommendation objects.

This is the third stage of the pipeline:
    Metadata Engine → Recommendation Engine → Dashboard Planner

The engine imports each rule module, collects their recommendations,
deduplicates, normalises scores, and returns the top N results.
"""

from __future__ import annotations

from typing import Any
from loguru import logger

from app.services.recommendation_engine.rules import (
    bar_rules,
    line_rules,
    scatter_rules,
    pie_rules,
    map_rules,
    treemap_rules,
)

# Maximum number of chart recommendations to return per dataset
MAX_RECOMMENDATIONS = 8


class RecommendationEngine:
    """
    Consumes the output of MetadataEngine and returns a ranked list of
    chart recommendations, each with a score (0–100), rationale, and
    Tableau-specific configuration hints.
    """

    def __init__(self, metadata: dict[str, Any]):
        """
        Parameters
        ----------
        metadata : dict
            The full output of MetadataEngine.analyze():
            { "overview": ..., "columns": {...}, "summary": {...} }
        """
        self.metadata = metadata

    def recommend(self) -> list[dict[str, Any]]:
        """
        Run all rule modules and return a consolidated, ranked list of
        chart recommendations.

        Returns
        -------
        list[dict]
            Each item contains:
            - chart_type: str          e.g. "bar", "line", "scatter", "map"
            - title: str               Human-readable chart title
            - score: int               0–100 confidence score
            - rationale: str           Why this chart was recommended
            - fields: dict             Which columns to use (dimension, measure, etc.)
            - tableau_config: dict     Tableau-specific mark/encoding config
        """
        summary = self.metadata.get("summary", {})
        overview = self.metadata.get("overview", {})

        logger.info(
            f"Recommendation Engine: {overview.get('column_count', 0)} columns | "
            f"{summary.get('dimension_count', 0)} dims, {summary.get('measure_count', 0)} measures, "
            f"{len(summary.get('dates', []))} dates, "
            f"geo={summary.get('has_geographic', False)}"
        )

        all_recommendations: list[dict] = []

        # ── Run each rule module ────────────────────────────────────────
        rule_modules = [
            ("bar", bar_rules),
            ("line", line_rules),
            ("scatter", scatter_rules),
            ("pie", pie_rules),
            ("map", map_rules),
            ("treemap", treemap_rules),
        ]

        for chart_type, module in rule_modules:
            try:
                recs = module.evaluate(self.metadata)
                logger.debug(f"  [{chart_type}] → {len(recs)} recommendation(s)")
                all_recommendations.extend(recs)
            except Exception as e:
                logger.warning(f"  [{chart_type}] rule failed: {e}")

        # ── Sort by score descending ────────────────────────────────────
        all_recommendations.sort(key=lambda r: r["score"], reverse=True)

        # ── Limit and return ────────────────────────────────────────────
        result = all_recommendations[:MAX_RECOMMENDATIONS]
        logger.info(f"Recommendation Engine: returning {len(result)} recommendations (top score: {result[0]['score'] if result else 'N/A'})")
        return result
