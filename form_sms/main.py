from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import text, update
from pydantic import BaseModel
from datetime import datetime, time
from fastapi.staticfiles import StaticFiles # Add this import
from database import Appointment, get_clinic_config

# Multitenant config


app = FastAPI()
templates = Jinja2Templates(directory="templates")
app.mount("/forms-static", StaticFiles(directory="forms-static"), name="static")


# Pydantic model for the status update request
class StatusUpdate(BaseModel):
    new_status: str


# 1. ROUTE: Serve the dynamic HTML page
@app.get("/c/{clinic_id}/{tally_id}", response_class=HTMLResponse)
async def serve_multitenant_form(clinic_id: str, tally_id: str, request: Request):
    
    db, config = get_clinic_config(clinic_id)
    if not db:
        raise HTTPException(status_code=404, detail="Clinica nu există")
    
    try:
        # We perform the decryption manually here because the key is dynamic
        query = text(f"""
            SELECT data_programare, ora_start, status_confirmare,
            pgp_sym_decrypt(nume, :key) as nume,
            pgp_sym_decrypt(prenume, :key) as prenume
            FROM pacienti_programari WHERE tally_id = :tid
        """)

        result = db.execute(query, {"key": config["pgp_key"], "tid": tally_id}).fetchone()
        
        if not result or (result.data_programare <= datetime.now().date()):
            db, config = get_clinic_config("transfit")
            return templates.TemplateResponse("not_found_sms_page.html", {
                "request": request,
                "clinic_name": config["name"],
                "clinic_logo": config["logo"]
                })
        
        # Expiration Check
        if result.status_confirmare != "neconfirmat"  :
             return templates.TemplateResponse("expired_sms_page.html", {
                 "request": request,
                "clinic_name": config["name"],
                "clinic_logo": config["logo"]
                })
        
        return templates.TemplateResponse("client_sms_page.html", {
            "request": request,
            "clinic_name": config["name"],
            "clinic_logo": config["logo"],
            "patient_name": f"{result.prenume.capitalize()} {result.nume.capitalize()}",
            "appointment_date": result.data_programare.strftime("%d/%m/%Y"),
            "appointment_time": result.ora_start.strftime("%H:%M") if isinstance(result.ora_start, time) else result.ora_start[:5],
            "tally_id": tally_id,
            "clinic_id": clinic_id # Pass this for the POST action
        })
    finally:
        db.close()

# 2. ROUTE: Handle the status update from the form
@app.post("/api/{clinic_id}/status-update/{tally_id}")
async def update_multitenant_status(
    clinic_id: str, 
    tally_id: str,
    data: StatusUpdate,
    request: Request
    ):
    print(f"Received status update for appointment {tally_id} from clinic {clinic_id} with ip: {request.client.host}")
    db, _ = get_clinic_config(clinic_id)
    if not db:
        return {"success": False}
    
    try:
        stmt = update(Appointment).where(Appointment.tally_id == tally_id).values(status_confirmare=data.new_status)
        print(f"Updating appointment {tally_id} for clinic {clinic_id} to status: {data.new_status} from ip: {request.client.host}")
        db.execute(stmt)
        db.commit()
        return {"success": True}
    finally:
        db.close()