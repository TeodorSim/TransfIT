

-- Database: artegor_clinic_db
-- Owner: admin_artegor


CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table: pacienti_programari
-- Purpose: Store patient appointments with encrypted PII and blind indices
CREATE TABLE pacienti_programari (
    id SERIAL PRIMARY KEY,
    
    tally_id VARCHAR(100) UNIQUE NOT NULL,
    calendar_event_id VARCHAR(255),
    
    data_programare DATE NOT NULL,
    ora_start TIME NOT NULL,
    ora_final TIME NOT NULL,
    tip_vizita VARCHAR(100),
    cabinet_medic VARCHAR(100) NOT NULL,
    are_trimitere BOOLEAN DEFAULT FALSE,
    status_confirmare VARCHAR(50) DEFAULT 'neconfirmat',  
    
    -- Blind indices (HASHED for searching without decryption)
    -- SHA256 hex hashes of normalized (lowercase, trimmed) values
    nume_hash VARCHAR(64) NOT NULL,                  
    prenume_hash VARCHAR(64) NOT NULL,               
    telefon_hash VARCHAR(64) NOT NULL,               
    
    -- Encrypted PII (BYTEA for maximum security)
    -- Encrypted using pgcrypto with application-provided key
    nume BYTEA NOT NULL,                           
    prenume BYTEA NOT NULL,                        
    telefon BYTEA NOT NULL,                         
    email BYTEA,                                     
    info_relevante BYTEA,                          
    alte_info_optionale BYTEA,                       
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_time_range CHECK (ora_start < ora_final),
    CONSTRAINT valid_status CHECK (status_confirmare IN ('neconfirmat', 'confirmat', 'anulat'))
);

-- Indices for performance optimization
CREATE INDEX idx_pacienti_data_programare ON pacienti_programari(data_programare);
CREATE INDEX idx_pacienti_cabinet_medic ON pacienti_programari(cabinet_medic);
CREATE INDEX idx_pacienti_telefon_hash ON pacienti_programari(telefon_hash);
CREATE INDEX idx_pacienti_nume_prenume_hash ON pacienti_programari(nume_hash, prenume_hash);
CREATE INDEX idx_pacienti_status ON pacienti_programari(status_confirmare);
CREATE INDEX idx_pacienti_calendar_event ON pacienti_programari(calendar_event_id);

-- Composite index for conflict detection queries
CREATE INDEX idx_pacienti_conflict_check ON pacienti_programari(
    cabinet_medic, 
    data_programare, 
    ora_start, 
    ora_final
) WHERE status_confirmare != 'anulat';


-- Table: doctor_availability
-- Purpose: Block off time slots when doctors are unavailable
CREATE TABLE doctor_availability (
    id SERIAL PRIMARY KEY,
    
    -- Availability information
    cabinet_medic VARCHAR(100) NOT NULL,             
    start_time TIMESTAMP NOT NULL,                  
    end_time TIMESTAMP NOT NULL,                    
    reason VARCHAR(255),                             
    calendar_event_id VARCHAR(255),                  
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_availability_range CHECK (start_time < end_time)
);

-- Indices for performance optimization
CREATE INDEX idx_availability_cabinet ON doctor_availability(cabinet_medic);
CREATE INDEX idx_availability_time_range ON doctor_availability(start_time, end_time);
CREATE INDEX idx_availability_calendar_event ON doctor_availability(calendar_event_id);

-- Composite index for conflict detection queries
CREATE INDEX idx_availability_conflict_check ON doctor_availability(
    cabinet_medic,
    start_time,
    end_time
);

-- Permissions
GRANT ALL PRIVILEGES ON TABLE pacienti_programari TO admin_artegor;
GRANT ALL PRIVILEGES ON TABLE doctor_availability TO admin_artegor;
GRANT USAGE, SELECT ON SEQUENCE pacienti_programari_id_seq TO admin_artegor;
GRANT USAGE, SELECT ON SEQUENCE doctor_availability_id_seq TO admin_artegor;


-- Function to normalize text for hashing (lowercase, trim)
CREATE OR REPLACE FUNCTION normalize_for_hash(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(TRIM(input_text));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to create SHA256 hash
CREATE OR REPLACE FUNCTION create_blind_index(input_text TEXT)
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN ENCODE(DIGEST(normalize_for_hash(input_text), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Comments for documentation
COMMENT ON TABLE pacienti_programari IS 'Patient appointments with encrypted PII and blind indices for searching';
COMMENT ON TABLE doctor_availability IS 'Doctor unavailability blocks for conflict detection';

COMMENT ON COLUMN pacienti_programari.nume_hash IS 'SHA256 hash of normalized last name for blind index searching';
COMMENT ON COLUMN pacienti_programari.prenume_hash IS 'SHA256 hash of normalized first name for blind index searching';
COMMENT ON COLUMN pacienti_programari.telefon_hash IS 'SHA256 hash of normalized phone number for blind index searching';

COMMENT ON COLUMN pacienti_programari.nume IS 'AES encrypted last name (BYTEA) - decrypt with application key';
COMMENT ON COLUMN pacienti_programari.prenume IS 'AES encrypted first name (BYTEA) - decrypt with application key';
COMMENT ON COLUMN pacienti_programari.telefon IS 'AES encrypted phone number (BYTEA) - decrypt with application key';
