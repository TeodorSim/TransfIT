# Artegor Dent Clinic - Database Architecture

## System Architecture

### Core Components

- **Database**: PostgreSQL 14+ with pgcrypto extension
- **Workflow Engine**: n8n for appointment automation
- **Calendar Integration**: Google Calendar API
- **Encryption**: AES-256 symmetric encryption via pgcrypto
- **Search Strategy**: Blind index pattern using SHA-256 hashes

### Security Model

**Defense-in-Depth Approach**:
1. All PII encrypted at rest using symmetric encryption
2. Blind indices (SHA-256 hashes) enable searching without decryption
3. Separation of plaintext operational data from encrypted sensitive data
4. Application-level encryption key management (not stored in database)

## Database Schema

### Table: pacienti_programari

Patient appointments with encrypted PII and searchable blind indices.

**Plaintext Columns** (for operations/sorting):
- `tally_id` - Unique identifier from Tally forms
- `calendar_event_id` - Google Calendar event reference
- `data_programare`, `ora_start`, `ora_final` - Scheduling information
- `cabinet_medic` - Doctor/office identifier
- `status_confirmare` - Confirmation status (neconfirmat/confirmat/anulat)

**Hashed Columns** (blind indices for searching):
- `nume_hash` - SHA-256 hash of normalized last name
- `prenume_hash` - SHA-256 hash of normalized first name
- `telefon_hash` - SHA-256 hash of normalized phone number

**Encrypted Columns** (BYTEA, protected PII):
- `nume`, `prenume`, `telefon`, `email` - Core patient information
- `info_relevante`, `alte_info_optionale` - Medical notes

### Table: doctor_availability

Time blocks when doctors are unavailable (lunch, vacation, meetings).

**Columns**:
- `cabinet_medic` - Doctor identifier
- `start_time`, `end_time` - TIMESTAMP range for unavailability
- `reason` - Explanation (e.g., "Lunch Break", "Vacation")
- `calendar_event_id` - Optional Google Calendar reference

## Blind Index Strategy

### Implementation

**Normalization Before Hashing**:
```sql
-- Always lowercase and trim before hashing
CREATE FUNCTION normalize_for_hash(input_text TEXT) RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(TRIM(input_text));
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**Search Pattern**:
```sql
-- Search by phone without decrypting all records
SELECT * FROM pacienti_programari
WHERE telefon_hash = ENCODE(DIGEST(LOWER(TRIM('+40712345678')), 'sha256'), 'hex');
```

## Deployment

### Complete Setup - Fresh Database

Navigate to your docker-compose directory and execute the following commands:

```bash
cd /path/to/n8n-hosting/docker-compose/withPostgres

docker-compose exec postgres psql -U username -d n8n -c "CREATE DATABASE artegor_clinic_db;"

docker-compose exec postgres psql -U username -d n8n -c "CREATE USER admin_artegor WITH PASSWORD 'SecurePass123';"

docker-compose exec postgres psql -U username -d n8n -c "GRANT ALL PRIVILEGES ON DATABASE artegor_clinic_db TO admin_artegor;"

docker-compose exec -T postgres psql -U username -d artegor_clinic_db < ../../../FactoryModel/db/schema.sql

docker-compose exec -T postgres psql -U username -d artegor_clinic_db < ../../../FactoryModel/db/test_operations.sql
```


### Verify Database State

Check that everything is working:

```bash
# List all databases
docker-compose exec postgres psql -U itscutaru -d n8n -c "\l"

# List tables in artegor_clinic_db
docker-compose exec postgres psql -U itscutaru -d artegor_clinic_db -c "\dt"

# Count records in tables
docker-compose exec postgres psql -U itscutaru -d artegor_clinic_db -c "SELECT COUNT(*) FROM pacienti_programari;"
docker-compose exec postgres psql -U itscutaru -d artegor_clinic_db -c "SELECT COUNT(*) FROM doctor_availability;"
```

## Environment Variables (n8n Integration)

Required environment variables for the application and n8n workflows:

### Application Layer

```env
# Database Connection
DB_HOST=postgres
DB_PORT=5432
DB_NAME=artegor_clinic_db
DB_USER=admin_artegor
DB_PASSWORD=<secure_password>

