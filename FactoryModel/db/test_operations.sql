

\echo 'Starting Test Operations...'
\echo ''


-- TEST 1: Insert Multiple Patient Appointments with Encrypted PII
\echo 'TEST 1: Inserting multiple patient appointments...'
\echo ''

-- Patient 1: Ion Popescu (Morning appointment)
INSERT INTO pacienti_programari (
    tally_id, calendar_event_id, data_programare, ora_start, ora_final,
    tip_vizita, cabinet_medic, are_trimitere, status_confirmare,
    nume_hash, prenume_hash, telefon_hash,
    nume, prenume, telefon, email, info_relevante
) VALUES (
    'tally_001', 'gcal_event_001', '2026-02-15', '09:00:00', '10:00:00',
    'Consultatie dentara', 'Dr. Maria Ionescu', FALSE, 'confirmat',
    ENCODE(DIGEST(LOWER(TRIM('Popescu')), 'sha256'), 'hex'),
    ENCODE(DIGEST(LOWER(TRIM('Ion')), 'sha256'), 'hex'),
    ENCODE(DIGEST(LOWER(TRIM('+40712345678')), 'sha256'), 'hex'),
    pgp_sym_encrypt('Popescu', 'TEST_KEY'),
    pgp_sym_encrypt('Ion', 'TEST_KEY'),
    pgp_sym_encrypt('+40712345678', 'TEST_KEY'),
    pgp_sym_encrypt('ion.popescu@example.com', 'TEST_KEY'),
    pgp_sym_encrypt('Regular checkup, no allergies', 'TEST_KEY')
);

-- Patient 2: Elena Georgescu (Mid-morning appointment)
INSERT INTO pacienti_programari (
    tally_id, calendar_event_id, data_programare, ora_start, ora_final,
    tip_vizita, cabinet_medic, are_trimitere, status_confirmare,
    nume_hash, prenume_hash, telefon_hash,
    nume, prenume, telefon, email, info_relevante
) VALUES (
    'tally_002', 'gcal_event_002', '2026-02-15', '10:30:00', '11:30:00',
    'Curatare dentara', 'Dr. Maria Ionescu', TRUE, 'confirmat',
    ENCODE(DIGEST(LOWER(TRIM('Georgescu')), 'sha256'), 'hex'),
    ENCODE(DIGEST(LOWER(TRIM('Elena')), 'sha256'), 'hex'),
    ENCODE(DIGEST(LOWER(TRIM('+40723456789')), 'sha256'), 'hex'),
    pgp_sym_encrypt('Georgescu', 'TEST_KEY'),
    pgp_sym_encrypt('Elena', 'TEST_KEY'),
    pgp_sym_encrypt('+40723456789', 'TEST_KEY'),
    pgp_sym_encrypt('elena.georgescu@example.com', 'TEST_KEY'),
    pgp_sym_encrypt('Sensitive to cold, has referral from Dr. Popa', 'TEST_KEY')
);

-- Patient 3: Mihai Constantinescu (Afternoon appointment)
INSERT INTO pacienti_programari (
    tally_id, calendar_event_id, data_programare, ora_start, ora_final,
    tip_vizita, cabinet_medic, are_trimitere, status_confirmare,
    nume_hash, prenume_hash, telefon_hash,
    nume, prenume, telefon, email, info_relevante, alte_info_optionale
) VALUES (
    'tally_003', 'gcal_event_003', '2026-02-15', '14:00:00', '15:00:00',
    'Urgenta dentara', 'Dr. Maria Ionescu', FALSE, 'neconfirmat',
    ENCODE(DIGEST(LOWER(TRIM('Constantinescu')), 'sha256'), 'hex'),
    ENCODE(DIGEST(LOWER(TRIM('Mihai')), 'sha256'), 'hex'),
    ENCODE(DIGEST(LOWER(TRIM('+40734567890')), 'sha256'), 'hex'),
    pgp_sym_encrypt('Constantinescu', 'TEST_KEY'),
    pgp_sym_encrypt('Mihai', 'TEST_KEY'),
    pgp_sym_encrypt('+40734567890', 'TEST_KEY'),
    pgp_sym_encrypt('mihai.const@example.com', 'TEST_KEY'),
    pgp_sym_encrypt('Severe toothache, upper right molar', 'TEST_KEY'),
    pgp_sym_encrypt('Prefers local anesthesia, diabetic patient', 'TEST_KEY')
);

