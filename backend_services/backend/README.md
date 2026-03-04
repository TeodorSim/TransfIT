# TransfIT Backend - FastAPI + PostgreSQL

Backend REST API pentru aplicația TransfIT de gestionare programări fizioterapie.

## 📋 Cerințe

- Python 3.11+
- PostgreSQL 12+
- pip

## 🚀 Setup Rapid

### 1. Instalare dependențe

```powershell
cd f:\Transfit\backend
pip install -r requirements.txt
```

### 2. Configurare bază de date PostgreSQL

**Deschide pgAdmin sau psql și creează baza de date:**

```sql
CREATE DATABASE transfit;
```

### 3. Configurare conexiune

Copiază `.env.example` în `.env`:

```powershell
Copy-Item .env.example .env
```

Editează `.env` cu datele tale PostgreSQL:

```
DATABASE_URL=postgresql://postgres:parola_ta@localhost:5432/transfit
```

### 4. Pornire server

```powershell
python main.py
```

Sau cu uvicorn direct:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server va rula pe: **http://localhost:8000**

### 5. Populare cu date de test

Accesează în browser sau Postman:

```
GET http://localhost:8000/api/seed-data
```

## 📡 Endpoints Disponibile

### Health Check
```
GET /
```

### Căutare programări pacient
```
GET /api/appointments/search/{patient_name}
```
Exemplu: `GET /api/appointments/search/Popescu`

### Toate programările
```
GET /api/appointments?skip=0&limit=100
```

### Creare programare nouă
```
POST /api/appointments
Content-Type: application/json

{
  "patient_name": "Popescu Ion",
  "appointment_date": "2026-01-30",
  "appointment_time": "10:00",
  "details": "Consultație fizioterapie"
}
```

### Ștergere programare
```
DELETE /api/appointments/{id}
```

### Documentație interactivă Swagger
```
http://localhost:8000/docs
```

## 🗂️ Structură Fișiere

```
backend/
├── main.py          # FastAPI app și endpoints
├── models.py        # Modele SQLAlchemy
├── database.py      # Conexiune PostgreSQL
├── schemas.py       # Validare Pydantic
├── requirements.txt # Dependențe Python
├── .env.example     # Template configurare
└── README.md        # Acest fișier
```

## 🔧 Configurare PostgreSQL (dacă nu ai)

### Windows:

1. Download PostgreSQL: https://www.postgresql.org/download/windows/
2. Instalează cu pgAdmin 4
3. Setează parola pentru user `postgres`
4. Creează baza de date `transfit`

### Verificare conexiune:

```powershell
psql -U postgres -d transfit
```

## 🛠️ Troubleshooting

### Eroare: "relation appointments does not exist"
- Rulează `python main.py` - tabelele se creează automat la primul start

### Eroare: "could not connect to server"
- Verifică că PostgreSQL rulează: Services → PostgreSQL
- Verifică portul 5432 este disponibil

### Eroare: "password authentication failed"
- Verifică parola în `.env` → `DATABASE_URL`

## 📊 Schema Bază de Date

```sql
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_name VARCHAR NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_patient_name ON appointments(patient_name);
```

## 🔐 Securitate pentru Producție

- [ ] Schimbă `echo=True` în `False` în `database.py`
- [ ] Adaugă autentificare JWT
- [ ] Setează CORS specific pentru domeniul production
- [ ] Folosește variabile de mediu securizate
- [ ] Activează HTTPS

## 📝 Next Steps

1. Actualizează frontend-ul să folosească API-ul
2. Adaugă autentificare utilizatori
3. Integrează cu Google Calendar API
4. Deploy pe cloud (Render, Railway, Heroku)
