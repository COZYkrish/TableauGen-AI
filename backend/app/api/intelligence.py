"""
Intelligence API — Exposes Phase 7 AI engines.

Endpoints:
    GET  /api/intelligence/{project_id}/insights
        Run InsightEngine → return ranked insights list.

    GET  /api/intelligence/{project_id}/forecast
        Run ForecastEngine → return forecast series per measure.

    GET  /api/intelligence/{project_id}/narrative
        Run NarrativeEngine → return full narrative package.

    GET  /api/intelligence/{project_id}/full
        Run all three engines → return combined intelligence report.
"""

from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from loguru import logger
import pandas as pd

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.cache import intelligence_cache
from app.models.user import User
from app.models.project import Project
from app.services.dataset_profiler.profiler import DatasetProfiler
from app.services.metadata_engine.engine import MetadataEngine
from app.services.insight_engine.engine import InsightEngine
from app.services.forecast_engine.engine import ForecastEngine
from app.services.narrative_engine.engine import NarrativeEngine

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_project(project_id: int, user_id: int, db: Session) -> Project:
    p = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return p


def _load_pipeline(project: Project) -> tuple[dict, dict]:
    """Load CSV → profile → metadata."""
    if not project.file_path or not Path(project.file_path).exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CSV not found. Please re-upload.",
        )
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252"]
    df = None
    for enc in encodings:
        try:
            df = pd.read_csv(project.file_path, encoding=enc, low_memory=False)
            df = df.dropna(how="all").dropna(axis=1, how="all")
            df.columns = [str(c).strip() for c in df.columns]
            break
        except UnicodeDecodeError:
            continue
    if df is None:
        raise HTTPException(status_code=500, detail="Could not decode CSV")

    profiler = DatasetProfiler(df)
    profile = profiler.profile()
    metadata = MetadataEngine(profile).analyze()
    return profile, metadata


# ── Insights ──────────────────────────────────────────────────────────────────

@router.get("/{project_id}/insights")
def get_insights(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return ranked statistical insights for a project."""
    project = _get_project(project_id, current_user.id, db)

    try:
        profile, metadata = _load_pipeline(project)
        engine = InsightEngine(profile, metadata)
        insights = engine.generate()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Insight Engine failed for project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Insight generation failed: {e}")

    return {"project_id": project_id, "insights": insights, "total": len(insights)}


# ── Forecast ──────────────────────────────────────────────────────────────────

@router.get("/{project_id}/forecast")
def get_forecast(
    project_id: int,
    horizon: int = 6,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return time-series forecasts for temporal measures."""
    project = _get_project(project_id, current_user.id, db)

    if horizon < 1 or horizon > 24:
        raise HTTPException(status_code=400, detail="horizon must be between 1 and 24")

    try:
        profile, metadata = _load_pipeline(project)
        engine = ForecastEngine(profile, metadata, horizon=horizon)
        forecasts = engine.forecast()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Forecast Engine failed for project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {e}")

    return {"project_id": project_id, "horizon": horizon, "forecasts": forecasts}


# ── Narrative ─────────────────────────────────────────────────────────────────

@router.get("/{project_id}/narrative")
def get_narrative(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return a natural-language narrative for the project dashboard."""
    project = _get_project(project_id, current_user.id, db)

    if not project.blueprint_json:
        raise HTTPException(
            status_code=400,
            detail="No blueprint found. Run POST /dashboard/{id}/generate first.",
        )

    try:
        profile, metadata = _load_pipeline(project)

        insight_engine = InsightEngine(profile, metadata)
        insights = insight_engine.generate()

        forecast_engine = ForecastEngine(profile, metadata)
        forecasts = forecast_engine.forecast()

        narrative_engine = NarrativeEngine(metadata, project.blueprint_json, insights, forecasts)
        narrative = narrative_engine.generate()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Narrative Engine failed for project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Narrative generation failed: {e}")

    return {"project_id": project_id, **narrative}


# ── Full Intelligence Report ──────────────────────────────────────────────────

@router.get("/{project_id}/full")
def get_full_intelligence(
    project_id: int,
    horizon: int = 6,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Run all intelligence engines and return a combined report.
    Results are cached for 5 minutes per project.
    """
    project = _get_project(project_id, current_user.id, db)

    if not project.blueprint_json:
        raise HTTPException(
            status_code=400,
            detail="No blueprint found. Run POST /dashboard/{id}/generate first.",
        )

    cache_key = f"intel:{current_user.id}:{project_id}:{horizon}"
    cached = intelligence_cache.get(cache_key)
    if cached is not None:
        logger.debug(f"Intelligence cache hit: project {project_id}")
        return cached

    try:
        profile, metadata = _load_pipeline(project)

        insights = InsightEngine(profile, metadata).generate()
        forecasts = ForecastEngine(profile, metadata, horizon=horizon).forecast()
        narrative = NarrativeEngine(
            metadata, project.blueprint_json, insights, forecasts
        ).generate()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Full Intelligence failed for project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    result = {
        "project_id": project_id,
        "insights": insights,
        "forecasts": forecasts,
        "narrative": narrative,
    }
    intelligence_cache.set(cache_key, result)
    return result
