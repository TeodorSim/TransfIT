# n8n Factory Service - Multi-Tenant SaaS Automation

Node.js service implementing the Factory Pattern for automated n8n workflow provisioning in a multi-tenant SaaS environment using Google OAuth.

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 13+ with pgcrypto
- n8n instance (Docker or hosted)
- Google Cloud OAuth credentials

### Installation

```bash
cd FactoryModel
npm install
```

### Database Setup

```bash
psql -U postgres -d your_database -f db/schema.sql
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=n8n
DB_USER=your_user
DB_PASSWORD=your_password
ENCRYPTION_KEY=generate_random_32_chars

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# n8n API
N8N_API_KEY=n8n_api_xxxxx
N8N_BASE_URL=http://n8n:5678

# Security
COOKIE_SECRET=generate_random_32_chars
```

### Usage

docker-compose build factory-service && docker-compose up -d factory-service

```bash
npm start
```

Navigate to `http://localhost:3000/auth/google?mode=test` or `http://localhost:3000/auth/google?mode=inject` to test OAuth flow.

**Result:** You'll be redirected to a success page showing:
- Email address
- Clinic ID  
- Refresh token status

This confirms OAuth login works. The n8n credential creation is disabled due to API issues.

## Architecture

### Flow

1. Clinic initiates OAuth at `/auth/google`
2. Google redirects back with authorization code
3. Backend exchanges code for refresh token
4. Backend creates n8n credential (see limitations below)
5. Backend spawns workflow from template
6. Integration data saved to PostgreSQL (encrypted)

### Project Structure

```
FactoryModel/
├── server.js                  # OAuth backend + factory trigger
├── n8nService.js              # n8n API wrapper
├── workflow_template.json     # Master workflow template
├── package.json               # Dependencies
├── .env.example               # Configuration template
├── db/
│   └── schema.sql             # PostgreSQL schema with encryption
└── README.md                  # This file
```

## Critical Limitation: n8n Credential API is Broken

### The Problem

**After extensive testing (20+ attempts), the n8n Credential API is unusable for programmatic OAuth credential creation.**

The API has schema validation issues that create impossible catch-22 scenarios:

**Errors encountered:**
```
request.body.data requires property "serverUrl"
request.body.data does not match allOf schema [subschema 1]
request/body must NOT have additional properties
```

**Root cause:**
1. The schema references `useDynamicClientRegistration` in `allOf` conditionals
2. This field is NOT in the allowed `properties` list
3. This creates impossible validation logic:
   - Without `serverUrl`: "requires property serverUrl" 
   - With `serverUrl`: "must NOT have additional properties"

**Schema inspection:**
```bash
curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_BASE_URL/api/v1/credentials/schema/oAuth2Api"
```

Shows `additionalProperties: false` with complex `allOf` rules that reference non-existent properties.

### Current Implementation Status

**What works:**
-  Google OAuth flow (CSRF protected)
-  Refresh token acquisition
-  User authentication
-  Success page showing login worked

**What's broken (n8n API issue):**
-  Programmatic credential creation
-  Automated workflow provisioning
-  True per-clinic isolation

The Factory Service currently **stops after OAuth login** and displays a success page. The credential/workflow provisioning code is commented out.

### The Solution: Manual Credential Setup

Since the API is demonstrably broken, the only working approach is:

#### Option 1: Manual Shared Credential 

1. **Create ONE shared Google OAuth credential manually in n8n UI:**
   - Open n8n → Settings → Credentials
   - Click "Add Credential" → "OAuth2 API"
   - Configure with your Google OAuth settings:
     - Grant Type: `Authorization Code`
     - Authorization URL: `https://accounts.google.com/o/oauth2/v2/auth`
     - Access Token URL: `https://oauth2.googleapis.com/token`
     - Client ID: Your Google Client ID
     - Client Secret: Your Google Client Secret
     - Scope: `https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.send`
   - Complete the OAuth flow in n8n
   - Copy the credential ID from the URL

2. **Configure environment variable:**
   ```env
   N8N_SHARED_GOOGLE_CREDENTIAL_ID=<credential_id_from_n8n>
   ```

3. **Update workflow template:**
   Replace `CREDENTIAL_ID_PLACEHOLDER` with `process.env.N8N_SHARED_GOOGLE_CREDENTIAL_ID`

4. **Modify n8nService.js:**
   Skip `createGoogleCredential()` call and use shared credential ID directly

**Pros:**
- Actually works (no API schema issues)
- Simple implementation
- One OAuth flow for all clinics

**Cons:**
- All clinics share same Google account
- Not true per-clinic isolation
- Requires manual UI setup

#### Option 2: HTTP Request Nodes 

Use generic `oAuth2Api` credentials with HTTP Request nodes instead of native Google nodes:

- Calendar API: `GET https://www.googleapis.com/calendar/v3/calendars/primary/events`
- Gmail API: `POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send`

The generic `oAuth2Api` type *may* work via API, but still has schema validation issues in practice.

## Security Features

### CSRF Protection

```javascript
const nonce = uuidv4();
res.cookie('oauth_state', nonce, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  signed: true
});
```

### Database Encryption

```sql
INSERT INTO clinic_integrations (clinic_id, google_refresh_token)
VALUES ($1, pgp_sym_encrypt($2, $3));
```

### API Key Security

All secrets loaded from environment variables, never hardcoded.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google` | Initiate OAuth flow with CSRF |
| GET | `/auth/google/callback` | OAuth callback (redirects to success page) |
| GET | `/auth/success` | Shows OAuth login success with user details |
| GET | `/auth/error` | Shows OAuth errors |
| GET | `/health` | Health check (database + n8n) |
| GET | `/api/clinics/:clinicId/integration` | Get integration status |

## Database Schema

```sql
CREATE TABLE clinic_integrations (
    clinic_id TEXT PRIMARY KEY,
    google_refresh_token BYTEA NOT NULL,  -- Encrypted with pgcrypto
    n8n_workflow_id TEXT NOT NULL,
    n8n_credential_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);
```

## Docker Integration

The service runs as a Docker container alongside n8n and PostgreSQL:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    # No exposed ports (internal only)
    
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    
  factory-service:
    build: ../../../FactoryModel
    ports:
      - "3000:3000"
    environment:
      - N8N_BASE_URL=http://n8n:5678
      - DB_HOST=postgres
```

## Troubleshooting

### "No refresh token received"

User already authorized app. Revoke access at https://myaccount.google.com/permissions and retry.

### "n8n API unreachable"

Check if n8n is running: `curl http://localhost:5678`

### "CSRF Protection: State mismatch"

Ensure cookies enabled and `COOKIE_SECRET` set in `.env`.

### "Credential creation failed"

This is the known limitation. Use shared credential approach instead.

## Production Deployment

- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (set cookie `secure: true`)
- [ ] Generate strong 32+ char secrets for `ENCRYPTION_KEY` and `COOKIE_SECRET`
- [ ] Use environment variables for all secrets
- [ ] Configure database backups
- [ ] Update `GOOGLE_REDIRECT_URI` to production domain
- [ ] Implement rate limiting on OAuth endpoints
- [ ] Set up monitoring and logging

## License

MIT
