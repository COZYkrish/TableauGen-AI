"""
Projects API — CRUD operations for user projects (stub for Phase 1).
"""

from fastapi import APIRouter, Depends
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/")
def list_projects(current_user: User = Depends(get_current_user)):
    """List all projects for the current user (stub)."""
    return {"projects": [], "total": 0}
