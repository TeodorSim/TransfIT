"""
Script pentru crearea bazei de date transfit
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Conectare la PostgreSQL (la baza de date postgres default)
try:
    conn = psycopg2.connect(
        user="postgres",
        password="postgres",
        host="localhost",
        port="5432",
        database="postgres"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
    cursor = conn.cursor()
    
    # Verifică dacă baza de date există
    cursor.execute("SELECT 1 FROM pg_database WHERE datname='transfit'")
    exists = cursor.fetchone()
    
    if exists:
        print("✓ Baza de date 'transfit' există deja!")
    else:
        # Creează baza de date
        cursor.execute("CREATE DATABASE transfit")
        print("✓ Baza de date 'transfit' a fost creată cu succes!")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"✗ Eroare: {e}")
    print("\nVerifică:")
    print("1. PostgreSQL rulează: Get-Service postgresql-x64-16")
    print("2. Parola din .env este corectă (default: postgres)")
