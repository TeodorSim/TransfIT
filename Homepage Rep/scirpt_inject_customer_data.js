async function fetchUserFormLinksViaEmail() {
    try {
        const defaultLinks = {
        programare: 'https://tally.so/r/vGDVKQ',
        disponibilitate: 'https://tally.so/r/vGDVKQ',
        delete: 'https://transfit.site/n8n/webhook/default-delete',
        reprogramate: 'https://transfit.site/n8n/webhook/default-reprogramare',
        search: 'https://transfit.site/n8n/webhook/default-search'
    };
        // 1. Get the secure session from AuthManager (verifies HMAC/Expiry)
        const session = await window.authManager.getSession();
        
        // 2. Extract the email from the verified session object
        const email = session?.user?.email || '';
        if (email) {
            const resposne = await fetch(`/auth/api/form-links?email=${encodeURIComponent(email)}`, {
                method: 'GET',
                credentials: 'include'
            });
                // Handle 401 or other errors
            if (!response.ok) {
                console.warn(`Backend returned ${response.status}. Using defaults.`);
                return defaultLinks;
            }

            const data = await response.json();
            // 3. Map the backend data to your local object structure
            return {
                programare: data?.Tally?.programare || defaultLinks.programare,
                disponibilitate: data?.Tally?.disponibilitate || defaultLinks.disponibilitate,
                delete: data?.N8N?.delete || defaultLinks.delete,
                reprogramate: data?.N8N?.reprogramate || defaultLinks.reprogramate,
                search: data?.N8N?.search || defaultLinks.search
            };
            }
    } catch (error) {
    console.warn("Secure link fetch failed, falling back to defaults:", error);
    }
}