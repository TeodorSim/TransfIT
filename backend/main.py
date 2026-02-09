"""
TransfIT Backend - FastAPI + PostgreSQL
API pentru gestionarea programărilor pacienților
"""

from fastapi import FastAPI, HTTPException, Depends, Header, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import json
import os
from pathlib import Path
import httpx
import secrets
from passlib.context import CryptContext

from database import get_db, engine
from models import Base, Appointment, User, UserSession
from schemas import AppointmentCreate, AppointmentResponse, PatientSearchResponse, CalendarEventCreate
from schemas import LoginRequest, RegisterRequest, AuthResponse, UserResponse

# Creare tabele în baza de date
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TransfIT API",
    description="API pentru gestionarea programărilor de fizioterapie",
    version="1.0.0"
)

SESSION_COOKIE_NAME = "transfit_session"
SESSION_DAYS = 7
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ADMIN_EMAILS = {
    email.strip().lower()
    for email in os.getenv("ADMIN_EMAILS", "TransfitAccount").split(",")
    if email.strip()
}

# Servește frontend-ul static pentru flow-ul Google OAuth (necesită HTTP, nu file://)
BASE_DIR = Path(__file__).resolve().parent.parent
FORM_LINKS_PATH = BASE_DIR / "backend" / "form_links.json"

def load_form_links():
    if not FORM_LINKS_PATH.exists():
        return {
            "default": {
                "programare": "https://tally.so/r/obeJvO",
                "disponibilitate": "https://tally.so/r/vGDVKQ"
            },
            "users": {}
        }

    try:
        with FORM_LINKS_PATH.open("r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return {
            "default": {
                "programare": "https://tally.so/r/obeJvO",
                "disponibilitate": "https://tally.so/r/vGDVKQ"
            },
            "users": {}
        }

