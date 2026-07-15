"""
Pydantic schemas for authentication requests and responses.
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# ── Requests ─────────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Responses ────────────────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
