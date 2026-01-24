"""
Configurare conexiune la baza de date PostgreSQL
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Încarcă variabile de mediu din .env
load_dotenv()

# URL conexiune PostgreSQL
# Format: postgresql://user:password@host:port/database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/transfit"
)

# Creare engine SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Setează la False în producție
    pool_pre_ping=True  # Verifică conexiunea înainte de utilizare
)

# Creare session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Bază pentru modele
Base = declarative_base()

# Dependency pentru obținerea sesiunii de bază de date
def get_db():
    """
    Generator de sesiune DB pentru dependency injection în FastAPI
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
