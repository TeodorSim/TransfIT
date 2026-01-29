-- Secure encryption functions that hide the key from n8n workflows
-- The key is stored in PostgreSQL and never exposed to n8n

-- Create a secure schema for encryption functions
CREATE SCHEMA IF NOT EXISTS secure;

-- Function to get encryption key (SECURITY DEFINER = runs with creator's permissions)
CREATE OR REPLACE FUNCTION secure.get_encryption_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- In production, retrieve from pg_settings, secrets manager, or vault
    -- For now, return from environment variable set during container init
    RETURN current_setting('app.encryption_key', true);
END;
$$;

-- Wrapper functions for encryption that use the secure key
CREATE OR REPLACE FUNCTION secure.encrypt_text(plaintext TEXT)
RETURNS BYTEA
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF plaintext IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN pgp_sym_encrypt(plaintext, secure.get_encryption_key());
END;
$$;

CREATE OR REPLACE FUNCTION secure.decrypt_text(ciphertext BYTEA)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF ciphertext IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN pgp_sym_decrypt(ciphertext, secure.get_encryption_key());
END;
$$;

-- Grant execute permissions to application user
GRANT USAGE ON SCHEMA secure TO admin_artegor;
GRANT EXECUTE ON FUNCTION secure.encrypt_text(TEXT) TO admin_artegor;
GRANT EXECUTE ON FUNCTION secure.decrypt_text(BYTEA) TO admin_artegor;

-- Revoke access to get_encryption_key function (internal use only)
REVOKE ALL ON FUNCTION secure.get_encryption_key() FROM PUBLIC;


-- Test the functions
DO $$
DECLARE
    test_encrypted BYTEA;
    test_decrypted TEXT;
BEGIN
    test_encrypted := secure.encrypt_text('Test Patient Name');
    test_decrypted := secure.decrypt_text(test_encrypted);
    
    IF test_decrypted = 'Test Patient Name' THEN
        RAISE NOTICE 'Encryption test PASSED';
    ELSE
        RAISE EXCEPTION 'Encryption test FAILED';
    END IF;
END;
$$;

COMMENT ON SCHEMA secure IS 'Secure encryption functions that hide encryption keys from application layer';
COMMENT ON FUNCTION secure.encrypt_text IS 'Encrypts text using securely stored key - safe to call from n8n workflows';
COMMENT ON FUNCTION secure.decrypt_text IS 'Decrypts text using securely stored key - safe to call from n8n workflows';
