"""
Uploads API — CSV file upload with validation, profiling, and metadata inference.

Pipeline: Upload CSV → Validate → Store → Profile → Metadata → Return
"""

import os
import uuid
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from loguru import logger

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.project import Project
from app.schemas.project import UploadResponse, ProfileResponse
from app.services.dataset_profiler.profiler import DatasetProfiler
from app.services.metadata_engine.engine import MetadataEngine

router = APIRouter()

# Ensure upload directory exists
UPLOAD_PATH = Path(settings.UPLOAD_DIR)
UPLOAD_PATH.mkdir(parents=True, exist_ok=True)

MAX_SIZE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


@router.post("/", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a CSV file, create a project, and store the file.

    Validates:
    - File extension (.csv)
    - File size (≤ MAX_UPLOAD_SIZE_MB)
    - CSV parseability (headers exist, rows > 0)
    - Encoding detection
    """
    # ── Validate extension ───────────────────────────────────────────────
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported. Please upload a .csv file.",
        )

    # ── Read file content ────────────────────────────────────────────────
    content = await file.read()

    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit.",
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # ── Save to disk ─────────────────────────────────────────────────────
    file_id = uuid.uuid4().hex[:12]
    safe_name = f"{file_id}_{file.filename}"
    file_path = UPLOAD_PATH / safe_name

    with open(file_path, "wb") as f:
        f.write(content)

    # ── Parse CSV ────────────────────────────────────────────────────────
    try:
        df = _read_csv_safe(file_path)
    except Exception as e:
        # Clean up file on failure
        file_path.unlink(missing_ok=True)
        logger.error(f"CSV parse failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not parse CSV: {str(e)}",
        )

    if df.empty or len(df.columns) == 0:
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="CSV is empty or has no valid columns.",
        )

    # ── Create project ───────────────────────────────────────────────────
    project = Project(
        user_id=current_user.id,
        name=file.filename.rsplit(".", 1)[0],
        status="uploaded",
        file_name=file.filename,
        file_path=str(file_path),
        row_count=len(df),
        column_count=len(df.columns),
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    logger.info(f"Uploaded {file.filename}: {len(df)} rows × {len(df.columns)} cols → project {project.id}")

    return UploadResponse(
        project_id=project.id,
        file_name=file.filename,
        row_count=len(df),
        column_count=len(df.columns),
        message="CSV uploaded successfully. Ready for profiling.",
    )


@router.get("/{project_id}/profile", response_model=ProfileResponse)
def profile_dataset(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Run the Dataset Profiler + Metadata Engine on an uploaded CSV.
    Returns enriched column metadata for the frontend.
    """
    project = _get_user_project(project_id, current_user.id, db)

    if not project.file_path or not Path(project.file_path).exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CSV file not found on disk. Please re-upload.",
        )

    # ── Read CSV ─────────────────────────────────────────────────────────
    df = _read_csv_safe(Path(project.file_path))

    # ── Stage 1: Dataset Profiler ────────────────────────────────────────
    profiler = DatasetProfiler(df)
    profile = profiler.profile()

    # ── Stage 2: Metadata Engine ─────────────────────────────────────────
    engine = MetadataEngine(profile)
    metadata = engine.analyze()

    # ── Update project status ────────────────────────────────────────────
    project.status = "profiled"
    db.commit()

    logger.info(f"Profiled project {project_id}: {metadata['summary']['dimension_count']} dims, {metadata['summary']['measure_count']} measures")

    return ProfileResponse(
        project_id=project.id,
        overview=metadata["overview"],
        columns=metadata["columns"],
        summary=metadata["summary"],
    )


# ── Helpers ──────────────────────────────────────────────────────────────────

def _get_user_project(project_id: int, user_id: int, db: Session) -> Project:
    """Fetch a project belonging to the current user."""
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == user_id
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def _read_csv_safe(path: Path) -> pd.DataFrame:
    """
    Attempt to read a CSV with multiple encoding fallbacks
    and basic error recovery.
    """
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252", "iso-8859-1"]
    for enc in encodings:
        try:
            df = pd.read_csv(path, encoding=enc, low_memory=False)
            # Drop completely empty rows and columns
            df = df.dropna(how="all").dropna(axis=1, how="all")
            # Strip whitespace from column names
            df.columns = [str(c).strip() for c in df.columns]
            return df
        except UnicodeDecodeError:
            continue
        except Exception as e:
            raise ValueError(f"CSV parse error ({enc}): {e}")

    raise ValueError("Could not decode CSV with any supported encoding.")
