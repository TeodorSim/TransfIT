const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';

if (!N8N_API_KEY) {
  throw new Error('SECURITY ERROR: N8N_API_KEY must be set in environment variables');
}

/**
 * Axios instance configured for n8n API
 */
const n8nClient = axios.create({
  baseURL: N8N_BASE_URL,
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000 // 30 second timeout
});

/**
 * Creates a generic OAuth2 credential in n8n.
 * Note: Native Google credential API is broken, using generic oAuth2Api instead.
 */
async function createGoogleCredential(clinicId, clientId, clientSecret, refreshToken) {
  try {
    console.log(`[n8nService] Creating Generic OAuth2 credential for clinic: ${clinicId}`);

    const credentialData = {
      name: `Google OAuth2 - Clinic ${clinicId}`,
      type: 'oAuth2Api',
      data: {  
        grantType: 'authorizationCode',
        serverUrl: 'https://www.googleapis.com',
        authQueryParameters: '',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        accessTokenUrl: 'https://oauth2.googleapis.com/token',
        clientId: clientId,
        clientSecret: clientSecret,
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.send',
        authentication: 'body',
        oauthTokenData: JSON.stringify({
          refresh_token: refreshToken,
          token_type: 'Bearer'
        })
      }
    };

    console.log(`[n8nService] Creating OAuth2 credential with refresh token`);
    const response = await n8nClient.post('/api/v1/credentials', credentialData);

    if (!response.data || !response.data.id) {
      throw new Error('n8n API returned invalid response: missing credential ID');
    }

    const credentialId = response.data.id;
    console.log(`[n8nService] Created credential ID: ${credentialId}`);

    return credentialId;

  } catch (error) {
    console.error(`[n8nService] ERROR: Failed to create credential for clinic ${clinicId}`);
    
    if (error.response) {
      // n8n API returned an error response
      console.error(`[n8nService] n8n API Error: ${error.response.status}`);
      console.error(`[n8nService] Response:`, JSON.stringify(error.response.data, null, 2));
      throw new Error(`n8n API Error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // Request was made but no response received
      console.error(`[n8nService] No response from n8n API. Is n8n running at ${N8N_BASE_URL}?`);
      throw new Error(`n8n API unreachable at ${N8N_BASE_URL}`);
    } else {
      // Something else happened
      console.error(`[n8nService] Error:`, error.message);
      throw error;
    }
  }
}

/**
 * Spawns a new n8n workflow from template with injected credential.
 */
async function spawnWorkflow(clinicId, credentialId) {
  try {
    console.log(`[n8nService] Spawning workflow for clinic: ${clinicId}`);

    // Step 1: Load the workflow template
    const templatePath = path.join(__dirname, 'workflow_template.json');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    if (!templateContent) {
      throw new Error('Workflow template is empty');
    }

    // Step 2: Parse and inject the credential ID
    const workflowTemplate = JSON.parse(templateContent);
    
    // Replace the placeholder with the actual credential ID
    const workflowJson = JSON.stringify(workflowTemplate).replace(
      /CREDENTIAL_ID_PLACEHOLDER/g,
      credentialId
    );
    
    const workflowData = JSON.parse(workflowJson);

    // Step 3: Customize the workflow name
    workflowData.name = `Clinic Workflow - ${clinicId}`;
    
    // Step 4: Ensure workflow is set to active
    workflowData.active = true;

    // Step 5: Create the workflow in n8n
    console.log(`[n8nService] Calling n8n API to create workflow...`);
    const response = await n8nClient.post('/api/v1/workflows', workflowData);

    if (!response.data || !response.data.id) {
      throw new Error('n8n API returned invalid response: missing workflow ID');
    }

    const workflowId = response.data.id;
    console.log(`[n8nService] ✓ Created and activated workflow ID: ${workflowId}`);

    return workflowId;

  } catch (error) {
    console.error(`[n8nService] ERROR: Failed to spawn workflow for clinic ${clinicId}`);
    
    if (error.response) {
      console.error(`[n8nService] n8n API Error: ${error.response.status}`);
      console.error(`[n8nService] Response:`, JSON.stringify(error.response.data, null, 2));
      throw new Error(`n8n API Error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    } else if (error.code === 'ENOENT') {
      console.error(`[n8nService] Template file not found at: ${error.path}`);
      throw new Error('Workflow template file not found. Ensure workflow_template.json exists.');
    } else if (error instanceof SyntaxError) {
      console.error(`[n8nService] Invalid JSON in workflow template`);
      throw new Error('Workflow template contains invalid JSON');
    } else if (error.request) {
      console.error(`[n8nService] No response from n8n API. Is n8n running at ${N8N_BASE_URL}?`);
      throw new Error(`n8n API unreachable at ${N8N_BASE_URL}`);
    } else {
      console.error(`[n8nService] Error:`, error.message);
      throw error;
    }
  }
}

async function deleteWorkflow(workflowId) {
  try {
    console.log(`[n8nService] Deleting workflow: ${workflowId}`);
    await n8nClient.delete(`/api/v1/workflows/${workflowId}`);
    console.log(`[n8nService] Deleted workflow ID: ${workflowId}`);
    return true;
  } catch (error) {
    console.error(`[n8nService] ERROR: Failed to delete workflow ${workflowId}:`, error.message);
    throw error;
  }
}

async function deleteCredential(credentialId) {
  try {
    console.log(`[n8nService] Deleting credential: ${credentialId}`);
    await n8nClient.delete(`/api/v1/credentials/${credentialId}`);
    console.log(`[n8nService] Deleted credential ID: ${credentialId}`);
    return true;
  } catch (error) {
    console.error(`[n8nService] ERROR: Failed to delete credential ${credentialId}:`, error.message);
    throw error;
  }
}

module.exports = {
  createGoogleCredential,
  spawnWorkflow,
  deleteWorkflow,
  deleteCredential
};
