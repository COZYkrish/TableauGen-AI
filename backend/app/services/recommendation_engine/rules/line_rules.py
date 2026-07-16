"""
Line Chart Rules — temporal dimension × measure.

Fires when there is at least one date/temporal column and at least
one numeric measure. Scores higher when:
- The date range is large (> 90 days).
- Measure semantic is currency or quantity (trend-worthy).
- Multiple measures can be overlaid as multi-line series.
"""

from __future__ import annotations
from typing import Any


def evaluate(metadata: dict[str, Any]) -> list[dict]:
    columns = metadata.get("columns", {})
    summary = metadata.get("summary", {})

    dates = summary.get("dates", [])
    measures = summary.get("measures", [])

    if not dates or not measures:
        return []

    recs = []

    for date_name in dates[:2]:  # use up to 2 date columns
        date_col = columns.get(date_name, {})
        range_days = date_col.get("date_range_days", 0)
        hierarchy = date_col.get("date_hierarchy", ["Year", "Month", "Day"])

        # Score based on temporal range
        if range_days > 365:
            score = 95
            granularity = "Month"
        elif range_days > 90:
            score = 88
            granularity = "Month"
        elif range_days > 30:
            score = 78
            granularity = "Week"
        elif range_days > 7:
            score = 65
            granularity = "Day"
        else:
            score = 45
            granularity = "Day"

        for measure_name in measures[:2]:
            measure_col = columns.get(measure_name, {})
            semantic = measure_col.get("semantic_type", "numeric")
            agg = measure_col.get("default_aggregation", "SUM")

            # Boost for trend-worthy semantics
            if semantic in ("currency", "quantity"):
                score = min(score + 5, 98)

            recs.append({
                "chart_type": "line",
                "title": f"{measure_name} Over Time",
                "score": score,
                "rationale": (
                    f"'{date_name}' spans {range_days} days, making it ideal for a time-series line chart. "
                    f"'{measure_name}' ({semantic}) will be aggregated by {agg} at {granularity} granularity."
                ),
                "fields": {
                    "date": date_name,
                    "measure": measure_name,
                    "extra_measures": [m for m in measures[:3] if m != measure_name],
                },
                "tableau_config": {
                    "mark_type": "Line",
                    "rows": measure_name,
                    "columns": f"DATETRUNC('{granularity.lower()}', [{date_name}])",
                    "date_granularity": granularity,
                    "aggregation": agg,
                    "show_markers": range_days <= 90,
                },
            })

    return sorted(recs, key=lambda x: x["score"], reverse=True)[:2]
