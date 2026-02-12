"""
Pydantic schemas pentru validare request/response
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class CalendarEventCreate(BaseModel):
    """Schema pentru creare eveniment în Google Calendar"""
    summary: str = Field(..., min_length=2, max_length=200)
    start: datetime
    end: datetime
    timeZone: Optional[str] = 'Europe/Bucharest'
    description: Optional[str] = None
    location: Optional[str] = None


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)


class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)


class UserResponse(BaseModel):
    id: int
    email: str


class AuthResponse(BaseModel):
    user: UserResponse
    expires_at: datetime