-- Patient 4: Ana Maria Dumitrescu (Different doctor, same day)
INSERT INTO pacienti_programari (
    tally_id, calendar_event_id, data_programare, ora_start, ora_final,
    tip_vizita, cabinet_medic, are_trimitere, status_confirmare,
    nume_hash, prenume_hash, telefon_hash,
    nume, prenume, telefon, email, info_relevante
) VALUES (
    'tally_004', 'gcal_event_004', '2026-02-15', '09:30:00', '10:30:00',
    'Ortodontie', 'Dr. Andrei Popescu', TRUE, 'confirmat',
    ENCODE(DIGEST(LOWER(TRIM('Dumitrescu')), 'sha256'), 'hex'),
    ENCODE(DIGEST(LOWER(TRIM('Ana Maria')), 'sha256'), 'hex'),
    ENCODE(DIGEST(LOWER(TRIM('+40745678901')), 'sha256'), 'hex'),
    pgp_sym_encrypt('Dumitrescu', 'TEST_KEY'),
    pgp_sym_encrypt('Ana Maria', 'TEST_KEY'),
    pgp_sym_encrypt('+40745678901', 'TEST_KEY'),
    pgp_sym_encrypt('ana.dumitrescu@example.com', 'TEST_KEY'),
    pgp_sym_encrypt('Braces adjustment, 3rd month', 'TEST_KEY')
);

-- Patient 5: Radu Ionescu (Next day appointment)
INSERT INTO pacienti_programari (
    tally_id, calendar_event_id, data_programare, ora_start, ora_final,
    tip_vizita, cabinet_medic, are_trimitere, status_confirmare,
    nume_hash, prenume_hash, telefon_hash,
    nume, prenume, telefon, email
) VALUES (
    'tally_005', 'gcal_event_005', '2026-02-16', '11:00:00', '12:00:00',
    'Control post-operatoriu', 'Dr. Maria Ionescu', FALSE, 'confirmat',
    ENCODE(DIGEST(LOWER(TRIM('Ionescu')), 'sha256'), 'hex'),
    ENCODE(DIGEST(LOWER(TRIM('Radu')), 'sha256'), 'hex'),
    ENCODE(DIGEST(LOWER(TRIM('+40756789012')), 'sha256'), 'hex'),
    pgp_sym_encrypt('Ionescu', 'TEST_KEY'),
    pgp_sym_encrypt('Radu', 'TEST_KEY'),
    pgp_sym_encrypt('+40756789012', 'TEST_KEY'),
    pgp_sym_encrypt('radu.ionescu@example.com', 'TEST_KEY')
);

-- Patient 6: Cancelled appointment (to test status filtering)
INSERT INTO pacienti_programari (
    tally_id, calendar_event_id, data_programare, ora_start, ora_final,
    tip_vizita, cabinet_medic, are_trimitere, status_confirmare,
    nume_hash, prenume_hash, telefon_hash,
    nume, prenume, telefon, email
) VALUES (
    'tally_006', 'gcal_event_006', '2026-02-15', '16:00:00', '17:00:00',
    'Consultatie', 'Dr. Maria Ionescu', FALSE, 'anulat',
    ENCODE(DIGEST(LOWER(TRIM('Stanescu')), 'sha256'), 'hex'),
    ENCODE(DIGEST(LOWER(TRIM('Carmen')), 'sha256'), 'hex'),
    ENCODE(DIGEST(LOWER(TRIM('+40767890123')), 'sha256'), 'hex'),
    pgp_sym_encrypt('Stanescu', 'TEST_KEY'),
    pgp_sym_encrypt('Carmen', 'TEST_KEY'),
    pgp_sym_encrypt('+40767890123', 'TEST_KEY'),
    pgp_sym_encrypt('carmen.stanescu@example.com', 'TEST_KEY')
);

\echo 'SUCCESS: 6 patient appointments inserted'
\echo ''

-- TEST 2: Insert Multiple Doctor Unavailability Blocks
\echo 'TEST 2: Inserting doctor unavailability blocks...'
\echo ''

-- Block 1: Lunch break for Dr. Maria Ionescu
INSERT INTO doctor_availability (
    cabinet_medic, start_time, end_time, reason, calendar_event_id
) VALUES (
    'Dr. Maria Ionescu',
    '2026-02-15 12:00:00',
    '2026-02-15 13:00:00',
    'Lunch Break',
    'gcal_block_001'
);

