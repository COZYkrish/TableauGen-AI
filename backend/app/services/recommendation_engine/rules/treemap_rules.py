"""
Treemap Rules — hierarchical dimensions × measure.

Fires when there are 2+ categorical dimensions (suggesting hierarchy)
and at least one measure. Treemaps excel at showing part-of-whole
with nested grouping (e.g., Category → Sub-Category → Sales).
"""

from __future__ import annotations
from typing import Any


def evaluate(metadata: dict[str, Any]) -> list[dict]:
    columns = metadata.get("columns", {})
    summary = metadata.get("summary", {})

    dimensions = summary.get("dimensions", [])
    measures = summary.get("measures", [])

    # Need at least 2 dimensions and 1 measure
    if len(dimensions) < 2 or not measures:
        return []

    # Filter out identifiers and high-cardinality dimensions
    usable_dims = []
    for d in dimensions:
        col = columns.get(d, {})
        unique = col.get("unique_count", 9999)
        role = col.get("field_role", "dimension")
        if role != "identifier" and 2 <= unique <= 200:
            usable_dims.append((d, unique))

    if len(usable_dims) < 2:
        return []

    # Sort by cardinality ascending (parent → child hierarchy)
    usable_dims.sort(key=lambda x: x[1])

    parent_dim, parent_unique = usable_dims[0]
    child_dim, child_unique = usable_dims[1]
    measure_name = measures[0]
    measure_col = columns.get(measure_name, {})
    agg = measure_col.get("default_aggregation", "SUM")

    score = 75

    # Boost when hierarchy makes semantic sense (low parent cardinality)
    if parent_unique <= 10:
        score = 82
    if parent_unique <= 5:
        score = 88

    return [{
        "chart_type": "treemap",
        "title": f"{measure_name} Breakdown by {parent_dim} → {child_dim}",
        "score": score,
        "rationale": (
            f"Two categorical dimensions detected: '{parent_dim}' ({parent_unique} values) "
            f"and '{child_dim}' ({child_unique} values). A treemap shows hierarchical "
            f"part-of-whole relationships with '{measure_name}' ({agg}) as tile size."
        ),
        "fields": {
            "parent_dimension": parent_dim,
            "child_dimension": child_dim,
            "measure": measure_name,
        },
        "tableau_config": {
            "mark_type": "Square",
            "color": parent_dim,
            "size": measure_name,
            "label": child_dim,
            "aggregation": agg,
            "sort": "descending",
        },
    }]
