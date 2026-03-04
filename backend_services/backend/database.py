"""
Configurare conexiune la baza de date PostgreSQL
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from pathlib import Path

# Încarcă variabile de mediu din .env
load_dotenv()

# URL conexiune PostgreSQL
# Format: postgresql://user:password@host:port/database

# Get the path to the directory where database.py is located
BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"
BACKEND_SERVICES_DIR = BASE_DIR / "backend_services"

# Explicitly point to the .env file in the same directory
load_dotenv(dotenv_path=BACKEND_SERVICES_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL_LOGIN")
# Add a check to prevent the "None" crash with a helpful message
if not DATABASE_URL:
    raise RuntimeError(
        f"DATABASE_URL_LOGIN not found! Looked in: {BACKEND_SERVICES_DIR / '.env'}. "
        "Please ensure the .env file exists and contains DATABASE_URL_LOGIN."
    )
# Creare engine SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Setează la False în producție
    pool_pre_ping=True  # Verifică conexiunea înainte de utilizare
)
print(f"Database connected successfully to: {DATABASE_URL[DATABASE_URL.find('@') + 1:]}")  # Afișează doar host și database, nu user și password
# Creare session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Bază pentru modele
Base = declarative_base()

# Dependency pentru obținerea sesiunii de bază de date
def get_db():
    """
    Generator de sesiune DB pentru dependency injection în FastAPI
    
    Creează o sesiune de bază de date, o furnizează endpoint-ului,
    și o închide automat după finalizarea request-ului.
    Folosit cu Depends(get_db) în parametrii funcțiilor FastAPI.
    
    Yields:
        Session: Sesiune SQLAlchemy pentru interacțiune cu baza de date
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