-- Block 2: Surgery time for Dr. Maria Ionescu
INSERT INTO doctor_availability (
    cabinet_medic, start_time, end_time, reason, calendar_event_id
) VALUES (
    'Dr. Maria Ionescu',
    '2026-02-15 15:00:00',
    '2026-02-15 16:00:00',
    'Complex surgery procedure',
    'gcal_block_002'
);

-- Block 3: Conference for Dr. Andrei Popescu
INSERT INTO doctor_availability (
    cabinet_medic, start_time, end_time, reason, calendar_event_id
) VALUES (
    'Dr. Andrei Popescu',
    '2026-02-15 14:00:00',
    '2026-02-15 17:00:00',
    'Medical conference attendance',
    'gcal_block_003'
);

-- Block 4: Vacation for Dr. Maria Ionescu (next week)
INSERT INTO doctor_availability (
    cabinet_medic, start_time, end_time, reason
) VALUES (
    'Dr. Maria Ionescu',
    '2026-02-20 08:00:00',
    '2026-02-22 18:00:00',
    'Vacation'
);

\echo 'SUCCESS: 4 unavailability blocks inserted'
\echo ''

-- TEST 3: Conflict Detection Query (Multiple Scenarios)
\echo 'TEST 3A: Conflict detection - Lunch time overlap'
\echo 'Scenario: Attempting to book Dr. Maria Ionescu on 2026-02-15 at 12:30-13:30'

WITH conflict_params AS (
    SELECT 
        'Dr. Maria Ionescu'::VARCHAR AS target_doctor,
        '2026-02-15'::DATE AS target_date,
        '12:30:00'::TIME AS target_start,
        '13:30:00'::TIME AS target_end
),
appointment_conflicts AS (
    SELECT COUNT(*) AS conflict_count
    FROM pacienti_programari p, conflict_params cp
    WHERE p.cabinet_medic = cp.target_doctor
      AND p.data_programare = cp.target_date
      AND p.status_confirmare != 'anulat'
      AND (cp.target_start < p.ora_final AND cp.target_end > p.ora_start)
),
availability_conflicts AS (
    SELECT COUNT(*) AS conflict_count
    FROM doctor_availability d, conflict_params cp
    WHERE d.cabinet_medic = cp.target_doctor
      AND DATE(d.start_time) = cp.target_date
      AND (cp.target_start < d.end_time::TIME AND cp.target_end > d.start_time::TIME)
)
SELECT 
    (SELECT conflict_count FROM appointment_conflicts) AS appointment_conflicts,
    (SELECT conflict_count FROM availability_conflicts) AS block_conflicts,
    (SELECT conflict_count FROM appointment_conflicts) +
    (SELECT conflict_count FROM availability_conflicts) AS total_conflicts,
    CASE 
        WHEN (SELECT conflict_count FROM appointment_conflicts) +
             (SELECT conflict_count FROM availability_conflicts) > 0 
        THEN 'CONFLICT DETECTED'
        ELSE 'Available'
    END AS status;

\echo ''
\echo 'TEST 3B: Conflict detection - Existing appointment overlap'
\echo 'Scenario: Attempting to book Dr. Maria Ionescu on 2026-02-15 at 10:00-11:00'

WITH conflict_params AS (
    SELECT 
        'Dr. Maria Ionescu'::VARCHAR AS target_doctor,
        '2026-02-15'::DATE AS target_date,
        '10:00:00'::TIME AS target_start,
        '11:00:00'::TIME AS target_end
)
SELECT 
    COUNT(*) AS conflicting_appointments,
    CASE 
        WHEN COUNT(*) > 0 THEN 'CONFLICT - Appointment exists'
        ELSE 'Available'
    END AS status
FROM pacienti_programari p, conflict_params cp
WHERE p.cabinet_medic = cp.target_doctor
  AND p.data_programare = cp.target_date
  AND p.status_confirmare != 'anulat'
  AND (cp.target_start < p.ora_final AND cp.target_end > p.ora_start);

\echo ''
\echo 'TEST 3C: Conflict detection - Available slot'
\echo 'Scenario: Attempting to book Dr. Maria Ionescu on 2026-02-15 at 11:30-12:00'

