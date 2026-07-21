from typing import Dict, Any, List
import uuid
from .blueprint_models import (
    DashboardBlueprint, 
    KPIBlueprint, 
    ChartBlueprint, 
    FilterBlueprint
)

class DashboardPlanner:
    """
    Converts recommendations into a Dashboard Blueprint.
    Allocates placeholders and respects template capability constraints.
    """
    
    def construct_blueprint(
        self, 
        project_id: str,
        recommendations: Dict[str, Any], 
        template_capabilities: Any,
        selected_theme: str
    ) -> DashboardBlueprint:
        """
        Builds the immutable blueprint for the binder to consume.
        """
        # Fetch constraints from template matrix
        max_charts = getattr(template_capabilities, "max_charts", 1)
        max_kpis = getattr(template_capabilities, "max_kpis", 1)
        
        charts_rec = recommendations.get("charts", [])
        kpis_rec = recommendations.get("kpis", [])
        
        # Take the top N based on constraints
        selected_charts = charts_rec[:max_charts]
        selected_kpis = kpis_rec[:max_kpis]
        
        blueprint_charts = []
        for i, chart in enumerate(selected_charts):
            blueprint_charts.append(ChartBlueprint(
                id=f"chart_{uuid.uuid4().hex[:8]}",
                type=chart["type"],
                x=chart["x"],
                y=chart["y"],
                placeholder=f"Placeholder_Chart_{i+1}"
            ))
            
        blueprint_kpis = []
        for i, kpi in enumerate(selected_kpis):
            blueprint_kpis.append(KPIBlueprint(
                id=f"kpi_{uuid.uuid4().hex[:8]}",
                title=kpi["title"],
                formula=kpi["formula"],
                placeholder=f"Placeholder_KPI_{i+1}"
            ))
            
        # Example filters (could be driven by recommendation engine)
        blueprint_filters = []
        if blueprint_charts and blueprint_charts[0].x:
            blueprint_filters.append(FilterBlueprint(
                field=blueprint_charts[0].x,
                placeholder="Placeholder_Filter_1"
            ))

        return DashboardBlueprint(
            project_id=project_id,
            theme=selected_theme,
            template_target=f"{selected_theme.lower()}_v1",
            dashboard_title=f"{selected_theme} Summary Dashboard",
            kpis=blueprint_kpis,
            charts=blueprint_charts,
            filters=blueprint_filters,
            color_palette=["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F"]
        )
