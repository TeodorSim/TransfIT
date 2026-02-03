"""
Pydantic schemas pentru validare request/response
"""

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, Dict

class AppointmentBase(BaseModel):
    """Schema de bază pentru programare"""
    patient_name: str = Field(..., min_length=2, max_length=100)
    appointment_date: date
    appointment_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    details: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    """Schema pentru creare programare"""
    pass

class AppointmentResponse(AppointmentBase):
    """Schema pentru răspuns programare"""
    id: int
    created_at: str
    
    class Config:
        from_attributes = True

class PatientSearchResponse(BaseModel):
    """Schema pentru răspuns căutare pacient"""
    patient_name: str
    last_appointment: Dict
    total_appointments: int

class CalendarEventCreate(BaseModel):
    """Schema pentru creare eveniment în Google Calendar"""
    summary: str = Field(..., min_length=2, max_length=200)
    start: datetime
    end: datetime
    timeZone: Optional[str] = 'Europe/Bucharest'
    description: Optional[str] = None
    location: Optional[str] = None
