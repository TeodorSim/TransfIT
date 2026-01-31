# Google OAuth Setup

## 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**

## 2. Configure OAuth Consent Screen
1. Click **OAuth consent screen**
2. Select **External** user type
3. Fill in app name and support email
4. Save and continue through remaining steps

## 3. Create OAuth Client ID
1. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
2. Select **Web application**
3. Add **Authorized JavaScript origins**:
   - Development: `http://localhost:8000`
   - Production: `https://yourdomain.com`
4. Copy the **Client ID**

## 4. Update .env File
Add your Google Client ID to `.env`:
```
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

## 5. Regenerate Config
Run the generator script:
```bash
python3 generate_config.py
```

