#!/usr/bin/env python3
"""Generate config.js from .env file"""

def parse_env():
    config = {}
    with open('.env', 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, value = line.split('=', 1)
                value = value.strip()
                # Remove quotes
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                config[key.strip()] = value
    return config

config = parse_env()

js_content = f"""// AUTO-GENERATED from .env - DO NOT EDIT
// Run: python3 generate_config.py to regenerate

window.TransfitConfig = {{
    GOOGLE_CLIENT_ID: '{config.get('GOOGLE_CLIENT_ID', '')}',
    COOKIE_SECRET: '{config.get('COOKIE_SECRET', '')}',
    ENCRYPTION_KEY: '{config.get('ENCRYPTION_KEY', '')}',
    RSA_PUBLIC_KEY: `{config.get('RSA_PUBLIC_KEY', '')}`,
    N8N_API_KEY: '{config.get('N8N_API_KEY', '')}',
    N8N_BASE_URL: '{config.get('N8N_BASE_URL', '')}',
    SESSION_EXPIRY_DAYS: 7,
    REMEMBER_ME_DAYS: 30
}};

Object.freeze(window.TransfitConfig);
"""

with open('config.js', 'w') as f:
    f.write(js_content)

print("✅ config.js generated successfully!")
