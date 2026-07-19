from pydantic import BaseModel, Field
from typing import List, Optional

class KPIBlueprint(BaseModel):
    id: str
    title: str
    formula: str
    placeholder: str

class ChartBlueprint(BaseModel):
    id: str
    type: str
    x: str
    y: str
    placeholder: str

class FilterBlueprint(BaseModel):
    field: str
    placeholder: str

class ParameterBlueprint(BaseModel):
    name: str
    placeholder: str

class DashboardBlueprint(BaseModel):
    project_id: str
    theme: str
    template_target: str
    kpis: List[KPIBlueprint] = Field(default_factory=list)
    charts: List[ChartBlueprint] = Field(default_factory=list)
    filters: List[FilterBlueprint] = Field(default_factory=list)
    parameters: List[ParameterBlueprint] = Field(default_factory=list)
    color_palette: List[str] = Field(default_factory=list)
    dashboard_title: str
