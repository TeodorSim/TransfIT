"""
Modele SQLAlchemy pentru baza de date PostgreSQL
"""

from sqlalchemy import Column, Integer, String, DateTime, Date
from sqlalchemy.sql import func
from database import Base

class Appointment(Base):
    """
    Model SQLAlchemy pentru programări pacienți
    
    Representă o programare în baza de date cu toate informațiile necesare:
    - Identitate pacient
    - Data și ora programării
    - Detalii despre consultație/tratament
    - Timestamp-uri pentru audit (creare și modificare)
    
    Attributes:
        id: Identificator unic primar
        patient_name: Numele complet al pacientului (indexat pentru căutări rapide)
        appointment_date: Data programării
        appointment_time: Ora programării (format HH:MM)
        details: Detalii despre consultație (opțional)
        created_at: Timestamp creare automat
        updated_at: Timestamp ultima modificare (actualizat automat)
    """
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String, index=True, nullable=False)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(String, nullable=False)
    details = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Appointment(id={self.id}, patient={self.patient_name}, date={self.appointment_date})>"
