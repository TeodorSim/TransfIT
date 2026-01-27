"""
Script pentru adăugarea datelor de test în baza de date
"""
from database import SessionLocal
from models import Appointment
from datetime import date

def add_test_appointments():
    db = SessionLocal()
    try:
        # Programări pentru Teodor Simionescu
        apt1 = Appointment(
            patient_name='Teodor Simionescu',
            appointment_date=date(2026, 1, 28),
            appointment_time='10:00',
            details='Consultație fizioterapie'
        )
        apt2 = Appointment(
            patient_name='Teodor Simionescu',
            appointment_date=date(2026, 2, 5),
            appointment_time='14:30',
            details='Tratament recuperare post-operatorie'
        )
        
        # Programare pentru Maria Popescu
        apt3 = Appointment(
            patient_name='Maria Popescu',
            appointment_date=date(2026, 1, 29),
            appointment_time='11:00',
            details='Masaj terapeutic'
        )
        
        db.add_all([apt1, apt2, apt3])
        db.commit()
        
        print("✓ Adăugate 3 programări de test:")
        print("  - Teodor Simionescu (2 programări)")
        print("  - Maria Popescu (1 programare)")
        
    except Exception as e:
        print(f"✗ Eroare: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_test_appointments()
