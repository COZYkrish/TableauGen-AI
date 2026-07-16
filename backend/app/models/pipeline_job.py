"""
PipelineJob ORM model — tracks the status of each pipeline stage per project.

Stages (in order):
  upload → profiling → metadata → recommending → planning → generating → exporting → done

Allows the frontend to poll for live progress updates.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text

from app.core.database import Base


class PipelineJob(Base):
    __tablename__ = "pipeline_jobs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Overall job status
    status = Column(String(50), default="pending")
    # pending | running | done | failed

    # Current pipeline stage
    current_stage = Column(String(50), default="upload")
    # upload | profiling | metadata | recommending | planning | generating | exporting | done

    # Stage-level progress (0.0 – 1.0)
    progress = Column(Float, default=0.0)

    # Human-readable status message
    message = Column(String(512), default="Starting pipeline...")

    # Error detail if failed
    error = Column(Text, nullable=True)

    # Timing
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
