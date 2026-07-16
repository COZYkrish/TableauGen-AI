"""
Insight Engine — Derives statistical insights from dataset profile + metadata.

Produces a ranked list of plain-English insights in five categories:
  1. Distribution Insights   — skewness, outliers, zero-inflation
  2. Correlation Insights    — strong linear relationships between measures
  3. Trend Insights          — direction/growth in temporal measures
  4. Concentration Insights  — Pareto (80/20) distribution in dimensions
  5. Quality Insights        — missing data, low-cardinality flags

Each insight has:
  - type: str             (distribution | correlation | trend | concentration | quality)
  - severity: str         (info | warning | critical)
  - title: str
  - description: str
  - fields: list[str]
  - metric: float | None  (the underlying numeric that triggered the insight)
"""

from __future__ import annotations

import math
from typing import Any
from loguru import logger


SEVERITY_RANK = {"critical": 3, "warning": 2, "info": 1}
MAX_INSIGHTS = 12


class InsightEngine:
    """
    Generates statistical insights from the output of DatasetProfiler
    and MetadataEngine.
    """

    def __init__(self, profile: dict[str, Any], metadata: dict[str, Any]):
        self.profile = profile
        self.metadata = metadata
        self.columns: dict[str, Any] = metadata.get("columns", {})
        self.summary: dict[str, Any] = metadata.get("summary", {})
        self.col_profiles: dict[str, Any] = profile.get("columns", {})

    def generate(self) -> list[dict[str, Any]]:
        """
        Run all insight detectors and return a ranked list.

        Returns
        -------
        list[dict]
            Each item:
            - id: str
            - type: str
            - severity: str
            - title: str
            - description: str
            - fields: list[str]
            - metric: float | None
        """
        insights: list[dict] = []

        insights.extend(self._distribution_insights())
        insights.extend(self._correlation_insights())
        insights.extend(self._trend_insights())
        insights.extend(self._concentration_insights())
        insights.extend(self._quality_insights())

        # Sort by severity desc, then metric desc
        insights.sort(
            key=lambda i: (SEVERITY_RANK.get(i["severity"], 0), abs(i.get("metric") or 0)),
            reverse=True,
        )

        # Assign sequential IDs
        for idx, ins in enumerate(insights):
            ins["id"] = f"insight_{idx + 1}"

        result = insights[:MAX_INSIGHTS]
        logger.info(f"Insight Engine: generated {len(result)} insight(s)")
        return result

    # ── Distribution Insights ────────────────────────────────────────────────

    def _distribution_insights(self) -> list[dict]:
        insights = []
        for col_name, col in self.col_profiles.items():
            if col.get("dtype") not in ("float64", "int64"):
                continue

            skew = col.get("skewness")
            null_pct = col.get("null_percentage", 0)
            zero_pct = col.get("zero_percentage", 0)
            cv = col.get("coefficient_of_variation")

            # High skewness
            if skew is not None and abs(skew) > 2:
                direction = "right (positively)" if skew > 0 else "left (negatively)"
                insights.append({
                    "type": "distribution",
                    "severity": "warning" if abs(skew) > 5 else "info",
                    "title": f"{col_name} is Highly Skewed",
                    "description": (
                        f"{col_name} is strongly skewed {direction} (skewness = {skew:.2f}). "
                        "Consider log-transforming this field before visualization for clearer trends."
                    ),
                    "fields": [col_name],
                    "metric": round(skew, 3),
                })

            # Zero-inflation
            if zero_pct is not None and zero_pct > 40:
                insights.append({
                    "type": "distribution",
                    "severity": "warning",
                    "title": f"{col_name} is Zero-Inflated",
                    "description": (
                        f"{zero_pct:.1f}% of {col_name} values are zero. "
                        "This can distort averages. Consider filtering zeros or using a separate KPI for non-zero records."
                    ),
                    "fields": [col_name],
                    "metric": round(zero_pct, 1),
                })

            # High volatility
            if cv is not None and cv > 1.5:
                insights.append({
                    "type": "distribution",
                    "severity": "info",
                    "title": f"{col_name} Has High Volatility",
                    "description": (
                        f"{col_name} has a coefficient of variation of {cv:.2f}, indicating high dispersion relative to its mean. "
                        "Use median or percentile KPIs rather than averages."
                    ),
                    "fields": [col_name],
                    "metric": round(cv, 3),
                })

        return insights

    # ── Correlation Insights ─────────────────────────────────────────────────

    def _correlation_insights(self) -> list[dict]:
        insights = []
        corr_matrix = self.profile.get("correlations", {})

        seen: set[tuple] = set()
        for col_a, row in corr_matrix.items():
            for col_b, corr in row.items():
                if col_a == col_b:
                    continue
                pair = tuple(sorted([col_a, col_b]))
                if pair in seen:
                    continue
                seen.add(pair)

                if corr is None:
                    continue
                abs_corr = abs(corr)
                if abs_corr >= 0.85:
                    direction = "positively" if corr > 0 else "negatively"
                    severity = "warning" if abs_corr >= 0.95 else "info"
                    insights.append({
                        "type": "correlation",
                        "severity": severity,
                        "title": f"Strong Correlation: {col_a} & {col_b}",
                        "description": (
                            f"{col_a} and {col_b} are {direction} correlated (r = {corr:.2f}). "
                            + ("These may be redundant — consider using one as a calculated field."
                               if abs_corr >= 0.95 else
                               "This relationship is a strong candidate for a scatter plot.")
                        ),
                        "fields": [col_a, col_b],
                        "metric": round(corr, 3),
                    })

        return insights

    # ── Trend Insights ───────────────────────────────────────────────────────

    def _trend_insights(self) -> list[dict]:
        insights = []
        temporal_fields = self.summary.get("dates", [])
        measures = self.summary.get("measures", [])

        if not temporal_fields or not measures:
            return insights

        # Use first date + first measure for trend detection
        date_field = temporal_fields[0]
        for measure in measures[:2]:
            time_series = self.profile.get("time_series", {}).get(f"{date_field}__{measure}")
            if not time_series or len(time_series) < 3:
                continue

            values = [v for _, v in time_series if v is not None]
            if len(values) < 3:
                continue

            # Simple linear trend via least-squares slope sign
            n = len(values)
            mean_x = (n - 1) / 2
            mean_y = sum(values) / n
            numerator = sum((i - mean_x) * (v - mean_y) for i, v in enumerate(values))
            denominator = sum((i - mean_x) ** 2 for i in range(n))
            slope = numerator / denominator if denominator != 0 else 0

            pct_change = ((values[-1] - values[0]) / values[0] * 100) if values[0] != 0 else 0

            if abs(pct_change) > 10:
                direction = "upward 📈" if slope > 0 else "downward 📉"
                severity = "info" if abs(pct_change) < 30 else "warning"
                insights.append({
                    "type": "trend",
                    "severity": severity,
                    "title": f"{measure} Shows a {direction.split()[0].title()} Trend",
                    "description": (
                        f"{measure} has changed by {pct_change:+.1f}% over the observed period, "
                        f"with a {direction} trend. A line chart is strongly recommended for this data."
                    ),
                    "fields": [date_field, measure],
                    "metric": round(pct_change, 2),
                })

        return insights

    # ── Concentration Insights ───────────────────────────────────────────────

    def _concentration_insights(self) -> list[dict]:
        insights = []
        for col_name, col in self.col_profiles.items():
            top_freq = col.get("top_value_frequency")  # fraction of records for the most common value
            if top_freq is None or col.get("dtype") != "object":
                continue
            if top_freq >= 0.5:
                unique = col.get("unique_count", 0)
                insights.append({
                    "type": "concentration",
                    "severity": "info",
                    "title": f"{col_name} is Dominated by One Value",
                    "description": (
                        f"The top value in {col_name} accounts for {top_freq * 100:.1f}% of all records "
                        f"across {unique} unique values. This may reduce the informativeness of a pie chart."
                    ),
                    "fields": [col_name],
                    "metric": round(top_freq, 3),
                })

        return insights

    # ── Quality Insights ─────────────────────────────────────────────────────

    def _quality_insights(self) -> list[dict]:
        insights = []
        overview = self.profile.get("overview", {})

        total_null_pct = overview.get("null_percentage", 0)
        if total_null_pct and total_null_pct > 15:
            severity = "critical" if total_null_pct > 40 else "warning"
            insights.append({
                "type": "quality",
                "severity": severity,
                "title": "High Proportion of Missing Values",
                "description": (
                    f"{total_null_pct:.1f}% of cells across the dataset are null/empty. "
                    "Missing data will affect aggregations and chart accuracy. "
                    "Consider cleaning or imputing values before export."
                ),
                "fields": [],
                "metric": round(total_null_pct, 1),
            })

        # Per-column missing
        for col_name, col in self.col_profiles.items():
            null_pct = col.get("null_percentage", 0)
            if null_pct and null_pct > 30:
                insights.append({
                    "type": "quality",
                    "severity": "warning",
                    "title": f"{col_name} Has {null_pct:.0f}% Missing Values",
                    "description": (
                        f"{col_name} is missing data in {null_pct:.1f}% of rows. "
                        "Consider excluding this column from KPIs or using NULL-safe aggregations in Tableau."
                    ),
                    "fields": [col_name],
                    "metric": round(null_pct, 1),
                })

        # Duplicate rows
        dup_pct = overview.get("duplicate_row_percentage", 0)
        if dup_pct and dup_pct > 5:
            insights.append({
                "type": "quality",
                "severity": "warning" if dup_pct > 20 else "info",
                "title": f"{dup_pct:.1f}% Duplicate Rows Detected",
                "description": (
                    f"The dataset contains {dup_pct:.1f}% duplicate rows. "
                    "Duplicates can inflate SUM aggregations. Consider de-duplicating before exporting."
                ),
                "fields": [],
                "metric": round(dup_pct, 1),
            })

        return insights
