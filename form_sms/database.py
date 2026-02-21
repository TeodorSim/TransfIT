import os
from sqlalchemy import create_engine, Column, String, DateTime, func, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, column_property
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()
Base = declarative_base()


# Multi-tenant configuration start
# -
# -
# Configuration for different clinics
# In a real production environment, this could be stored in a "Master" DB
CLINICS_CONFIG = {
    "pro-imp": {
        "db_url": os.getenv("DB_URL_PROIMPLANT"),
        "pgp_key": os.getenv("PGP_KEY_PROIMPLANT"),
        "name": "Pro Implant",
        "logo": "/forms-static/pro_implant_logo.svg"
    },
    "transfit": {
        "db_url": os.getenv("DB_URL_PROIMPLANT"),
        "pgp_key": os.getenv("PGP_KEY_PROIMPLANT"),
        "name": "Transfit",
        "logo": "/forms-static/TRANSFIT_mic.svg",
    }
}

def get_clinic_config(clinic_id: str):
    config = CLINICS_CONFIG.get(clinic_id)
    if not config:
        return None, None
    engine = create_engine(config["db_url"])
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal(), config

# Define the Model Template
class Appointment(Base):
    __tablename__ = "pacienti_programari"
    tally_id = Column(String, primary_key=True)
    data_programare = Column(DateTime)
    ora_start = Column(String)
    status_confirmare = Column(String)
    
    # These will be dynamically decrypted in main.py

# single tenant start
# -
# -
# The DB URL is pulled from .env for security
# DATABASE_URL = os.getenv("DATABASE_URL")
# ENCRYPTION_KEY = os.getenv("PGP_KEY")

# if not DATABASE_URL:
#     raise RuntimeError("DATABASE_URL not found in .env file")

# Create the engine and session factory
# engine = create_engine(DATABASE_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# # Define the Appointment model to match your Postgres table
# class Appointment(Base):
#     __tablename__ = "pacienti_programari"
    
#     tally_id = Column(String, primary_key=True, index=True)
#     cabinet_medic = Column(String)
#     data_programare = Column(DateTime)
#     ora_start = Column(String)
#     status_confirmare = Column(String)
#     # Automatically decrypt columns using the PGP key
#     # We use cast to String because pgp_sym_decrypt returns binary data
#     nume = column_property(
#         func.pgp_sym_decrypt(text("nume"), ENCRYPTION_KEY).cast(String)
#     )
#     prenume = column_property(
#         func.pgp_sym_decrypt(text("prenume"), ENCRYPTION_KEY).cast(String)
#     )
#     phone = column_property(
#         func.pgp_sym_decrypt(text("telefon"), ENCRYPTION_KEY).cast(String)
#     )
# -
# -
# single tenant stop