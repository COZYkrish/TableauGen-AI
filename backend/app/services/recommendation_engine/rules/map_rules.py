"""
Map / Geographic Chart Rules — geographic semantic type.

Fires when at least one column has semantic_type = 'geographic'.
Scores very high (90+) when country/state/city data is present
alongside a measure. Suggests Symbol Map or Filled Map.
"""

from __future__ import annotations
from typing import Any

# Tableau geographic roles
GEO_ROLE_MAP = {
    "country": "Country/Region",
    "state": "State/Province",
    "city": "City",
    "zip": "ZIP Code/Postcode",
    "postal": "ZIP Code/Postcode",
    "region": "State/Province",
    "province": "State/Province",
    "latitude": "Latitude",
    "lat": "Latitude",
    "longitude": "Longitude",
    "lon": "Longitude",
    "lng": "Longitude",
}


def _infer_geo_role(col_name: str) -> str:
    lower = col_name.lower().replace("_", " ").replace("-", " ")
    for keyword, role in GEO_ROLE_MAP.items():
        if keyword in lower:
            return role
    return "Country/Region"


def evaluate(metadata: dict[str, Any]) -> list[dict]:
    columns = metadata.get("columns", {})
    summary = metadata.get("summary", {})
    measures = summary.get("measures", [])

    # Find geographic columns
    geo_cols = [
        name for name, col in columns.items()
        if col.get("semantic_type") == "geographic"
        and col.get("field_role") != "measure"
    ]

    if not geo_cols or not measures:
        return []

    recs = []

    for geo_name in geo_cols[:2]:
        geo_col = columns.get(geo_name, {})
        geo_role = _infer_geo_role(geo_name)
        unique = geo_col.get("unique_count", 0)

        # Lat/Lon columns → Symbol Map
        is_lat_lon = "lat" in geo_name.lower() or "lon" in geo_name.lower() or "lng" in geo_name.lower()

        measure_name = measures[0]
        measure_col = columns.get(measure_name, {})
        agg = measure_col.get("default_aggregation", "SUM")

        if is_lat_lon:
            score = 88
            chart_subtype = "symbol_map"
            mark_type = "Circle"
            rationale = (
                f"Lat/Lon coordinates detected in '{geo_name}'. "
                f"A Symbol Map will plot '{measure_name}' as sized circles on a geographic map."
            )
        elif geo_role in ("Country/Region", "State/Province"):
            score = 93
            chart_subtype = "filled_map"
            mark_type = "Map"
            rationale = (
                f"'{geo_name}' contains {geo_role} data ({unique} locations). "
                f"A Filled Map will shade regions by '{measure_name}' ({agg})."
            )
        else:
            score = 82
            chart_subtype = "symbol_map"
            mark_type = "Circle"
            rationale = (
                f"'{geo_name}' is a geographic field. "
                f"A Symbol Map will represent '{measure_name}' spatially."
            )

        recs.append({
            "chart_type": "map",
            "chart_subtype": chart_subtype,
            "title": f"{measure_name} by {geo_name}",
            "score": score,
            "rationale": rationale,
            "fields": {
                "geography": geo_name,
                "measure": measure_name,
                "geo_role": geo_role,
            },
            "tableau_config": {
                "mark_type": mark_type,
                "geographic_role": geo_role,
                "size": measure_name,
                "color": measure_name,
                "aggregation": agg,
            },
        })

    return sorted(recs, key=lambda x: x["score"], reverse=True)[:1]
