"""
Uploads API — CSV file upload (stub for Phase 1).
"""

from fastapi import APIRouter, Depends
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/")
def list_uploads(current_user: User = Depends(get_current_user)):
    """List uploads for the current user (stub)."""
    return {"uploads": [], "total": 0}
