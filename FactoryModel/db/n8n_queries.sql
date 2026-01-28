
-- INSERT: New Patient Appointment (from Tally form)

INSERT INTO pacienti_programari (
    tally_id,
    calendar_event_id,
    data_programare,
    ora_start,
    ora_final,
    tip_vizita,
    cabinet_medic,
    are_trimitere,
    status_confirmare,
    -- Blind index hashes (normalized, lowercase)
    nume_hash,
    prenume_hash,
    telefon_hash,
    -- Encrypted PII
    nume,
    prenume,
    telefon,
    email,
    info_relevante
)
VALUES (
    $1,   -- tally_id from webhook
    $2,   -- calendar_event_id from Google Calendar
    $3,   -- data_programare (DATE)
    $4,   -- ora_start (TIME)
    $5,   -- ora_final (TIME)
    $6,   -- tip_vizita
    $7,   -- cabinet_medic
    $8,   -- are_trimitere (BOOLEAN)
    'neconfirmat',  -- Default status
    
    encode(digest(lower(trim($9)), 'sha256'), 'hex'),   -- nume_hash
    encode(digest(lower(trim($10)), 'sha256'), 'hex'),  -- prenume_hash
    encode(digest(lower(trim($11)), 'sha256'), 'hex'),  -- telefon_hash
    
    -- Encrypt sensitive data using environment variable
    pgp_sym_encrypt($9, '{{$env.N8N_ENCRYPTION_KEY}}'),   -- nume
    pgp_sym_encrypt($10, '{{$env.N8N_ENCRYPTION_KEY}}'),  -- prenume
    pgp_sym_encrypt($11, '{{$env.N8N_ENCRYPTION_KEY}}'),  -- telefon
    pgp_sym_encrypt($12, '{{$env.N8N_ENCRYPTION_KEY}}'),  -- email
    pgp_sym_encrypt($13, '{{$env.N8N_ENCRYPTION_KEY}}')   -- info_relevante
)
RETURNING id, tally_id, status_confirmare;

-- Parameters: $1-tally_id $2-calendar_event_id $3-data_programare $4-ora_start $5-ora_final 
-- $6-tip_vizita $7-cabinet_medic $8-are_trimitere $9-nume $10-prenume $11-telefon $12-email $13-info_relevante


-- SELECT: Find Patient by Phone Number
SELECT 
    id,
    tally_id,
    calendar_event_id,
    data_programare,
    ora_start,
    ora_final,
    tip_vizita,
    cabinet_medic,
    status_confirmare,
    created_at,
    
    -- Decrypt sensitive data for use in notifications
    pgp_sym_decrypt(nume, '{{$env.N8N_ENCRYPTION_KEY}}') as nume,
    pgp_sym_decrypt(prenume, '{{$env.N8N_ENCRYPTION_KEY}}') as prenume,
    pgp_sym_decrypt(telefon, '{{$env.N8N_ENCRYPTION_KEY}}') as telefon,
    pgp_sym_decrypt(email, '{{$env.N8N_ENCRYPTION_KEY}}') as email
    
FROM pacienti_programari 
WHERE telefon_hash = encode(digest(lower(trim($1)), 'sha256'), 'hex')
  AND status_confirmare != 'anulat'
ORDER BY data_programare DESC
LIMIT 1;

-- $1: {{ $json.phone_number }}

-- SELECT: Get Appointment by Tally ID

SELECT 
    id,
    tally_id,
    calendar_event_id,
    data_programare,
    ora_start,
    ora_final,
    cabinet_medic,
    status_confirmare,
    
    -- Decrypt for processing
    pgp_sym_decrypt(nume, '{{$env.N8N_ENCRYPTION_KEY}}') as nume,
    pgp_sym_decrypt(prenume, '{{$env.N8N_ENCRYPTION_KEY}}') as prenume,
    pgp_sym_decrypt(telefon, '{{$env.N8N_ENCRYPTION_KEY}}') as telefon,
    pgp_sym_decrypt(email, '{{$env.N8N_ENCRYPTION_KEY}}') as email
    
FROM pacienti_programari 
WHERE tally_id = $1;

-- $1: {{ $json.tally_id }}

-- UPDATE: Confirm Appointment

UPDATE pacienti_programari
SET 
    status_confirmare = 'confirmat',
    updated_at = CURRENT_TIMESTAMP
WHERE tally_id = $1
  AND status_confirmare = 'neconfirmat'
RETURNING 
    id,
    pgp_sym_decrypt(nume, '{{$env.N8N_ENCRYPTION_KEY}}') as nume,
    pgp_sym_decrypt(prenume, '{{$env.N8N_ENCRYPTION_KEY}}') as prenume,
    data_programare,
    ora_start;

-- $1: {{ $json.tally_id }}

-- UPDATE: Cancel Appointment

UPDATE pacienti_programari
SET 
    status_confirmare = 'anulat',
    updated_at = CURRENT_TIMESTAMP
