require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const n8nService = require('./n8nService');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'your-secret-key-change-in-production'));


const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'transfit',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('error', (err) => {
  console.error('[Database] Unexpected error on idle client:', err);
  process.exit(-1);
});


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('SECURITY ERROR: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set');
}

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Required scopes for Google Calendar and Gmail
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.send',
];

/**
 * Initiate OAuth flow with CSRF protection.
 * Query params:
 *   ?mode=test     - Just test OAuth login, skip n8n injection
 *   ?mode=inject   - Attempt n8n credential injection (default)
 */
app.get('/auth/google', (req, res) => {
  try {
    const mode = req.query.mode || 'inject'; // 'test' or 'inject'
    
    // Generate random nonce for CSRF protection
    const nonce = uuidv4();
    
    // Store nonce AND mode in secure cookie
    res.cookie('oauth_state', nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
      signed: true
    });
    
    res.cookie('oauth_mode', mode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
      signed: true
    });

    // Build the OAuth URL with state parameter
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: nonce,
      prompt: 'consent'
    });

    console.log(`[OAuth] Initiating OAuth flow (mode: ${mode}) with nonce:`, nonce);
    res.redirect(authUrl);

  } catch (error) {
    console.error('[OAuth] ERROR: Failed to initiate OAuth flow:', error.message);
    res.status(500).json({ error: 'Failed to initiate authentication' });
  }
});

/**
 * OAuth callback - validates CSRF and provisions n8n workflow.
 */
app.get('/auth/google/callback', async (req, res) => {
  const client = await pool.connect();
  
  try {
    // SECURITY: Anti-CSRF Validation
    const { code, state } = req.query;
    const storedNonce = req.signedCookies.oauth_state;

    if (!state || !storedNonce) {
      throw new Error('CSRF Protection: Missing state or cookie');
    }

    if (state !== storedNonce) {
      throw new Error('CSRF Protection: State mismatch - possible CSRF attack');
    }

    console.log('[OAuth] CSRF validation passed');

    // Get the mode from cookie BEFORE clearing
    const mode = req.signedCookies.oauth_mode || 'inject';
    console.log('[OAuth] Mode from cookie:', mode);

    // Clear cookies
    res.clearCookie('oauth_state');
    res.clearCookie('oauth_mode');

    // Step 2: Exchange Authorization Code for Tokens
    console.log('[OAuth] Exchanging authorization code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.refresh_token) {
      throw new Error('No refresh token received. User may have already authorized this app.');
    }

    const { access_token, refresh_token } = tokens;
    console.log('[OAuth] Received refresh token');

    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    const userEmail = userInfo.data.email;
    const clinicId = `clinic_${userEmail.split('@')[0]}`;
    
    console.log('[OAuth] User authenticated:', userEmail);
    console.log('[OAuth] Clinic ID:', clinicId);
    console.log('[OAuth] Processing in mode:', mode);

    // Check mode: test or inject
    if (mode === 'test') {
      console.log('[OAuth] TEST MODE - Skipping n8n credential injection');
      res.redirect(`/auth/success?email=${encodeURIComponent(userEmail)}&clinicId=${encodeURIComponent(clinicId)}&hasRefreshToken=true&mode=test`);
      return;
    }

    // Mode: inject - attempt n8n credential creation
    console.log('[Factory] INJECT MODE - Attempting credential injection...');
    
    try {
      const credentialId = await n8nService.createGoogleCredential(
        clinicId,
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        refresh_token
      );

      const workflowId = await n8nService.spawnWorkflow(clinicId, credentialId);
      console.log('[Factory] Provisioning complete');

      const encryptionKey = process.env.ENCRYPTION_KEY;
      if (!encryptionKey) {
        throw new Error('ENCRYPTION_KEY not set in environment variables');
      }

      await client.query(`
        INSERT INTO clinic_integrations (
          clinic_id,
          google_refresh_token,
          n8n_workflow_id,
          n8n_credential_id,
          status
        )
        VALUES ($1, pgp_sym_encrypt($2, $3), $4, $5, 'active')
        ON CONFLICT (clinic_id)
        DO UPDATE SET
          google_refresh_token = pgp_sym_encrypt($2, $3),
          n8n_workflow_id = $4,
          n8n_credential_id = $5,
          last_synced_at = CURRENT_TIMESTAMP,
          status = 'active'
      `, [clinicId, refresh_token, encryptionKey, workflowId, credentialId]);

      console.log('[Database] Saved clinic integration');

      res.redirect(`/auth/success?email=${encodeURIComponent(userEmail)}&clinicId=${encodeURIComponent(clinicId)}&workflowId=${workflowId}&credentialId=${credentialId}&mode=inject`);

    } catch (factoryError) {
      // Factory provisioning failed, but OAuth worked
      console.error('[Factory] Provisioning failed:', factoryError.message);
      res.redirect(`/auth/success?email=${encodeURIComponent(userEmail)}&clinicId=${encodeURIComponent(clinicId)}&hasRefreshToken=true&factoryError=${encodeURIComponent(factoryError.message)}&mode=inject`);
    }

  } catch (error) {
    console.error('[OAuth Callback] ERROR:', error.message);
    res.redirect(`/auth/error?message=${encodeURIComponent(error.message)}`);
  } finally {
    client.release();
  }
});

