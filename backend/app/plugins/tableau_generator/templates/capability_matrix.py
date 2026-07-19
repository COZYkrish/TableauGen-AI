from pydantic import BaseModel
from typing import List

class CapabilityMatrix(BaseModel):
    """
    Defines what a specific template can support, used by the Dashboard Planner
    to avoid allocating blueprints that exceed template capacity.
    """
    supports_charts: List[str]
    max_charts: int
    max_kpis: int
    requires_date_field: bool
    supports_forecast: bool
    supports_parameters: bool

# In-memory defaults for our known templates
CAPABILITY_MATRICES = {
    "executive": CapabilityMatrix(
        supports_charts=["line", "bar", "pie", "scatter", "treemap", "map"],
        max_charts=6,
        max_kpis=5,
        requires_date_field=True,
        supports_forecast=False,
        supports_parameters=True
    ),
    "operations": CapabilityMatrix(
        supports_charts=["bar", "map", "table", "line"],
        max_charts=4,
        max_kpis=4,
        requires_date_field=False,
        supports_forecast=False,
        supports_parameters=False
    ),
    "minimal": CapabilityMatrix(
        supports_charts=["bar", "line", "pie"],
        max_charts=3,
        max_kpis=3,
        requires_date_field=False,
        supports_forecast=False,
        supports_parameters=False
    )
}

def get_capability_matrix(theme: str) -> CapabilityMatrix:
    # Default to minimal if unknown
    return CAPABILITY_MATRICES.get(theme.lower(), CAPABILITY_MATRICES["minimal"])
