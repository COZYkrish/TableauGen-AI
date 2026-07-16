"""
Bar Chart Rules — dimension × measure combinations.

Fires when there is at least one categorical/boolean dimension
and at least one numeric measure. Scores higher when:
- The dimension has low-to-mid cardinality (2–50 values).
- There are multiple measures (grouped bar candidate).
- A temporal date exists (time-grouped bar).
"""

from __future__ import annotations
from typing import Any


def evaluate(metadata: dict[str, Any]) -> list[dict]:
    """Return bar chart recommendations from column metadata."""
    columns = metadata.get("columns", {})
    summary = metadata.get("summary", {})

    dimensions = summary.get("dimensions", [])
    measures = summary.get("measures", [])

    if not dimensions or not measures:
        return []

    recs = []

    # Find best dimension (lowest cardinality that is still meaningful)
    for dim_name in dimensions:
        col = columns.get(dim_name, {})
        unique = col.get("unique_count", 9999)
        semantic = col.get("semantic_type", "categorical")

        # Skip pure identifiers (too many unique values)
        if unique > 100 or col.get("field_role") == "identifier":
            continue

        # Score based on cardinality sweet spot (5–30 is ideal for bar charts)
        if 2 <= unique <= 10:
            score = 90
        elif 11 <= unique <= 30:
            score = 80
        elif 31 <= unique <= 50:
            score = 65
        else:
            score = 40

        # Boost for geographic semantic
        if semantic == "geographic":
            score = min(score + 5, 98)

        # Pick top 2 measures for the bar chart
        selected_measures = measures[:2]

        for measure_name in selected_measures[:1]:
            measure_col = columns.get(measure_name, {})
            agg = measure_col.get("default_aggregation", "SUM")

            recs.append({
                "chart_type": "bar",
                "title": f"{measure_name} by {dim_name}",
                "score": score,
                "rationale": (
                    f"'{dim_name}' has {unique} distinct values — ideal for a bar chart. "
                    f"'{measure_name}' is a {measure_col.get('semantic_type', 'numeric')} measure "
                    f"aggregated by {agg}."
                ),
                "fields": {
                    "dimension": dim_name,
                    "measure": measure_name,
                    "extra_measures": selected_measures[1:],
                },
                "tableau_config": {
                    "mark_type": "Bar",
                    "rows": measure_name,
                    "columns": dim_name,
                    "color": dim_name if len(dimensions) > 1 else None,
                    "aggregation": agg,
                    "sort": "descending",
                },
            })

    # De-duplicate: keep unique (dim, measure) pairs, highest score first
    seen: set[tuple] = set()
    unique_recs: list[dict] = []
    for r in sorted(recs, key=lambda x: x["score"], reverse=True):
        key = (r["fields"]["dimension"], r["fields"]["measure"])
        if key not in seen:
            seen.add(key)
            unique_recs.append(r)

    return unique_recs[:3]  # max 3 bar chart recommendations
