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

    /**
     * Inițializează sistemul de autentificare Google Sign-In
     * - Verifică dacă Client ID este configurat
     * - Configurează comportamentul Google OAuth
     * - Setează callback-ul pentru procesarea răspunsului
     * @returns {Promise} - Rezolvă când inițializarea este completă
     * @throws {Error} - Dacă Client ID lipsește sau Google API nu este disponibil
     */
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

    /**
     * Inițializează clientul OAuth2 pentru accesul la Google Calendar
     * - Creează un token client pentru solicitarea permisiunilor Calendar
     * - Configurează scope-ul pentru operațiuni de calendar
     * @throws {Error} - Dacă Client ID lipsește sau OAuth client nu este disponibil
     */
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

    /**
     * Solicită permisiuni pentru accesul la Google Calendar
     * - Inițializează clientul de calendar dacă este necesar
     * - Gestionează fluxul OAuth pentru obținerea token-ului
     * - Salvează token-ul cu data de expirare în localStorage
     * @param {string} promptMode - Modul de prompt ('none', 'consent', 'select_account')
     * @returns {Promise<string>} - Access token pentru Google Calendar API
     */
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

    /**
     * Procesează răspunsul de la Google OAuth
     * - Extrage și decodează JWT token-ul
     * - Creează sesiunea utilizatorului cu informații de profil
     * - Salvează date de autentificare pentru compatibilitate legacy
     * - Redirecționează utilizatorul către homepage
     * @param {Object} response - Răspunsul de la Google cu credential JWT
     */
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

    /**
     * Decodează un JWT (JSON Web Token) și extrage payload-ul
     * - Separă token-ul în părți (header, payload, signature)
     * - Decodează payload-ul din Base64URL
     * - Parsează JSON-ul pentru a obține datele utilizatorului
     * @param {string} token - Token-ul JWT de la Google
     * @returns {Object|null} - Datele decodate sau null în caz de eroare
     */
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

    /**
     * Salvează sesiunea utilizatorului în localStorage și cookies criptate
     * - Serializează datele sesiunii în JSON
     * - Stochează în localStorage pentru acces rapid
     * - Criptează datele cu AES-GCM pentru cookie-uri securizate
     * - Semnează datele cu HMAC pentru integritate
     * @param {Object} sessionData - Datele sesiunii (user, token, expirare)
     */
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

    /**
     * Recuperează sesiunea curentă din localStorage sau cookies
     * - Caută mai întâi în localStorage pentru performanță
     * - Fallback la cookies criptate dacă localStorage este gol
     * - Verifică integritatea și decriptează datele
     * - Validează expirarea sesiunii
     * @returns {Object|null} - Datele sesiunii sau null dacă nu există/a expirat
     */
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

    /**
     * Semnează datele folosind HMAC-SHA256 pentru integritate
     * - Previne modificarea neautorizată a datelor
     * - Folosește un secret configurat sau default
     * - Returnează datele cu semnătura atașată
     * @param {string} data - Datele de semnat
     * @returns {string} - Datele + semnătura în format "data.signature"
     */
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

    /**
     * Verifică integritatea datelor semnate cu HMAC
     * - Separă datele de semnătură
     * - Recalculează semnătura și o compară cu cea primită
     * - Returnează datele doar dacă semnătura este validă
     * @param {string} signedData - Datele semnate în format "data.signature"
     * @returns {string|null} - Datele originale sau null dacă semnătura este invalidă
     */
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

    /**
     * Criptează datele folosind AES-GCM pentru confidențialitate
     * - Generează un IV (Initialization Vector) aleatoriu
     * - Criptează datele cu o cheie derivată din secret
     * - Combină IV-ul cu datele criptate pentru decriptare ulterioară
     * @param {string} data - Datele de criptat
     * @returns {string} - Datele criptate în format Base64
     */
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

    /**
     * Decriptează datele criptate cu AES-GCM
     * - Extrage IV-ul din datele criptate
     * - Decriptează folosind cheia derivată din secret
     * - Returnează datele originale în format text
     * @param {string} encryptedData - Datele criptate în format Base64
     * @returns {string} - Datele decriptate sau datele originale în caz de eroare
     */
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

    /**
     * Protejează o pagină verificând autentificarea utilizatorului
     * - Verifică existența și validitatea sesiunii
     * - Redirecționează către login dacă utilizatorul nu este autentificat
     * - Folosit pe paginile care necesită autentificare (Homepage, etc.)
     * @returns {boolean} - true dacă utilizatorul este autentificat, false altfel
     */
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

    /**
     * Autentifică utilizatorul cu email și parolă
     * - Trimite cerere de autentificare către backend (sau simulare)
     * - Creează sesiune la autentificare reușită
     * - Salvează datele în localStorage și cookies
     * @param {string} email - Email-ul sau username-ul utilizatorului
     * @param {string} password - Parola utilizatorului
     * @returns {Object} - {success: true} la succes
     * @throws {Error} - Dacă autentificarea eșuează
     */
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
