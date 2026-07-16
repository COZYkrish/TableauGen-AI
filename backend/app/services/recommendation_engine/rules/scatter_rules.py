"""
Scatter Plot Rules — two continuous measures.

Fires when there are at least 2 numeric measures with high variance
(good for correlation analysis). Scores higher when:
- Both measures are high-uniqueness (continuous).
- A categorical dimension exists for color encoding.
- A size measure (quantity) is available.
"""

from __future__ import annotations
from typing import Any


def evaluate(metadata: dict[str, Any]) -> list[dict]:
    columns = metadata.get("columns", {})
    summary = metadata.get("summary", {})

    measures = summary.get("measures", [])
    dimensions = summary.get("dimensions", [])

    if len(measures) < 2:
        return []

    recs = []

    # Pair up the first few measures
    for i, x_measure in enumerate(measures[:3]):
        for y_measure in measures[i + 1: i + 3]:
            x_col = columns.get(x_measure, {})
            y_col = columns.get(y_measure, {})

            x_unique = x_col.get("unique_count", 0)
            y_unique = y_col.get("unique_count", 0)
            x_semantic = x_col.get("semantic_type", "numeric")
            y_semantic = y_col.get("semantic_type", "numeric")

            # Both should be continuous (high uniqueness)
            if x_unique < 5 or y_unique < 5:
                continue

            score = 70

            # Better score when semantics complement each other
            if x_semantic == "currency" and y_semantic == "quantity":
                score = 85
            elif x_semantic == "quantity" and y_semantic == "currency":
                score = 85
            elif x_semantic != y_semantic:
                score = 75

            # Find color dimension (low cardinality categorical)
            color_dim = None
            for d in dimensions:
                d_col = columns.get(d, {})
                if 2 <= d_col.get("unique_count", 99) <= 15:
                    color_dim = d
                    break

            # Find size measure (quantity semantic preferred)
            size_measure = None
            for m in measures:
                if m not in (x_measure, y_measure):
                    m_col = columns.get(m, {})
                    if m_col.get("semantic_type") == "quantity":
                        size_measure = m
                        break

            if color_dim:
                score = min(score + 8, 98)
            if size_measure:
                score = min(score + 5, 98)

            recs.append({
                "chart_type": "scatter",
                "title": f"{x_measure} vs {y_measure}",
                "score": score,
                "rationale": (
                    f"Both '{x_measure}' ({x_semantic}) and '{y_measure}' ({y_semantic}) are "
                    f"continuous measures — a scatter plot reveals correlations and outliers."
                    + (f" Color-encoded by '{color_dim}'." if color_dim else "")
                ),
                "fields": {
                    "x": x_measure,
                    "y": y_measure,
                    "color": color_dim,
                    "size": size_measure,
                },
                "tableau_config": {
                    "mark_type": "Circle",
                    "rows": y_measure,
                    "columns": x_measure,
                    "color": color_dim,
                    "size": size_measure,
                    "aggregation_x": x_col.get("default_aggregation", "SUM"),
                    "aggregation_y": y_col.get("default_aggregation", "SUM"),
                },
            })

    return sorted(recs, key=lambda x: x["score"], reverse=True)[:2]
