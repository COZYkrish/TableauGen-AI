"""
Narrative Engine — Generates a natural-language summary of the dataset,
dashboard blueprint, and key insights.

Produces:
  1. Executive Summary       — 2-3 sentence overview of the dataset
  2. Data Story              — structured narrative with sections
  3. Chart Rationale         — why each recommended chart was selected
  4. KPI Narrative           — business meaning of each KPI card
  5. Action Items            — data-driven recommendations

All text is template-driven (no LLM required) — smart string formatting
with context-aware sentence variation.
"""

from __future__ import annotations

import random
from typing import Any
from loguru import logger


class NarrativeEngine:
    """
    Produces plain-English narratives from pipeline outputs.

    Parameters
    ----------
    metadata : dict
        MetadataEngine output
    blueprint : dict
        DashboardPlanner output
    insights : list[dict]
        InsightEngine output
    forecasts : list[dict]
        ForecastEngine output (optional)
    """

    def __init__(
        self,
        metadata: dict[str, Any],
        blueprint: dict[str, Any],
        insights: list[dict[str, Any]],
        forecasts: list[dict[str, Any]] | None = None,
    ):
        self.metadata = metadata
        self.blueprint = blueprint
        self.insights = insights
        self.forecasts = forecasts or []
        self.summary = metadata.get("summary", {})
        self.overview = metadata.get("overview", {})

    def generate(self) -> dict[str, Any]:
        """
        Generate the complete narrative package.

        Returns
        -------
        dict
            - executive_summary: str
            - data_story: list[dict]  (section title + body)
            - chart_rationales: list[dict]
            - kpi_narratives: list[dict]
            - action_items: list[str]
            - headline: str           (single attention-grabbing headline)
        """
        logger.info("Narrative Engine: generating narrative package")

        narrative = {
            "headline": self._headline(),
            "executive_summary": self._executive_summary(),
            "data_story": self._data_story(),
            "chart_rationales": self._chart_rationales(),
            "kpi_narratives": self._kpi_narratives(),
            "action_items": self._action_items(),
        }

        return narrative

    # ── Headline ─────────────────────────────────────────────────────────────

    def _headline(self) -> str:
        rows = self.overview.get("row_count", 0)
        cols = self.overview.get("column_count", 0)
        template_name = self.blueprint.get("template", "executive").title()
        recs = len(self.blueprint.get("recommendations", []))
        return (
            f"AI-Generated {template_name} Dashboard: "
            f"{recs} Charts from {rows:,} Records across {cols} Dimensions"
        )

    # ── Executive Summary ────────────────────────────────────────────────────

    def _executive_summary(self) -> str:
        rows = self.overview.get("row_count", 0)
        cols = self.overview.get("column_count", 0)
        dims = self.summary.get("dimension_count", 0)
        measures = self.summary.get("measure_count", 0)
        dates = self.summary.get("dates", [])
        has_geo = self.summary.get("has_geographic", False)
        recs = self.blueprint.get("recommendations", [])
        kpis = self.blueprint.get("kpis", [])
        template = self.blueprint.get("template", "executive")

        sentences = [
            f"This dataset contains **{rows:,} records** across **{cols} columns** "
            f"({dims} dimension{'s' if dims != 1 else ''} and {measures} measure{'s' if measures != 1 else ''}).",
        ]

        if dates:
            sentences.append(
                f"The data includes a temporal dimension (`{dates[0]}`), "
                "enabling trend analysis and time-series forecasting."
            )
        if has_geo:
            sentences.append("Geographic data was detected, enabling map-based visualizations.")

        sentences.append(
            f"TableauGen AI has designed a **{template.title()} dashboard** featuring "
            f"**{len(recs)} visualizations** and **{len(kpis)} KPI cards** "
            f"to provide comprehensive data coverage."
        )

        if self.insights:
            critical = [i for i in self.insights if i["severity"] == "critical"]
            warnings = [i for i in self.insights if i["severity"] == "warning"]
            if critical:
                sentences.append(
                    f"⚠️ **{len(critical)} critical data quality issue(s)** were detected — "
                    "review the insights panel before publishing."
                )
            elif warnings:
                sentences.append(
                    f"**{len(warnings)} data quality warning(s)** were identified — "
                    "these are noted in the insights panel below."
                )

        return " ".join(sentences)

    # ── Data Story ───────────────────────────────────────────────────────────

    def _data_story(self) -> list[dict[str, Any]]:
        sections = []

        # Dataset composition
        dims = self.summary.get("dimension_count", 0)
        measures = self.summary.get("measure_count", 0)
        sections.append({
            "title": "📊 Dataset Composition",
            "body": (
                f"Your dataset is structured around **{dims} categorical dimension{'s' if dims != 1 else ''}** "
                f"and **{measures} numeric measure{'s' if measures != 1 else ''}**. "
                + (
                    f"The measures include: {', '.join('`' + m + '`' for m in self.summary.get('measures', [])[:4])}."
                    if self.summary.get("measures") else ""
                )
            ),
        })

        # Trend section (if temporal)
        if self.forecasts:
            top_forecast = self.forecasts[0]
            direction = top_forecast["trend_direction"]
            measure = top_forecast["measure"]
            growth = top_forecast["growth_rate_pct"]
            emoji = "📈" if direction == "up" else "📉" if direction == "down" else "➡️"
            sections.append({
                "title": f"{emoji} Trend Analysis: {measure}",
                "body": (
                    f"`{measure}` shows a **{direction}ward trend** with "
                    f"**{abs(growth):.1f}% {'growth' if growth >= 0 else 'decline'}** "
                    f"over the observed period. "
                    f"The forecast ({top_forecast['confidence']} confidence) projects this pattern to continue "
                    f"for the next {len(top_forecast['forecast'])} periods."
                ),
            })

        # Top insight
        if self.insights:
            top = self.insights[0]
            sections.append({
                "title": f"🔍 Key Finding: {top['title']}",
                "body": top["description"],
            })

        # Chart coverage
        chart_types = list({r["chart_type"] for r in self.blueprint.get("recommendations", [])})
        if chart_types:
            sections.append({
                "title": "📐 Visualization Coverage",
                "body": (
                    f"The dashboard uses {len(chart_types)} chart type{'s' if len(chart_types) != 1 else ''}: "
                    f"{', '.join(t.title() for t in chart_types)}. "
                    "This combination ensures comprehensive coverage of categorical, temporal, and relational patterns in your data."
                ),
            })

        return sections

    # ── Chart Rationales ─────────────────────────────────────────────────────

    def _chart_rationales(self) -> list[dict[str, Any]]:
        return [
            {
                "chart_title": rec["title"],
                "chart_type": rec["chart_type"],
                "score": rec["score"],
                "rationale": rec["rationale"],
                "narrative": self._humanize_rationale(rec),
            }
            for rec in self.blueprint.get("recommendations", [])
        ]

    def _humanize_rationale(self, rec: dict) -> str:
        chart_type = rec["chart_type"]
        fields = rec.get("fields", {})
        score = rec["score"]
        confidence = "excellent" if score >= 90 else "good" if score >= 75 else "moderate"

        intros = {
            "bar": "A bar chart is ideal here because",
            "line": "A line chart was chosen because",
            "scatter": "A scatter plot is appropriate because",
            "pie": "A pie chart works well here because",
            "map": "A map visualization is the best choice because",
            "treemap": "A treemap is effective here because",
        }
        intro = intros.get(chart_type, "This chart was selected because")

        return (
            f"{intro} {rec['rationale'].lower().rstrip('.')}. "
            f"This is a **{confidence} match** (confidence score: {score}/100)."
        )

    # ── KPI Narratives ───────────────────────────────────────────────────────

    def _kpi_narratives(self) -> list[dict[str, Any]]:
        return [
            {
                "kpi_id": kpi["id"],
                "kpi_title": kpi["title"],
                "narrative": self._kpi_description(kpi),
            }
            for kpi in self.blueprint.get("kpis", [])
        ]

    def _kpi_description(self, kpi: dict) -> str:
        agg_descriptions = {
            "SUM": "the total accumulated",
            "AVG": "the average",
            "MAX": "the highest recorded",
            "MIN": "the lowest recorded",
            "COUNT": "the total count of",
            "COUNTD": "the number of distinct",
            "MEDIAN": "the median value of",
        }
        agg_desc = agg_descriptions.get(kpi["aggregation"], kpi["aggregation"].lower())
        field_name = kpi["field"].replace("_", " ")

        format_desc = {
            "currency": "displayed as currency",
            "percentage": "shown as a percentage",
            "integer": "shown as a whole number",
            "decimal_2": "shown to 2 decimal places",
        }.get(kpi["display_format"], "")

        return (
            f"This KPI card shows **{agg_desc} {field_name}** "
            + (f"({format_desc})" if format_desc else "")
            + f", calculated using the Tableau expression `{kpi['formula']}`."
        )

    # ── Action Items ─────────────────────────────────────────────────────────

    def _action_items(self) -> list[str]:
        actions = []

        # From quality insights
        quality_issues = [i for i in self.insights if i["type"] == "quality"]
        if quality_issues:
            actions.append(
                f"🔧 **Data Cleaning**: Address {len(quality_issues)} data quality issue(s) — "
                "particularly missing values — before sharing the dashboard."
            )

        # From correlation insights
        high_corr = [i for i in self.insights if i["type"] == "correlation" and i["severity"] == "warning"]
        if high_corr:
            pair = high_corr[0]["fields"]
            actions.append(
                f"📐 **Measure Audit**: `{pair[0]}` and `{pair[1]}` are highly correlated. "
                "Consider using only one in summary KPIs to avoid double-counting."
            )

        # From trend forecasts
        if self.forecasts:
            f = self.forecasts[0]
            emoji = "📈" if f["trend_direction"] == "up" else "📉"
            actions.append(
                f"{emoji} **Monitor Trend**: `{f['measure']}` shows a clear "
                f"{f['trend_direction']}ward trend. Set up a Tableau alert or subscription for this metric."
            )

        # Generic
        if self.blueprint.get("filters"):
            filter_labels = [f["label"] for f in self.blueprint["filters"][:2]]
            actions.append(
                f"🔍 **Add Interactivity**: Apply the suggested filters ({', '.join(filter_labels)}) "
                "in Tableau to enable self-service exploration by end users."
            )

        actions.append(
            "✅ **Export & Publish**: Download the generated `.twbx` file and open it in Tableau Desktop "
            "to review, adjust color palettes, and publish to Tableau Server or Tableau Public."
        )

        return actions
