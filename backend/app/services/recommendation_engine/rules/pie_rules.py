"""
Pie / Donut Chart Rules — low-cardinality categorical × measure.

Fires when a dimension has very low cardinality (2–8 values) and
there is a single primary measure. Scores lower than bar charts
(pie charts are often misused) — capped at 75.
"""

from __future__ import annotations
from typing import Any


def evaluate(metadata: dict[str, Any]) -> list[dict]:
    columns = metadata.get("columns", {})
    summary = metadata.get("summary", {})

    dimensions = summary.get("dimensions", [])
    measures = summary.get("measures", [])

    if not dimensions or not measures:
        return []

    recs = []

    for dim_name in dimensions:
        col = columns.get(dim_name, {})
        unique = col.get("unique_count", 9999)

        # Pie charts are only appropriate for 2–7 slices
        if not (2 <= unique <= 7):
            continue

        measure_name = measures[0]
        measure_col = columns.get(measure_name, {})
        agg = measure_col.get("default_aggregation", "SUM")
        semantic = measure_col.get("semantic_type", "numeric")

        # Score: lower is better for pie (warn users)
        if unique <= 4:
            score = 72
        else:
            score = 60

        # Boost slightly for part-of-whole semantics
        if semantic == "percentage":
            score = min(score + 5, 75)

        recs.append({
            "chart_type": "pie",
            "title": f"{measure_name} Distribution by {dim_name}",
            "score": score,
            "rationale": (
                f"'{dim_name}' has only {unique} values — suitable for a pie/donut chart. "
                f"Use sparingly; bar charts are usually clearer for comparison."
            ),
            "fields": {
                "dimension": dim_name,
                "measure": measure_name,
            },
            "tableau_config": {
                "mark_type": "Pie",
                "angle": measure_name,
                "color": dim_name,
                "aggregation": agg,
                "show_labels": True,
            },
        })

    return sorted(recs, key=lambda x: x["score"], reverse=True)[:1]
