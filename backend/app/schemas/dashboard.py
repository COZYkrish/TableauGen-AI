"""
Pydantic schemas for Dashboard Blueprint API responses.
"""

from pydantic import BaseModel
from typing import Optional, Any


# ── Chart Recommendation ─────────────────────────────────────────────────────

class ChartRecommendation(BaseModel):
    chart_type: str
    title: str
    score: int
    rationale: str
    fields: dict[str, Any]
    tableau_config: dict[str, Any]
    chart_subtype: Optional[str] = None


# ── KPI Card ─────────────────────────────────────────────────────────────────

class KPICard(BaseModel):
    id: str
    title: str
    field: str
    aggregation: str
    formula: str
    display_format: str
    icon: str
    semantic_type: str
    priority: int


# ── Layout Cell ──────────────────────────────────────────────────────────────

class LayoutCell(BaseModel):
    row: int
    col: int
    row_span: int
    col_span: int
    content_type: str   # "kpi" | "chart"
    content_id: str
    title: str
    chart_type: Optional[str] = None


# ── Filter ───────────────────────────────────────────────────────────────────

class FilterSuggestion(BaseModel):
    field: str
    filter_type: str   # "date_range" | "multiselect"
    label: str
    hierarchy: Optional[list[str]] = None
    values_count: Optional[int] = None


# ── Theme ────────────────────────────────────────────────────────────────────

class ThemeSummary(BaseModel):
    id: str
    name: str
    description: str


# ── Blueprint ────────────────────────────────────────────────────────────────

class BlueprintResponse(BaseModel):
    project_id: int
    template: str
    theme_name: str
    theme: dict[str, Any]
    kpis: list[KPICard]
    recommendations: list[ChartRecommendation]
    layout: list[LayoutCell]
    filters: list[FilterSuggestion]
    available_themes: list[ThemeSummary]
    metadata_summary: dict[str, Any]


# ── Generate Request ─────────────────────────────────────────────────────────

class GenerateDashboardRequest(BaseModel):
    theme: Optional[str] = None   # executive | sales | finance | minimal


# ── Export Response ──────────────────────────────────────────────────────────

class ExportResponse(BaseModel):
    project_id: int
    download_url: str
    file_name: str
    validation_warnings: list[str]
