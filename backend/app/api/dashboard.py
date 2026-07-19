"""
Dashboard API — Full pipeline from Metadata → Blueprint → Export.

Endpoints:
    POST /api/dashboard/{project_id}/generate
        Run Recommendation Engine + KPI Generator + Dashboard Planner.
        Stores the Blueprint in the project record and returns it.

    GET  /api/dashboard/{project_id}
        Return the stored Blueprint JSON for a project.

    POST /api/dashboard/{project_id}/export
        Generate the Tableau .twb XML + package as .twbx.
        Returns a download URL.

    GET  /api/dashboard/{project_id}/download
        Serve the .twbx file for download.
"""

import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from loguru import logger

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.project import Project
from app.schemas.dashboard import (
    BlueprintResponse,
    GenerateDashboardRequest,
    ExportResponse,
)
from app.services.dataset_profiler.profiler import DatasetProfiler
from app.services.metadata_engine.engine import MetadataEngine
from app.services.dashboard_planner.planner import DashboardPlanner
from app.plugins.tableau_generator.pipeline.orchestrator import GeneratorPipeline

import pandas as pd

router = APIRouter()

EXPORT_PATH = Path(settings.EXPORT_DIR)
EXPORT_PATH.mkdir(parents=True, exist_ok=True)


# ── Helpers ──────────────────────────────────────────────────────────────────

def _get_user_project(project_id: int, user_id: int, db: Session) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == user_id
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def _read_csv(file_path: str) -> pd.DataFrame:
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252"]
    for enc in encodings:
        try:
            df = pd.read_csv(file_path, encoding=enc, low_memory=False)
            df = df.dropna(how="all").dropna(axis=1, how="all")
            df.columns = [str(c).strip() for c in df.columns]
            return df
        except UnicodeDecodeError:
            continue
    raise ValueError("Could not decode CSV")


# ── Generate Blueprint ────────────────────────────────────────────────────────

@router.post("/{project_id}/generate", response_model=BlueprintResponse)
def generate_blueprint(
    project_id: int,
    body: GenerateDashboardRequest = GenerateDashboardRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Run the full AI pipeline:
      CSV → Profiler → Metadata Engine → Recommendation Engine + KPI Generator
      → Dashboard Planner → Blueprint JSON

    Stores the blueprint in the project record (status → 'ready').
    """
    project = _get_user_project(project_id, current_user.id, db)

    if not project.file_path or not Path(project.file_path).exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CSV file not found. Please re-upload.",
        )

    # ── Run Pipeline ─────────────────────────────────────────────────
    try:
        df = _read_csv(project.file_path)
        profiler = DatasetProfiler(df)
        profile = profiler.profile()

        meta_engine = MetadataEngine(profile)
        metadata = meta_engine.analyze()

        planner = DashboardPlanner(metadata, theme=body.theme)
        blueprint = planner.plan()

    except Exception as e:
        logger.error(f"Pipeline failed for project {project_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dashboard generation failed: {str(e)}",
        )

    # ── Persist Blueprint ─────────────────────────────────────────────
    project.blueprint_json = blueprint
    project.status = "ready"
    db.commit()
    db.refresh(project)

    logger.info(
        f"Generated blueprint for project {project_id}: "
        f"{len(blueprint['recommendations'])} charts, {len(blueprint['kpis'])} KPIs"
    )

    return BlueprintResponse(
        project_id=project.id,
        **blueprint,
    )


# ── Get Stored Blueprint ──────────────────────────────────────────────────────

@router.get("/{project_id}", response_model=BlueprintResponse)
def get_blueprint(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the stored Dashboard Blueprint for a project."""
    project = _get_user_project(project_id, current_user.id, db)

    if not project.blueprint_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blueprint not found. Please generate the dashboard first.",
        )

    return BlueprintResponse(
        project_id=project.id,
        **project.blueprint_json,
    )


# ── Export .twbx ─────────────────────────────────────────────────────────────

@router.post("/{project_id}/export", response_model=ExportResponse)
def export_twbx(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate a Tableau .twbx file from the stored blueprint.
    Updates project.export_path and returns a download URL.
    """
    project = _get_user_project(project_id, current_user.id, db)

    if not project.blueprint_json:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Generate the blueprint first via POST /dashboard/{id}/generate",
        )

    if not project.file_path or not Path(project.file_path).exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original CSV not found. Cannot package .twbx without data source.",
        )

    # ── Re-run profiler for metadata (needed by generator) ──────────
    try:
        df = _read_csv(project.file_path)
        profiler = DatasetProfiler(df)
        profile = profiler.profile()
        meta_engine = MetadataEngine(profile)
        metadata = meta_engine.analyze()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not read CSV for export: {str(e)}",
        )

    blueprint = project.blueprint_json
    project_name = project.name or f"project_{project_id}"

    # ── Generate .twb ────────────────────────────────────────────────
    gen_dir = EXPORT_PATH / f"project_{project_id}"
    gen_dir.mkdir(parents=True, exist_ok=True)

    try:
        templates_dir = Path("app/plugins/tableau_generator/templates/files")
        pipeline = GeneratorPipeline(templates_dir)
        
        twbx_path = pipeline.generate(
            project_id=str(project_id),
            raw_columns=metadata.get("columns", metadata),
            csv_path=project.file_path,
            output_dir=gen_dir
        )
    except Exception as e:
        logger.error(f"Tableau Generator failed for project {project_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Workbook generation failed: {str(e)}",
        )

    # ── Persist export path ───────────────────────────────────────────
    project.export_path = str(twbx_path)
    project.status = "exported"
    db.commit()

    download_url = f"/api/dashboard/{project_id}/download"
    logger.info(f"Exported project {project_id} → {twbx_path.name}")

    return ExportResponse(
        project_id=project_id,
        download_url=download_url,
        file_name=twbx_path.name,
        validation_warnings=[],
    )


# ── Download .twbx ────────────────────────────────────────────────────────────

@router.get("/{project_id}/download")
def download_twbx(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Serve the .twbx file as a file download."""
    project = _get_user_project(project_id, current_user.id, db)

    if not project.export_path or not Path(project.export_path).exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Export not found. Please run the export first.",
        )

    twbx_path = Path(project.export_path)
    return FileResponse(
        path=str(twbx_path),
        filename=twbx_path.name,
        media_type="application/octet-stream",
    )
