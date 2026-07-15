"""
Pydantic schemas for projects and upload results.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any


# ── Project ──────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str] = None
    status: str
    file_name: Optional[str] = None
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]
    total: int


# ── Upload / Profile ────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    project_id: int
    file_name: str
    row_count: int
    column_count: int
    message: str


class ProfileResponse(BaseModel):
    project_id: int
    overview: dict[str, Any]
    columns: dict[str, Any]
    summary: dict[str, Any]


class ColumnMetadataResponse(BaseModel):
    """Single column metadata as returned by the Metadata Engine."""
    name: str
    inferred_dtype: str
    field_role: str
    semantic_type: str
    default_aggregation: str
    display_format: str
    business_entity: Optional[str] = None
    null_percent: float
    unique_count: int
    uniqueness_ratio: float
    is_filterable: bool
    is_sortable: bool
    tableau_data_role: str
