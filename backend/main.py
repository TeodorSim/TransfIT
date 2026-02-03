"""
TransfIT Backend - FastAPI + PostgreSQL
API pentru gestionarea programărilor pacienților
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import httpx

from database import get_db, engine
from models import Base, Appointment
from schemas import AppointmentCreate, AppointmentResponse, PatientSearchResponse, CalendarEventCreate

# Creare tabele în baza de date
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TransfIT API",
    description="API pentru gestionarea programărilor de fizioterapie",
    version="1.0.0"
)

# Configurare CORS pentru frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:5500",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "null"
    ],  # Adaugă origin-ul frontend-ului
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_bearer_token(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    return authorization.split(" ", 1)[1]

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"status": "online", "message": "TransfIT API is running"}

@app.get("/api/appointments/search/{patient_name}", response_model=PatientSearchResponse)
def search_patient_appointments(patient_name: str, db: Session = Depends(get_db)):
    """
    Caută ultima programare a unui pacient
    """
    # Căutare insensibilă la majuscule
    appointments = db.query(Appointment).filter(
        Appointment.patient_name.ilike(f"%{patient_name}%")
    ).order_by(Appointment.appointment_date.desc()).all()
    
    if not appointments:
        raise HTTPException(
            status_code=404,
            detail=f"Nu s-au găsit programări pentru pacientul: {patient_name}"
        )
    
    # Returnează ultima programare și numărul total
    last_appointment = appointments[0]
    
    return PatientSearchResponse(
        patient_name=last_appointment.patient_name,
        last_appointment={
            "id": last_appointment.id,
            "date": last_appointment.appointment_date.isoformat(),
            "time": last_appointment.appointment_time,
            "details": last_appointment.details,
            "created_at": last_appointment.created_at.isoformat()
        },
        total_appointments=len(appointments)
    )

@app.get("/api/appointments", response_model=List[AppointmentResponse])
def get_all_appointments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Obține toate programările (cu paginare)
    """
    appointments = db.query(Appointment).order_by(
        Appointment.appointment_date.desc()
    ).offset(skip).limit(limit).all()
    return appointments

@app.post("/api/appointments", response_model=AppointmentResponse, status_code=201)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    """
    Creează o programare nouă
    """
    db_appointment = Appointment(
        patient_name=appointment.patient_name,
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time,
        details=appointment.details
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@app.delete("/api/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """
    Șterge o programare
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Programarea nu a fost găsită")
    
    db.delete(appointment)
    db.commit()
    return {"message": "Programarea a fost ștearsă cu succes"}

@app.get("/api/seed-data")
def seed_database(db: Session = Depends(get_db)):
    """
    Populează baza de date cu date de test (doar pentru dezvoltare)
    """
    # Verifică dacă există deja date
    if db.query(Appointment).count() > 0:
        return {"message": "Baza de date conține deja date"}
    
    sample_appointments = [
        Appointment(
            patient_name="Popescu Ion",
            appointment_date=datetime(2026, 1, 20),
            appointment_time="10:00",
            details="Consultație fizioterapie"
        ),
        Appointment(
            patient_name="Ionescu Maria",
            appointment_date=datetime(2026, 1, 22),
            appointment_time="14:30",
            details="Tratament recuperare post-operatorie"
        ),
        Appointment(
            patient_name="Georgescu Andrei",
            appointment_date=datetime(2026, 1, 23),
            appointment_time="09:00",
            details="Masaj terapeutic"
        ),
        Appointment(
            patient_name="Popescu Ion",
            appointment_date=datetime(2026, 1, 24),
            appointment_time="11:00",
            details="Control fizioterapie"
        ),
        Appointment(
            patient_name="Dumitrescu Elena",
            appointment_date=datetime(2026, 1, 25),
            appointment_time="16:00",
            details="Kinetoterapie"
        ),
    ]
    
    db.bulk_save_objects(sample_appointments)
    db.commit()
    
    return {"message": f"Au fost adăugate {len(sample_appointments)} programări de test"}

@app.get("/api/google/calendar/events")
def list_google_calendar_events(
    maxResults: int = 10,
    timeMin: Optional[str] = None,
    access_token: str = Depends(get_bearer_token)
):
    """
    Listează evenimentele din calendarul Google al utilizatorului logat.
    """
    if not timeMin:
        timeMin = datetime.utcnow().isoformat() + "Z"

    url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    params = {
        "maxResults": maxResults,
        "timeMin": timeMin,
        "singleEvents": "true",
        "orderBy": "startTime"
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(
                url,
                headers={"Authorization": f"Bearer {access_token}"},
                params=params
            )
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=exc.response.text)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

@app.post("/api/google/calendar/events")
def create_google_calendar_event(
    payload: CalendarEventCreate,
    access_token: str = Depends(get_bearer_token)
):
    """
    Creează un eveniment în calendarul Google al utilizatorului logat.
    """
    url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"

    event_body = {
        "summary": payload.summary,
        "description": payload.description,
        "location": payload.location,
        "start": {
            "dateTime": payload.start.isoformat(),
            "timeZone": payload.timeZone or "Europe/Bucharest"
        },
        "end": {
            "dateTime": payload.end.isoformat(),
            "timeZone": payload.timeZone or "Europe/Bucharest"
        }
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(
                url,
                headers={"Authorization": f"Bearer {access_token}"},
                json=event_body
            )
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=exc.response.text)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