# Encryption Key (CRITICAL - Never commit to version control)
DB_ENCRYPTION_KEY=<generate_strong_key_minimum_32_chars>

# Google Calendar API
GOOGLE_CLIENT_ID=<your_client_id>
GOOGLE_CLIENT_SECRET=<your_client_secret>
GOOGLE_REDIRECT_URI=https://your-domain.com/oauth/callback

# n8n Configuration
N8N_HOST=http://n8n:5678
N8N_API_KEY=<n8n_api_key>

# Application Settings
TIMEZONE=Europe/Bucharest
DEFAULT_APPOINTMENT_DURATION=60
```

### n8n Workflow Variables

```env
# n8n Environment Variables
N8N_ENCRYPTION_KEY=<n8n_specific_encryption_key>
WEBHOOK_URL=https://your-domain.com/webhook
POSTGRES_HOST=postgres
POSTGRES_DB=artegor_clinic_db
POSTGRES_USER=admin_artegor
POSTGRES_PASSWORD=<secure_password>
```

### Key Generation

Generate secure encryption key:

```bash
# Linux/macOS
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Conflict Detection

The system implements cross-table conflict checking to prevent double-booking and scheduling during unavailable periods.

**Query Pattern**:
```sql
-- Check both appointments AND doctor unavailability
WITH conflict_params AS (
    SELECT 'Dr. Maria Ionescu' AS doctor,
           '2026-02-15' AS date,
           '12:30:00' AS start_time,
           '13:30:00' AS end_time
)
SELECT (
    (SELECT COUNT(*) FROM pacienti_programari WHERE ...) +
    (SELECT COUNT(*) FROM doctor_availability WHERE ...)
) AS total_conflicts;
```

## Usage Examples

### Insert Encrypted Appointment

```javascript
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function insertAppointment(data) {
    const query = `
        INSERT INTO pacienti_programari (
            tally_id, data_programare, ora_start, ora_final,
            cabinet_medic, nume_hash, prenume_hash, telefon_hash,
            nume, prenume, telefon, email
        ) VALUES (
            $1, $2, $3, $4, $5,
            ENCODE(DIGEST(LOWER(TRIM($6)), 'sha256'), 'hex'),
            ENCODE(DIGEST(LOWER(TRIM($7)), 'sha256'), 'hex'),
            ENCODE(DIGEST(LOWER(TRIM($8)), 'sha256'), 'hex'),
            pgp_sym_encrypt($6, $9),
            pgp_sym_encrypt($7, $9),
            pgp_sym_encrypt($8, $9),
            pgp_sym_encrypt($10, $9)
        ) RETURNING id
    `;
    
    const values = [
        data.tallyId,
        data.date,
        data.startTime,
        data.endTime,
        data.doctor,
        data.lastName,    // Will be normalized and hashed
        data.firstName,   // Will be normalized and hashed
        data.phone,       // Will be normalized and hashed
        process.env.DB_ENCRYPTION_KEY,
        data.email
    ];
    
    const result = await client.query(query, values);
    return result.rows[0].id;
}
```

### Search by Phone Number

```javascript
async function findPatientByPhone(phoneNumber) {
    const query = `
        SELECT 
            id,
            tally_id,
            pgp_sym_decrypt(nume, $2) AS last_name,
            pgp_sym_decrypt(prenume, $2) AS first_name,
            pgp_sym_decrypt(telefon, $2) AS phone,
            data_programare,
            cabinet_medic
        FROM pacienti_programari
        WHERE telefon_hash = ENCODE(DIGEST(LOWER(TRIM($1)), 'sha256'), 'hex')
    `;
    
    const result = await client.query(query, [
        phoneNumber,
        process.env.DB_ENCRYPTION_KEY
    ]);
    
    return result.rows;
}
```


## Maintenance

### Key Rotation Procedure

```sql
-- Example key rotation (requires application-level coordination)
UPDATE pacienti_programari
SET nume = pgp_sym_encrypt(
    pgp_sym_decrypt(nume, 'OLD_KEY')::TEXT,
    'NEW_KEY'
)
WHERE id = ...;
```

**Version**: 1.0.0  
**Last Updated**: 2026-01-28  
**Database Engine**: PostgreSQL 14+  
**Extension Requirements**: pgcrypto
