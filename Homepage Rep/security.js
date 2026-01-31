async function encryptRSA(plaintext) {
    // Get RSA public key from config (loaded from .env)
    const config = window.TransfitConfig || {};
    let PUBLIC_KEY = config.RSA_PUBLIC_KEY;
    
    // Fallback to hardcoded key if config not loaded
    if (!PUBLIC_KEY || PUBLIC_KEY.includes('"-----BEGIN')) {
        PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuZaQGlROpQBAgx857/5I
zScw+GYx/5KX5fOFaP/lLYvzP9rrIJ3hKukCx1TkDcun1lxySXyBGXSubwFEAJer
iz6pANRSDxmeqyZwSfdQv/o/z0SZ8uaosiVh12I24kzRxDQxslZfTRINqXO0V2Zd
7zJGR4wHIIsJeoCpuMJ5cXf3kpwJP2Eu6jHCHhKAmUMyJFAr6blm96ScWb6j930c
2ss0lzmE4B5pF22bG4UHw+f4ssesS5UXr+4IGUmIgvLm2jTcgVYySrV4zoEJJpWI
GHAEmlzZTPm1Xe0C4K0Oc9pw4BI7AeVvSa0wjKAdspsf3SRRj2BnSRk+rg+QvizV
TQIDAQAB
-----END PUBLIC KEY-----`;
    }
    
    // 1. Clean the PEM string and convert to ArrayBuffer
    const pemContents = PUBLIC_KEY
        .replace(/-----BEGIN PUBLIC KEY-----/g, '')
        .replace(/-----END PUBLIC KEY-----/g, '')
        .replace(/\s/g, '');
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    // 2. Import the key for RSA-OAEP
    const publicKey = await crypto.subtle.importKey(
        "spki",
        binaryDer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["encrypt"]
    );

    // 3. Encrypt using OAEP
    const encoded = new TextEncoder().encode(plaintext);
    const encrypted = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        encoded
    );

    // 4. Return as Base64
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}