app.get('/auth/success', (req, res) => {
  const { email, clinicId, hasRefreshToken, workflowId, credentialId, factoryError, mode } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Success</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .note { color: #6c757d; font-size: 14px; margin-top: 20px; }
        .mode { background: #e7f3ff; padding: 10px; border-left: 4px solid #0066cc; margin: 15px 0; }
      </style>
    </head>
    <body>
      <h1 class="success">✓ OAuth Login Successful</h1>
      
      ${mode ? `<div class="mode"><strong>Mode:</strong> ${mode === 'test' ? 'TEST (Login Only)' : 'INJECT (Attempt n8n Credential Creation)'}</div>` : ''}
      
      <div class="info">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Clinic ID:</strong> ${clinicId}</p>
        <p><strong>Refresh Token:</strong> ${hasRefreshToken === 'true' ? 'Obtained' : 'Not available'}</p>
        ${workflowId ? `<p><strong>Workflow ID:</strong> ${workflowId}</p>` : ''}
        ${credentialId ? `<p><strong>Credential ID:</strong> ${credentialId}</p>` : ''}
      </div>
      
      ${factoryError ? `
        <div class="warning">
          <h3>⚠ Factory Provisioning Failed</h3>
          <p>${factoryError}</p>
        </div>
      ` : workflowId ? `
        <p class="success">✓ n8n workflow provisioned successfully!</p>
      ` : mode === 'test' ? `
        <p>OAuth login tested successfully. n8n credential injection skipped.</p>
      ` : ''}
      
      <div class="note">
        <p><strong>Test modes:</strong></p>
        <ul>
          <li><a href="/auth/google?mode=test">Test Mode</a> - Only test OAuth login (skip n8n injection)</li>
          <li><a href="/auth/google?mode=inject">Inject Mode</a> - Attempt n8n credential creation</li>
        </ul>
      </div>
      
      <p><a href="http://localhost:5678">Open n8n</a></p>
    </body>
    </html>
  `);
});

app.get('/auth/error', (req, res) => {
  const { message } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Error</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .error { color: #dc3545; }
        .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1 class="error">✗ OAuth Error</h1>
      <div class="info">
        <p><strong>Error:</strong> ${message || 'Unknown error'}</p>
      </div>
      <p><a href="/auth/google">Try again</a></p>
    </body>
    </html>
  `);
});

app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT NOW()');
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      n8n: process.env.N8N_BASE_URL
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

app.get('/api/clinics/:clinicId/integration', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { clinicId } = req.params;
    
    const result = await client.query(`
      SELECT 
        clinic_id,
        n8n_workflow_id,
        n8n_credential_id,
        created_at,
        last_synced_at,
        status
      FROM clinic_integrations
      WHERE clinic_id = $1
    `, [clinicId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Clinic integration not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('[API] ERROR:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`n8n Factory Service running on port ${PORT}`);
  console.log(`OAuth Initiate: http://localhost:${PORT}/auth/google`);
  console.log(`OAuth Callback: ${GOOGLE_REDIRECT_URI}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received, closing HTTP server...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Server] SIGINT received, closing HTTP server...');
  await pool.end();
  process.exit(0);
});