app.mount("/Start", StaticFiles(directory=str(BASE_DIR / "Start")), name="start")
app.mount("/Homepage Rep", StaticFiles(directory=str(BASE_DIR / "Homepage Rep")), name="homepage")

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
    """Extrage și validează token-ul Bearer din header-ul Authorization
    
    Args:
        authorization: Header-ul Authorization din request
        
    Returns:
        Token-ul extras din header
        
    Raises:
        HTTPException: Dacă header-ul lipsește sau are format invalid
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    return authorization.split(" ", 1)[1]

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)

def create_session(db: Session, user_id: int) -> UserSession:
    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)
    token = secrets.token_urlsafe(48)
    session = UserSession(user_id=user_id, token=token, expires_at=expires_at)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def get_session_from_cookie(request: Request, db: Session) -> Optional[UserSession]:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        return None

    session = db.query(UserSession).filter(UserSession.token == token).first()
    if not session:
        return None

    if session.expires_at:
        now = datetime.now(timezone.utc)
        expires_at = session.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < now:
            db.delete(session)
            db.commit()
            return None

    return session

def require_admin(request: Request, db: Session) -> User:
    session = get_session_from_cookie(request, db)
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if user.email.lower() not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")

    return user

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"status": "online", "message": "TransfIT API is running"}

@app.get("/login")
def serve_login_page():
    """Servește pagina de login din frontend."""
    return FileResponse(str(BASE_DIR / "Start" / "Login.html"))

@app.get("/config.js")
def serve_config():
    """Servește fișierul config.js pentru frontend."""
    return FileResponse(str(BASE_DIR / "config.js"))

@app.post("/api/auth/register", response_model=UserResponse, status_code=201)
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already exists")

    user = User(
        email=payload.email.lower(),
        password_hash=hash_password(payload.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse(id=user.id, email=user.email)

@app.post("/api/auth/login", response_model=AuthResponse)
def login_user(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    session = create_session(db, user.id)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session.token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        path="/"
    )

    return AuthResponse(
        user=UserResponse(id=user.id, email=user.email),
        expires_at=session.expires_at
    )

@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user(request: Request, db: Session = Depends(get_db)):
    session = get_session_from_cookie(request, db)
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return UserResponse(id=user.id, email=user.email)

@app.post("/api/auth/logout")
def logout_user(request: Request, response: Response, db: Session = Depends(get_db)):
    session = get_session_from_cookie(request, db)
    if session:
        db.delete(session)
        db.commit()

    response.delete_cookie(SESSION_COOKIE_NAME, path="/")
    return {"message": "Logged out"}

@app.get("/api/auth/users")
def list_users(request: Request, db: Session = Depends(get_db)):
    """Listează toți utilizatorii înregistrați (doar admin)."""
    require_admin(request, db)
    users = db.query(User).order_by(User.id.asc()).all()
    return [{"id": u.id, "email": u.email} for u in users]

@app.get("/api/form-links")
def get_form_links(email: Optional[str] = None):
    """Returnează linkurile formularului pentru contul logat."""
    data = load_form_links()
    default_links = data.get("default", {})
    if not email:
        return default_links

    key = email.strip().lower()
    return data.get("users", {}).get(key, default_links)

@app.get("/api/appointments/search/{patient_name}", response_model=PatientSearchResponse)
def search_patient_appointments(patient_name: str, db: Session = Depends(get_db)):
    """
    Caută și returnează ultima programare a unui pacient
    
    Efectuează o căutare case-insensitive în baza de date după numele pacientului.
    Returnează ultima programare (cea mai recentă) și numărul total de programări.
    
    Args:
        patient_name: Numele pacientului de căutat (acceptă căutare parțială)
        db: Sesiunea de bază de date (injectată automat)
        
    Returns:
        PatientSearchResponse cu ultima programare și statistici
        
    Raises:
        HTTPException 404: Dacă nu se găsesc programări pentru acest pacient
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
    Obține toate programările din baza de date cu paginare
    
    Returnează o listă de programări ordonate descendent după data.
    Suportă paginare prin parametrii skip și limit.
    
    Args:
        skip: Numărul de înregistrări de sărit (pentru paginare)
        limit: Numărul maxim de înregistrări de returnat
        db: Sesiunea de bază de date (injectată automat)
        
    Returns:
        Listă de AppointmentResponse cu programările găsite
    """
    appointments = db.query(Appointment).order_by(
        Appointment.appointment_date.desc()
    ).offset(skip).limit(limit).all()
    return appointments

@app.post("/api/appointments", response_model=AppointmentResponse, status_code=201)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    """
    Creează o programare nouă în baza de date
    
    Validează și salvează o nouă programare pentru un pacient.
    Datele sunt validate automat prin schema Pydantic.
    
    Args:
        appointment: Datele programării (nume pacient, dată, oră, detalii)
        db: Sesiunea de bază de date (injectată automat)
        
    Returns:
        AppointmentResponse cu datele programării create (include ID și timestamp)
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
    Șterge o programare din baza de date
    
    Caută programarea după ID și o șterge permanent din baza de date.
    
    Args:
        appointment_id: ID-ul programării de șters
        db: Sesiunea de bază de date (injectată automat)
        
    Returns:
        Mesaj de confirmare a ștergerii
        
    Raises:
        HTTPException 404: Dacă programarea nu există
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
    Listește evenimentele din Google Calendar al utilizatorului autentificat
    
    Face proxy la Google Calendar API folosind token-ul de acces al utilizatorului.
    Returnează evenimente ordonate cronologic.
    
    Args:
        maxResults: Numărul maxim de evenimente de returnat (default: 10)
        timeMin: Data minimă ISO 8601 pentru filtrare (default: acum)
        access_token: Token-ul OAuth2 extras din header Authorization
        
    Returns:
        JSON cu lista de evenimente din Google Calendar
        
    Raises:
        HTTPException: Dacă cererea către Google API eșuează
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
    Creează un eveniment nou în Google Calendar al utilizatorului
    
    Face proxy la Google Calendar API pentru crearea unui eveniment.
    Folosește fus orar Europa/București ca default.
    
    Args:
        payload: Datele evenimentului (titlu, descriere, date, locație)
        access_token: Token-ul OAuth2 extras din header Authorization
        
    Returns:
        JSON cu datele evenimentului creat din Google Calendar
        
    Raises:
        HTTPException: Dacă cererea către Google API eșuează
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