WITH conflict_params AS (
    SELECT 
        'Dr. Maria Ionescu'::VARCHAR AS target_doctor,
        '2026-02-15'::DATE AS target_date,
        '11:30:00'::TIME AS target_start,
        '12:00:00'::TIME AS target_end
),
all_conflicts AS (
    SELECT COUNT(*) AS conflict_count
    FROM (
        SELECT 1 FROM pacienti_programari p, conflict_params cp
        WHERE p.cabinet_medic = cp.target_doctor
          AND p.data_programare = cp.target_date
          AND p.status_confirmare != 'anulat'
          AND (cp.target_start < p.ora_final AND cp.target_end > p.ora_start)
        UNION ALL
        SELECT 1 FROM doctor_availability d, conflict_params cp
        WHERE d.cabinet_medic = cp.target_doctor
          AND DATE(d.start_time) = cp.target_date
          AND (cp.target_start < d.end_time::TIME AND cp.target_end > d.start_time::TIME)
    ) conflicts
)
SELECT 
    COALESCE((SELECT conflict_count FROM all_conflicts), 0) AS total_conflicts,
    CASE 
        WHEN COALESCE((SELECT conflict_count FROM all_conflicts), 0) > 0 
        THEN 'CONFLICT DETECTED'
        ELSE 'AVAILABLE - Slot is free'
    END AS status;

\echo ''

-- TEST 4: Search Multiple Patients by Different Criteria
\echo 'TEST 4A: Searching for patient by phone number (Ion Popescu)...'

SELECT 
    id,
    tally_id,
    pgp_sym_decrypt(nume, 'TEST_KEY') AS last_name,
    pgp_sym_decrypt(prenume, 'TEST_KEY') AS first_name,
    pgp_sym_decrypt(telefon, 'TEST_KEY') AS phone,
    pgp_sym_decrypt(email, 'TEST_KEY') AS email,
    data_programare,
    ora_start || ' - ' || ora_final AS time_slot,
    cabinet_medic,
    status_confirmare
FROM pacienti_programari
WHERE telefon_hash = ENCODE(DIGEST(LOWER(TRIM('+40712345678')), 'sha256'), 'hex');

\echo ''
\echo 'TEST 4B: Search by last name hash (all Ionescu patients)...'

SELECT 
    pgp_sym_decrypt(prenume, 'TEST_KEY') AS first_name,
    pgp_sym_decrypt(nume, 'TEST_KEY') AS last_name,
    pgp_sym_decrypt(telefon, 'TEST_KEY') AS phone,
    data_programare,
    tip_vizita,
    status_confirmare
FROM pacienti_programari
WHERE nume_hash = ENCODE(DIGEST(LOWER(TRIM('Ionescu')), 'sha256'), 'hex')
ORDER BY data_programare, ora_start;

\echo ''
\echo 'TEST 4C: Find patients with referrals...'

SELECT 
    pgp_sym_decrypt(prenume, 'TEST_KEY') || ' ' || pgp_sym_decrypt(nume, 'TEST_KEY') AS full_name,
    pgp_sym_decrypt(telefon, 'TEST_KEY') AS phone,
    tip_vizita,
    cabinet_medic,
    data_programare,
    CASE WHEN info_relevante IS NOT NULL 
         THEN pgp_sym_decrypt(info_relevante, 'TEST_KEY') 
         ELSE 'No notes' 
    END AS medical_notes
FROM pacienti_programari
WHERE are_trimitere = TRUE
ORDER BY data_programare;

\echo ''

-- TEST 5: Statistical Queries
\echo 'TEST 5A: Appointment statistics by doctor...'

SELECT 
    cabinet_medic,
    COUNT(*) AS total_appointments,
    SUM(CASE WHEN status_confirmare = 'confirmat' THEN 1 ELSE 0 END) AS confirmed,
    SUM(CASE WHEN status_confirmare = 'neconfirmat' THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN status_confirmare = 'anulat' THEN 1 ELSE 0 END) AS cancelled,
    SUM(CASE WHEN are_trimitere = TRUE THEN 1 ELSE 0 END) AS with_referral
FROM pacienti_programari
GROUP BY cabinet_medic
ORDER BY total_appointments DESC;

\echo ''
\echo 'TEST 5B: Daily schedule summary for 2026-02-15...'

