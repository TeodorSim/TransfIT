// Authentication and Session Management with Google OAuth
// Handles login, session persistence with encrypted cookies

class AuthManager {
    constructor() {
        this.SESSION_KEY = 'transfit_session';
        this.SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000;
        this.CALENDAR_TOKEN_KEY = 'transfit_google_calendar_token';
        this.config = window.TransfitConfig || {};
        this.calendarTokenClient = null;
    }

    // Initialize Google Sign-In
    async initGoogleAuth() {
        const clientId = this.config.GOOGLE_CLIENT_ID;
        
        if (!clientId) {
            throw new Error('Google Client ID not configured in .env');
        }
        
        return new Promise((resolve, reject) => {
            if (!window.google) {
                reject(new Error('Google API not loaded'));
                return;
            }

            google.accounts.id.initialize({
                client_id: clientId,
                callback: (response) => this.handleGoogleResponse(response),
                auto_select: false,
                cancel_on_tap_outside: true
            });

            resolve();
        });
    }

    initGoogleCalendarClient() {
        const clientId = this.config.GOOGLE_CLIENT_ID;

        if (!clientId) {
            throw new Error('Google Client ID not configured in .env');
        }

        if (!window.google?.accounts?.oauth2) {
            throw new Error('Google OAuth client not loaded');
        }

        if (!this.calendarTokenClient) {
            this.calendarTokenClient = google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'https://www.googleapis.com/auth/calendar',
                callback: () => {}
            });
        }
    }

    getGoogleCalendarToken() {
        const tokenStr = localStorage.getItem(this.CALENDAR_TOKEN_KEY);
        if (!tokenStr) return null;

        try {
            const tokenData = JSON.parse(tokenStr);
            if (tokenData.expires_at && Date.now() > tokenData.expires_at) {
                localStorage.removeItem(this.CALENDAR_TOKEN_KEY);
                return null;
            }
            return tokenData.access_token;
        } catch (error) {
            console.error('Error parsing calendar token:', error);
            localStorage.removeItem(this.CALENDAR_TOKEN_KEY);
            return null;
        }
    }

    requestGoogleCalendarAccess(promptMode = 'none') {
        return new Promise((resolve, reject) => {
            try {
                this.initGoogleCalendarClient();

                this.calendarTokenClient.callback = (response) => {
                    if (response?.error) {
                        reject(new Error(response.error));
                        return;
                    }

                    const tokenData = {
                        access_token: response.access_token,
                        expires_in: response.expires_in,
                        expires_at: Date.now() + (response.expires_in * 1000)
                    };

                    localStorage.setItem(this.CALENDAR_TOKEN_KEY, JSON.stringify(tokenData));
                    resolve(tokenData.access_token);
                };

                this.calendarTokenClient.requestAccessToken({ prompt: promptMode });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Render Google Sign-In button
    renderGoogleButton(elementId) {
        if (!window.google) {
            console.error('Google API not loaded');
            return;
        }

        google.accounts.id.renderButton(
            document.getElementById(elementId),
            {
                theme: 'outline',
                size: 'large',
                width: '100%',
                text: 'signin_with',
                locale: 'ro'
            }
        );
    }

    // Handle Google OAuth response
    async handleGoogleResponse(response) {
        try {
            const credential = response?.credential;
            if (!credential) {
                throw new Error('Missing Google credential');
            }

            const userInfo = this.parseJwt(credential) || {};
            
            const sessionData = {
                token: credential,
                user: {
                    id: userInfo.sub || 'google-user',
                    email: userInfo.email || 'unknown@google.com',
                    name: userInfo.name || 'Utilizator Google',
                    picture: userInfo.picture || ''
                },
                loginTime: Date.now(),
                expiresAt: Date.now() + this.SESSION_EXPIRY,
                provider: 'google'
            };

            await this.saveSession(sessionData);

            try {
                const legacyAuth = {
                    username: sessionData.user.email || sessionData.user.name || 'Utilizator',
                    authType: 'google',
                    loginTime: sessionData.loginTime,
                    expiresAt: sessionData.expiresAt
                };
                localStorage.setItem('transfit_auth', JSON.stringify(legacyAuth));
            } catch (e) {
                console.warn('Could not store legacy auth data:', e);
            }
            
            if (window.FormUtils) {
                FormUtils.showNotification('Conectare reușită cu Google!', 'success');
            }

            setTimeout(() => {
                window.location.href = '../Homepage Rep/Homepage.html';
            }, 1000);

        } catch (error) {
            console.error('Google auth error:', error);
            if (window.FormUtils) {
                FormUtils.showNotification('Eroare la conectarea cu Google', 'error');
            }
        }
    }

    // Parse JWT token
    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error parsing JWT:', error);
            return null;
        }
    }

    // Save session with encryption
    async saveSession(sessionData) {
        try {
            const sessionJson = JSON.stringify(sessionData);
            localStorage.setItem(this.SESSION_KEY, sessionJson);
            
            // Encrypt for cookie
            const encrypted = await this.encryptData(sessionJson);
            const signed = await this.signData(encrypted);
            this.setCookie(this.SESSION_KEY, signed, 7);
        } catch (error) {
            console.error('Error saving session:', error);
        }
    }

    // Get current session
    async getSession() {
        try {
            let sessionData = localStorage.getItem(this.SESSION_KEY);
            
            if (!sessionData) {
                const signedCookie = this.getCookie(this.SESSION_KEY);
                if (signedCookie) {
                    const encrypted = await this.verifySignedData(signedCookie);
                    if (encrypted) {
                        sessionData = await this.decryptData(encrypted);
                    }
                }
            }
            
            if (!sessionData) return null;
            
            const session = JSON.parse(sessionData);
            
            if (session.expiresAt && Date.now() > session.expiresAt) {
                this.clearSession();
                return null;
            }
            
            return session;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }

    // HMAC signing
    async signData(data) {
        const secret = this.config.COOKIE_SECRET || 'default-secret';
        const encoder = new TextEncoder();
        
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
        const signatureHex = Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        return `${data}.${signatureHex}`;
    }

    // Verify signed data
    async verifySignedData(signedData) {
        const parts = signedData.split('.');
        if (parts.length !== 2) return null;
        
        const [data, receivedSignature] = parts;
        const expectedSigned = await this.signData(data);
        const expectedSignature = expectedSigned.split('.')[1];
        
        if (receivedSignature === expectedSignature) {
            return data;
        }
        return null;
    }

    async getAesKeyFromSecret(secret) {
        const encoder = new TextEncoder();
        const secretBytes = encoder.encode(secret || 'default-key');
        const hash = await crypto.subtle.digest('SHA-256', secretBytes);
        return crypto.subtle.importKey(
            'raw',
            hash,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // AES-GCM encryption
    async encryptData(data) {
        try {
            const key = this.config.ENCRYPTION_KEY || 'default-key';
            const encoder = new TextEncoder();
            const cryptoKey = await this.getAesKeyFromSecret(key);
            
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                cryptoKey,
                encoder.encode(data)
            );
            
            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encrypted), iv.length);
            
            return btoa(String.fromCharCode(...combined));
        } catch (error) {
            console.error('Encryption error:', error);
            return data;
        }
    }

    // AES-GCM decryption
    async decryptData(encryptedData) {
        try {
            const key = this.config.ENCRYPTION_KEY || 'default-key';
            
            const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
            const iv = combined.slice(0, 12);
            const encrypted = combined.slice(12);
            
            const cryptoKey = await this.getAesKeyFromSecret(key);
            
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                cryptoKey,
                encrypted
            );
            
            return new TextDecoder().decode(decrypted);
        } catch (error) {
            console.error('Decryption error:', error);
            return encryptedData;
        }
    }

    async isAuthenticated() {
        const session = await this.getSession();
        return session !== null;
    }

    async getCurrentUser() {
        const session = await this.getSession();
        return session ? session.user : null;
    }

    clearSession() {
        localStorage.removeItem(this.SESSION_KEY);
        this.deleteCookie(this.SESSION_KEY);
        if (window.google && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
        }
    }

    logout() {
        this.clearSession();
        window.location.href = '../Start/Login.html';
    }

    async protectPage() {
        const isAuth = await this.isAuthenticated();
        if (!isAuth) {
            window.location.href = '../Start/Login.html';
            return false;
        }
        return true;
    }

    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }

    async login(email, password) {
        try {
            const response = await FormUtils.simulateLogin(email, password);
            
            if (response.success) {
                const sessionData = {
                    user: response.user,
                    loginTime: Date.now(),
                    expiresAt: Date.now() + this.SESSION_EXPIRY,
                    provider: 'email'
                };
                
                await this.saveSession(sessionData);
                return { success: true };
            }
        } catch (error) {
            throw error;
        }
    }

    async extendSession(rememberMe) {
        const session = await this.getSession();
        if (session) {
            const days = rememberMe ? 
                (this.config.REMEMBER_ME_DAYS || 30) : 
                (this.config.SESSION_EXPIRY_DAYS || 7);
            
            session.expiresAt = Date.now() + (days * 24 * 60 * 60 * 1000);
            await this.saveSession(session);
        }
    }
}

window.authManager = new AuthManager();
