"""
Script rapid pentru vizualizarea bazei de date TransfIT
"""
import psycopg2
from tabulate import tabulate
from datetime import datetime

def view_database():
    try:
        # Conectare la baza de date
        conn = psycopg2.connect(
            user="postgres",
            password="postgres",
            host="localhost",
            port="5432",
            database="transfit"
        )
        
        cursor = conn.cursor()
        
        # Obține toate programările
        cursor.execute("""
            SELECT id, patient_name, appointment_date, appointment_time, details, created_at
            FROM appointments
            ORDER BY appointment_date DESC, appointment_time DESC
        """)
        
        rows = cursor.fetchall()
        
        if not rows:
            print("Baza de date este goală. Rulează: http://localhost:8000/api/seed-data")
            return
        
        # Formatare date pentru afișare
        formatted_rows = []
        for row in rows:
            formatted_rows.append([
                row[0],  # id
                row[1],  # patient_name
                row[2].strftime('%d.%m.%Y'),  # appointment_date
                row[3],  # appointment_time
                row[4][:40] + '...' if row[4] and len(row[4]) > 40 else row[4],  # details
                row[5].strftime('%d.%m %H:%M') if row[5] else ''  # created_at
            ])
        
        # Afișare tabel frumos
        headers = ['ID', 'Pacient', 'Data', 'Ora', 'Detalii', 'Creat la']
        print("\n" + "="*100)
        print(f"BAZA DE DATE TRANSFIT - Total programări: {len(rows)}")
        print("="*100 + "\n")
        print(tabulate(formatted_rows, headers=headers, tablefmt='grid'))
        
        # Statistici
        cursor.execute("SELECT COUNT(DISTINCT patient_name) FROM appointments")
        unique_patients = cursor.fetchone()[0]
        print(f"\n📊 Statistici: {len(rows)} programări pentru {unique_patients} pacienți unici\n")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Eroare: {e}")

if __name__ == "__main__":
    view_database()