SELECT 
    data_programare AS date,
    cabinet_medic,
    COUNT(*) AS appointments,
    MIN(ora_start) AS first_appointment,
    MAX(ora_final) AS last_appointment,
    ARRAY_AGG(tip_vizita ORDER BY ora_start) AS visit_types
FROM pacienti_programari
WHERE data_programare = '2026-02-15'
  AND status_confirmare != 'anulat'
GROUP BY data_programare, cabinet_medic
ORDER BY cabinet_medic;

\echo ''

-- TEST 6: Verify Blind Index Helper Functions
\echo 'TEST 6: Testing blind index helper functions...'

SELECT 
    'Popescu' AS original_value,
    normalize_for_hash('Popescu') AS normalized,
    create_blind_index('Popescu') AS hash_index;

SELECT 
    '  POPESCU  ' AS original_with_spaces,
    normalize_for_hash('  POPESCU  ') AS normalized,
    create_blind_index('  POPESCU  ') AS hash_index,
    create_blind_index('Popescu') = create_blind_index('  POPESCU  ') AS hashes_match;

\echo ''

-- TEST 7: List All Appointments and Blocks
\echo 'TEST 7A: All appointments for Dr. Maria Ionescu (non-cancelled)...'

SELECT 
    id,
    data_programare AS date,
    ora_start || ' - ' || ora_final AS time_slot,
    tip_vizita AS visit_type,
    status_confirmare AS status,
    LEFT(telefon_hash, 12) || '...' AS phone_hash_preview,
    CASE WHEN are_trimitere THEN 'Yes' ELSE 'No' END AS has_referral
FROM pacienti_programari
WHERE cabinet_medic = 'Dr. Maria Ionescu'
  AND status_confirmare != 'anulat'
ORDER BY data_programare, ora_start;

\echo ''
\echo 'TEST 7B: All unavailability blocks...'

SELECT 
    id,
    cabinet_medic,
    DATE(start_time) AS date,
    start_time::TIME || ' - ' || end_time::TIME AS time_range,
    EXTRACT(EPOCH FROM (end_time - start_time))/3600 AS duration_hours,
    reason,
    calendar_event_id
FROM doctor_availability
ORDER BY start_time;

\echo ''
\echo 'TEST 7C: Complete daily schedule for 2026-02-15 (appointments + blocks)...'

WITH daily_schedule AS (
    SELECT 
        'Appointment' AS event_type,
        cabinet_medic,
        data_programare::TIMESTAMP + ora_start AS start_time,
        data_programare::TIMESTAMP + ora_final AS end_time,
        tip_vizita AS description,
        status_confirmare AS status
    FROM pacienti_programari
    WHERE data_programare = '2026-02-15'
    
    UNION ALL
    
    SELECT 
        'Block' AS event_type,
        cabinet_medic,
        start_time,
        end_time,
        reason AS description,
        NULL AS status
    FROM doctor_availability
    WHERE DATE(start_time) = '2026-02-15'
)
SELECT 
    event_type,
    cabinet_medic,
    start_time::TIME AS start,
    end_time::TIME AS end,
    description,
    status
FROM daily_schedule
ORDER BY cabinet_medic, start_time;

\echo ''

-- TEST SUMMARY
\echo 'Test Operations Completed.'
\echo ''
\echo 'Database Statistics:'

SELECT 
    (SELECT COUNT(*) FROM pacienti_programari) AS total_appointments,
    (SELECT COUNT(*) FROM pacienti_programari WHERE status_confirmare = 'confirmat') AS confirmed_appointments,
    (SELECT COUNT(*) FROM doctor_availability) AS unavailability_blocks,
    (SELECT COUNT(DISTINCT cabinet_medic) FROM pacienti_programari) AS doctors_with_appointments;

\echo ''
\echo 'Verification Summary:'
\echo '✓ Multiple patient appointments with encrypted PII'
\echo '✓ Multiple unavailability blocks across doctors'
\echo '✓ Cross-table conflict detection (3 scenarios tested)'
\echo '✓ Blind index search by phone, name'
\echo '✓ Referral filtering and medical notes'
\echo '✓ Statistical aggregations by doctor'
\echo '✓ Daily schedule view with combined data'
\echo '✓ Helper functions for normalization/hashing'
\echo ''
\echo 'IMPORTANT: Replace encryption_key with actual encryption key in production.'