"""
TransfIT Backend - FastAPI + PostgreSQL
API pentru gestionarea programărilor pacienților
"""

from fastapi import FastAPI, HTTPException, Depends, Header, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import json
import os
from pathlib import Path
import httpx
import secrets
from passlib.context import CryptContext

from database import get_db, engine
from models import Base, User, UserSession
from schemas import CalendarEventCreate
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
# Lista de admini (se poate suprascrie din env)
ADMIN_EMAILS = {
    email.strip().lower()
    for email in os.getenv("ADMIN_EMAILS", "TransfitAccount").split(",")
    if email.strip()
}

# Servește frontend-ul static pentru flow-ul Google OAuth (necesită HTTP, nu file://)
BASE_DIR = Path(__file__).resolve().parent.parent
FORM_LINKS_PATH = BASE_DIR / "backend" / "form_links.json"

def load_form_links():
    """Încarcă maparea formularelor per utilizator din fișier JSON."""
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
    """Generează hash securizat pentru parolă."""
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    """Verifică parola față de hash-ul stocat."""
    return pwd_context.verify(password, password_hash)

def create_session(db: Session, user_id: int) -> UserSession:
    """Creează și persistă o sesiune de autentificare pentru user."""
    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)
    token = secrets.token_urlsafe(48)
    session = UserSession(user_id=user_id, token=token, expires_at=expires_at)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def get_session_from_cookie(request: Request, db: Session) -> Optional[UserSession]:
    """Recuperează sesiunea curentă din cookie și o validează."""
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
    """Verifică dacă utilizatorul curent este admin; altfel returnează 401/403."""
    session = get_session_from_cookie(request, db)
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    is_admin = (user.role or "").lower() == "admin" or user.email.lower() in ADMIN_EMAILS
    if not is_admin:
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

    normalized_email = payload.email.lower()
    role = "admin" if normalized_email in ADMIN_EMAILS else "user"
    user = User(
        email=normalized_email,
        password_hash=hash_password(payload.password),
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse(id=user.id, email=user.email, role=user.role)

@app.post("/api/auth/login", response_model=AuthResponse)
def login_user(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    email = payload.email.lower()
    user = db.query(User).filter(func.lower(User.email) == email).first()
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
        user=UserResponse(id=user.id, email=user.email, role=user.role),
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

    return UserResponse(id=user.id, email=user.email, role=user.role)

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
    return [{"id": u.id, "email": u.email, "role": u.role} for u in users]

@app.get("/api/form-links")
def get_form_links(email: Optional[str] = None):
    """Returnează linkurile formularului pentru contul logat."""
    data = load_form_links()
    default_links = data.get("default", {})
    if not email:
        return default_links

    key = email.strip().lower()
    return data.get("users", {}).get(key, default_links)

@app.get("/api/webhooks/delete-appointment")
def forward_delete_webhook(data: str):
    """Trimite webhook-ul de stergere prin backend (evita CORS in browser)."""
    webhook_url = "https://transfit.site/n8n/webhook-test/imp-stergere-programare-pacient"
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(webhook_url, params={"data": data})
        response.raise_for_status()
        try:
            return response.json()
        except ValueError:
            return {"raw": response.text}
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=exc.response.text)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

@app.get("/api/appointments/search/{patient_name}")
def search_patient_appointments(patient_name: str):
    """Proxy către n8n pentru căutarea programărilor (fără DB local)."""
    webhook_url = "https://transfit.site/n8n/webhook/imp-verificare-pacient"
    name_parts = patient_name.strip().split(" ")
    prenume = ""
    nume = ""
    if len(name_parts) >= 2:
        prenume = " ".join(name_parts[:-1])
        nume = name_parts[-1]
    elif name_parts:
        prenume = name_parts[0]

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(
                webhook_url,
                params={
                    "prenume": prenume.lower(),
                    "nume": nume.lower()
                }
            )
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=exc.response.text)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

@app.get("/api/appointments/reprogramari")
def list_reprogramari(status: Optional[str] = None, from_: Optional[str] = None, to: Optional[str] = None):
    """Lista programărilor care necesită reprogramare sau anulare."""
    webhook_url = "https://transfit.site/n8n/webhook/imp-verificare-pacient"

    params = {}
    if status:
        params["status"] = status
    if from_:
        params["from"] = from_
    if to:
        params["to"] = to

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(webhook_url, params=params)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=exc.response.text)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

@app.get("/api/google/calendar/events")
def list_google_calendar_events(
    maxResults: int = 10,
    timeMin: Optional[str] = None,
    access_token: str = Depends(get_bearer_token)
):
    """Listește evenimentele din Google Calendar al utilizatorului autentificat."""
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
    """Creează un eveniment nou în Google Calendar al utilizatorului."""
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
