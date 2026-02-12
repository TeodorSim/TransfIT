from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import text, update
from pydantic import BaseModel
from datetime import time
from fastapi.staticfiles import StaticFiles # Add this import

# Import our database logic
from database import SessionLocal, Appointment, engine

app = FastAPI()
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic model for the status update request
class StatusUpdate(BaseModel):
    new_status: str

# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CRITICAL: Check if table exists on startup
@app.on_event("startup")
def validate_db_table():
    with engine.connect() as conn:
        try:
            # Attempt to select 1 from the table; fails if table is missing
            conn.execute(text("SELECT 1 FROM pacienti_programari LIMIT 1"))
            print("Successfully connected to Postgres and found 'pacienti_programari' table.")
        except Exception as e:
            print("\n" + "="*50)
            print("CRITICAL ERROR: 'pacienti_programari' table NOT found in Database!")
            print("Please ensure n8n or your migration script created the table.")
            print("="*50 + "\n")
            # This raises an error and prevents the app from starting
            raise RuntimeError("Database table 'pacienti_programari' is missing.") from e

# 1. ROUTE: Serve the dynamic HTML page
@app.get("/c/{tally_id}", response_class=HTMLResponse)
async def serve_confirmation_page(request: Request, tally_id: str, db: Session = Depends(get_db)):
    # Query the database for the specific appointment
    apt = db.query(Appointment).filter(Appointment.tally_id == tally_id).first()
    
    # 2. Does it exist? If not, show a 404 page or a custom "not found" template
    if not apt:
        raise HTTPException(status_code=404, detail="Programare negăsită")
    
    
    # 3. Status check: If it's already been acted upon, show the expired page
    # Assuming "neconfirmat" is your default starting value
    if apt.status_confirmare != "neconfirmat":
        return templates.TemplateResponse("expired_sms_page.html", {
            "request": request,
            "patient_name": apt.prenume,
            "current_status": apt.status_confirmare
        })

    formatted_date = apt.data_programare.strftime("%d/%m/%Y")
    formatted_time = apt.ora_start
    if isinstance(formatted_time, str) and len(formatted_time) >= 5:
        formatted_time = formatted_time[:5] # Takes "14:00" from "14:00:00"
    elif isinstance(formatted_time, time):
        # If it's a Python time object: 14:00:00 -> 14:00
        formatted_time = formatted_time.strftime("%H:%M")

    # Pass the data to your client_sms_page.html
    return templates.TemplateResponse("client_sms_page.html", {
        "request": request,
        "patient_name": apt.nume.capitalize() + " " + apt.prenume.capitalize(),
        "appointment_date": formatted_date,
        "appointment_time": formatted_time,
        "status_confirmare": apt.status_confirmare,
        "tally_id": tally_id
    })

# 2. ROUTE: Handle the status update from the form
@app.post("/api/status-update/{tally_id}")
async def update_status(tally_id: str, data: StatusUpdate, db: Session = Depends(get_db)):
    apt = db.query(Appointment).filter(Appointment.tally_id == tally_id).first()
    
    if not apt:
        raise HTTPException(status_code=404, detail="ID invalid")
    stmt = (
        update(Appointment)
        .where(Appointment.tally_id == tally_id)
        .values(status_confirmare=data.new_status)
    )

    # Update the status in Postgres
    apt.status_confirmare = data.new_status
    result = db.execute(stmt)
    db.commit()
    # 2. Check if a row was actually affected
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="ID invalid sau inexistent")
    
    print(f"Appointment {tally_id} received an updated to: {data.new_status}")
    return {"success": True, "message": "Status actualizat cu succes"}