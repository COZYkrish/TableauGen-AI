"""
Projects API — CRUD operations + stats + export history for user projects.
"""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.project import Project
from app.schemas.project import ProjectResponse, ProjectListResponse

router = APIRouter()


# ── List ─────────────────────────────────────────────────────────────────────

@router.get("/", response_model=ProjectListResponse)
def list_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all projects for the current user, newest first."""
    projects = (
        db.query(Project)
        .filter(Project.user_id == current_user.id)
        .order_by(Project.created_at.desc())
        .all()
    )
    return ProjectListResponse(
        projects=[ProjectResponse.model_validate(p) for p in projects],
        total=len(projects),
    )


# ── Get single ───────────────────────────────────────────────────────────────

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific project by ID."""
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


# ── Rename ────────────────────────────────────────────────────────────────────

class RenameProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None


@router.patch("/{project_id}", response_model=ProjectResponse)
def rename_project(
    project_id: int,
    body: RenameProjectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Rename a project and optionally update its description."""
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    project.name = body.name.strip()
    if body.description is not None:
        project.description = body.description.strip() or None
    db.commit()
    db.refresh(project)
    return project


# ── Stats ─────────────────────────────────────────────────────────────────────

@router.get("/stats/summary")
def project_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return aggregate stats for the current user's projects."""
    all_projects = db.query(Project).filter(Project.user_id == current_user.id).all()

    by_status: dict[str, int] = {}
    total_rows = 0
    total_cols = 0
    exported_count = 0

    for p in all_projects:
        by_status[p.status] = by_status.get(p.status, 0) + 1
        if p.row_count:
            total_rows += p.row_count
        if p.column_count:
            total_cols += p.column_count
        if p.status == "exported":
            exported_count += 1

    return {
        "total_projects": len(all_projects),
        "by_status": by_status,
        "total_rows_analyzed": total_rows,
        "total_columns_analyzed": total_cols,
        "exported_count": exported_count,
    }


# ── Export History ─────────────────────────────────────────────────────────────

@router.get("/exports/history")
def export_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all exported projects with download metadata."""
    exported = (
        db.query(Project)
        .filter(
            Project.user_id == current_user.id,
            Project.status == "exported",
            Project.export_path.isnot(None),
        )
        .order_by(Project.updated_at.desc())
        .all()
    )

    history = []
    for p in exported:
        export_path = Path(p.export_path) if p.export_path else None
        file_size_kb = None
        if export_path and export_path.exists():
            file_size_kb = round(export_path.stat().st_size / 1024, 1)

        history.append({
            "project_id": p.id,
            "project_name": p.name,
            "file_name": export_path.name if export_path else None,
            "file_size_kb": file_size_kb,
            "row_count": p.row_count,
            "column_count": p.column_count,
            "exported_at": p.updated_at.isoformat() if p.updated_at else None,
            "download_url": f"/api/dashboard/{p.id}/download",
        })

    return {"exports": history, "total": len(history)}


# ── Delete ────────────────────────────────────────────────────────────────────

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a project and its associated files."""
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Clean up CSV file
    if project.file_path:
        Path(project.file_path).unlink(missing_ok=True)

    # Clean up export files
    if project.export_path:
        export_path = Path(project.export_path)
        export_path.unlink(missing_ok=True)
        # Remove the TWB too if it exists alongside
        twb = export_path.with_suffix(".twb")
        twb.unlink(missing_ok=True)

    db.delete(project)
    db.commit()

