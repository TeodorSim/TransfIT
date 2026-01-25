-- This table stores the n8n integration metadata for each clinic.
-- Security: Uses pgcrypto for symmetric encryption of sensitive tokens.==

-- Enable Encryption Extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the Clinic Integrations Table
CREATE TABLE IF NOT EXISTS clinic_integrations (
    -- Primary Key: Clinic Identifier (Text, Unique)
    clinic_id TEXT PRIMARY KEY,
    
    -- Encrypted Refresh Token (BYTEA for encrypted storage)
    -- Use pgp_sym_encrypt() to store, pgp_sym_decrypt() to retrieve
    google_refresh_token BYTEA NOT NULL,
    
    -- n8n Workflow ID (returned from POST /workflows)
    n8n_workflow_id TEXT NOT NULL,
    
    -- n8n Credential ID (returned from POST /credentials)
    n8n_credential_id TEXT NOT NULL,
    
    -- Timestamp when the integration was created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Optional: Last sync timestamp for monitoring
    last_synced_at TIMESTAMP,
    
    -- Optional: Status for lifecycle management
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'error'))
);

-- Create Index for Performance
CREATE INDEX IF NOT EXISTS idx_clinic_integrations_status 
    ON clinic_integrations(status);

CREATE INDEX IF NOT EXISTS idx_clinic_integrations_created_at 
    ON clinic_integrations(created_at DESC);


-- EXAMPLE: How to Insert Data (with Encryption)
-- INSERT INTO clinic_integrations (
--     clinic_id, 
--     google_refresh_token, 
--     n8n_workflow_id, 
--     n8n_credential_id
-- )
-- VALUES (
--     'clinic_12345',
--     pgp_sym_encrypt('1//refresh_token_here', $env.ENCRYPTION_KEY),
--     'n8n_workflow_67890',
--     'n8n_cred_11111'
-- );

-- EXAMPLE: How to Query Encrypted Data
-- SELECT 
--     clinic_id,
--     pgp_sym_decrypt(google_refresh_token, $env.ENCRYPTION_KEY) as refresh_token,
--     n8n_workflow_id,
--     n8n_credential_id,
--     created_at
-- FROM clinic_integrations
-- WHERE clinic_id = 'clinic_12345';

-- EXAMPLE: Update Last Sync Timestamp
-- UPDATE clinic_integrations 
-- SET last_synced_at = CURRENT_TIMESTAMP 
-- WHERE clinic_id = 'clinic_12345';