WHERE tally_id = $1
RETURNING 
    id,
    calendar_event_id,
    pgp_sym_decrypt(email, '{{$env.N8N_ENCRYPTION_KEY}}') as email;

-- $1: {{ $json.tally_id }}

-- CONFLICT CHECK: Before Creating Appointment

WITH conflict_check AS (
    -- Check existing appointments
    SELECT COUNT(*) as conflicts
    FROM pacienti_programari
    WHERE cabinet_medic = $1
      AND data_programare = $2
      AND status_confirmare != 'anulat'
      AND (
          ($3::TIME < ora_final AND $4::TIME > ora_start)
      )
    
    UNION ALL
    
    -- Check doctor unavailability blocks
    SELECT COUNT(*) as conflicts
    FROM doctor_availability
    WHERE cabinet_medic = $1
      AND DATE(start_time) = $2
      AND (
          ($3::TIME < end_time::TIME AND $4::TIME > start_time::TIME)
      )
)
SELECT 
    COALESCE(SUM(conflicts), 0) as conflict_count,
    CASE 
        WHEN COALESCE(SUM(conflicts), 0) > 0 THEN false
        ELSE true
    END as is_available
FROM conflict_check;

-- $1: {{ $json.cabinet_medic }}
-- $2: {{ $json.data_programare }}
-- $3: {{ $json.ora_start }}
-- $4: {{ $json.ora_final }}

-- INSERT: Doctor Unavailability Block

INSERT INTO doctor_availability (
    cabinet_medic,
    start_time,
    end_time,
    reason,
    calendar_event_id
)
VALUES (
    $1,  -- cabinet_medic
    $2,  -- start_time (TIMESTAMP)
    $3,  -- end_time (TIMESTAMP)
    $4,  -- reason
    $5   -- calendar_event_id
)
RETURNING id, cabinet_medic, start_time, end_time;

-- $1: {{ $json.doctor_name }}
-- $2: {{ $json.start_datetime }}
-- $3: {{ $json.end_datetime }}
-- $4: {{ $json.block_reason }}
-- $5: {{ $json.calendar_event_id }}

-- SELECT: Daily Schedule for Doctor

SELECT 
    id,
    data_programare,
    ora_start,
    ora_final,
    tip_vizita,
    status_confirmare,
    
    -- Decrypt for daily schedule
    pgp_sym_decrypt(nume, '{{$env.N8N_ENCRYPTION_KEY}}') as nume,
    pgp_sym_decrypt(prenume, '{{$env.N8N_ENCRYPTION_KEY}}') as prenume,
    pgp_sym_decrypt(telefon, '{{$env.N8N_ENCRYPTION_KEY}}') as telefon
    
FROM pacienti_programari 
WHERE cabinet_medic = $1
  AND data_programare = $2
  AND status_confirmare != 'anulat'
ORDER BY ora_start;

-- $1: {{ $json.cabinet_medic }}
-- $2: {{ $json.target_date }}

-- SELECT: Pending Confirmations (for reminder workflow)

SELECT 
    id,
    tally_id,
    data_programare,
    ora_start,
    cabinet_medic,
    
    -- Decrypt for sending reminders
    pgp_sym_decrypt(nume, '{{$env.N8N_ENCRYPTION_KEY}}') as nume,
    pgp_sym_decrypt(prenume, '{{$env.N8N_ENCRYPTION_KEY}}') as prenume,
    pgp_sym_decrypt(telefon, '{{$env.N8N_ENCRYPTION_KEY}}') as telefon,
    pgp_sym_decrypt(email, '{{$env.N8N_ENCRYPTION_KEY}}') as email
    
FROM pacienti_programari 
WHERE status_confirmare = 'neconfirmat'
  AND data_programare >= CURRENT_DATE
  AND data_programare <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY data_programare, ora_start;

-- DELETE: Remove Old Test Data (use with caution)

DELETE FROM pacienti_programari
WHERE tally_id LIKE 'tally_test_%'
RETURNING id, tally_id;

-- NOTES FOR n8n IMPLEMENTATION

--
-- 1. Environment Variable Setup:
--    - Set N8N_ENCRYPTION_KEY in n8n environment or docker-compose
--    - Never hardcode encryption keys in workflows
--
-- 2. Error Handling:
--    - Wrap queries in Try-Catch nodes
--    - Log decryption failures separately
--    - Handle unique constraint violations (duplicate tally_id)
--
-- 3. Performance:
--    - Use indices on telefon_hash, nume_hash for fast lookups
--    - Avoid SELECT * - only decrypt fields you need
--    - Batch operations where possible
--
-- 4. Security:
--    - Never log decrypted PII
--    - Use parameterized queries
--    - Validate inputs before encryption (I think Tally does this already? Not sure.)
--    - Rotate encryption keys periodically (Re-encrypt existing data as needed)
--

