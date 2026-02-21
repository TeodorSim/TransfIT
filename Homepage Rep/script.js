// TransfIT Homepage - Funcționalități Card-uri
console.log('Homepage script version: 2026-02-03-1');
// Acest fișier conține gestionarea interacțiunilor cu card-urile de pe pagina principală

class HomepageManager {
    /**
     * Constructorul clasei HomepageManager
     * - Inițializează referințele către elementele de navigare
    * - Pregătește interfața și listener-ele
     */
    constructor() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.init();
    }

    /**
     * Inițializează toate componentele homepage-ului
     * - Configurează event listeners pentru navigare
     * - Setează funcționalitatea de logout
     * - Afișează informațiile utilizatorului autentificat
     */
    init() {
        this.setupNavListeners();
        this.setupLogoutButton();
        this.displayUserInfo();
        console.log('Homepage Manager initialized');
    }

    setupNavListeners() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavClick(e));
        });
    }

    handleNavClick(e) {
        e.preventDefault();
        const navItem = e.currentTarget;
        const action = navItem.getAttribute('data-action');
        
        // Actualizează clasa active
        this.navItems.forEach(item => item.classList.remove('active'));
        navItem.classList.add('active');
        
        console.log(`Nav clicked: ${action}`);
        
        // Tratează acțiunea
        this.handleAction(action);
    }

    /**
     * Distribuie acțiunile din sidebar către handler-ele corespunzătoare
     * @param {string} action - Numele acțiunii (dashboard, programare, stergere)
     */
    handleAction(action) {
        // Switch pentru diferite acțiuni
        switch(action) {
            case 'dashboard':
                this.handleDashboard();
                break;
            case 'programare':
                this.handleProgramare();
                break;
            case 'stergere':
                this.handleStergere();
                break;
            case 'reprogramari':
                this.handleReprogramari();
                break;
            default:
                console.log('Unknown action');
        }
    }

    // Funcționalități pentru fiecare item din sidebar

    handleDashboard() {
        console.log('Funcționalitate Tablou de bord');
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="content-header">
                <h1>Bine ați venit la TransfIT</h1>
                <p>V-ați conectat cu succes! Selectați o opțiune din meniul lateral pentru a continua.</p>
            </div>
        `;
    }

    /**
     * Afișează interfața pentru crearea de programări
     * - Încarcă formularul Tally.so pentru introducerea datelor
     * - Afișează calendarul Google cu programările existente
     * - Permite căutarea ultimei programări a unui pacient
     */
    handleProgramare() {
        console.log('Afișare formular creare programare');
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="content-header">
                <h1>Creare programare</h1>
            </div>
            <div class="form-layout two-column">
                <div class="form-container">
                    <div class="form-header reprogramari-header">
                        <h3>Formular</h3>
                        <div class="calendar-actions-inline">
                            <button id="form-programare-btn" class="btn-secondary form-toggle-btn" title="Formular programare">Programare</button>
                            <button id="form-disponibilitate-btn" class="btn-secondary form-toggle-btn" title="Formular disponibilitate">Disponibilitate</button>
                        </div>
                    </div>
                    <iframe 
                        src="https://tally.so/r/obeJvO" 
                        class="tally-iframe"
                        frameborder="0" 
                        marginheight="0" 
                        marginwidth="0" 
                        title="Formular creare programare">
                    </iframe>
                </div>
                <div class="calendar-container">
                    <div class="calendar-header">
                        <h3>Calendar programări</h3>
                        <div class="calendar-actions-inline">
                            <input type="text" id="last-appointment-input" placeholder="Caută pacient..." />
                            <button id="save-appointment-btn" class="btn-secondary" title="Caută ultima programare">🔍</button>
                            <button id="calendar-refresh-create" class="btn-secondary" title="Reîncarcă calendar">🔄</button>
                        </div>
                    </div>
                    <div class="last-appointment-banner" id="last-appointment-banner" aria-live="polite" style="display:none;">
                    </div>
                    <div class="calendar-status" id="calendar-status-create" style="display:none;">
                        Se conectează la Calendar...
                    </div>
                    <div id="calendar-events-create" class="appointments-list-container">
                        <div style="text-align: center; padding: 2rem; color: #666;">
                            <p>Se încarcă evenimentele...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const formIframe = document.querySelector('.tally-iframe');
        const programareBtn = document.getElementById('form-programare-btn');
        const disponibilitateBtn = document.getElementById('form-disponibilitate-btn');
        const currentLinks = {
            programare: 'https://tally.so/r/obeJvO',
            disponibilitate: 'https://tally.so/r/vGDVKQ'
        };

        if (formIframe && programareBtn && disponibilitateBtn) {
            const loadForm = (baseUrl) => {
                const cacheBuster = `ts=${Date.now()}`;
                const separator = baseUrl.includes('?') ? '&' : '?';
                formIframe.setAttribute('src', `${baseUrl}${separator}${cacheBuster}`);
            };

            programareBtn.addEventListener('click', () => {
                loadForm(currentLinks.programare);
            });
            disponibilitateBtn.addEventListener('click', () => {
                loadForm(currentLinks.disponibilitate);
            });

            const authData = this.getAuthCookie();
            const email = authData?.username || '';
            if(email){
                const linksPromise = fetchUserFormLinksViaEmail();
                linksPromise.then(links => {
                    if (links && links.programare) {
                        loadForm(links.programare);
                    } else {
                        console.error("Could not load links");
                    }
                });
            }
            // if (email) {
            //     fetch(`/auth/api/form-links?email=${encodeURIComponent(email)}`, {
            //         method: 'GET',
            //         credentials: 'include'
            //     })
            //         .then(response => response.ok ? response.json() : null)
            //         .then((data) => {
            //             if (data?.Tally?.programare) currentLinks.programare = data.Tally.programare;
            //             if (data?.Tally?.disponibilitate) currentLinks.disponibilitate = data.Tally.disponibilitate;
            //             if (data?.N8N?.delete) currentLinks.delete = data.N8N.delete;
            //             if (data?.N8N?.reprogramate) currentLinks.reprogramate = data.N8N.reprogramate;
            //             if (data?.N8N?.search) currentLinks.search = data.N8N.search;
            //             loadForm(currentLinks.programare);
            //         })
            //         .catch(() => {
            //             loadForm(currentLinks.programare);
            //         });
            // }
        }

        // Configurează acțiunea butonului pentru căutarea pacientului
        const btn = document.getElementById('save-appointment-btn');
        const input = document.getElementById('last-appointment-input');
        const bannerEl = document.getElementById('last-appointment-banner');
        if (btn && input && bannerEl) {
            btn.addEventListener('click', () => {
                const patientName = (input.value || '').trim();
                if (!patientName) {
                    this.showNotification('Introduceți numele pacientului', 'warning');
                    return;
                }
                bannerEl.style.display = 'block';
                this.searchPatientAppointment(patientName, bannerEl);
            });
            // Permite căutarea cu Enter
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    btn.click();
                }
            });
        }

        const refreshBtn = document.getElementById('calendar-refresh-create');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.initInlineCalendar('calendar-status-create', 'calendar-events-create');
            });
        }

        this.initInlineCalendar('calendar-status-create', 'calendar-events-create');
    }

    /**
     * Afișează interfața pentru ștergerea programărilor
     * - Permite căutarea programărilor unui pacient
     * - Afișează lista de programări găsite
     * - Permite ștergerea selectivă a programărilor
     */
    handleStergere() {
        console.log('Afișare formular ștergere programare');
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="content-header">
                <h1>Ștergere programare</h1>
            </div>
            <div class="form-layout two-column">
                <div class="form-container">
                    <div class="form-header">
                        <h3>Programări pacient</h3>
                        <div class="calendar-actions-inline">
                            <input type="text" id="search-delete-input" placeholder="Caută pacient..." />
                            <button id="search-delete-btn" class="btn-secondary" title="Caută programări">🔍</button>
                        </div>
                    </div>
                    <div class="appointments-list-container" id="appointments-list">
                        <div style="text-align: center; padding: 2rem; color: #666;">
                            <p>Introduceți numele pacientului pentru a căuta programări.</p>
                        </div>
                    </div>
                </div>
                <div class="calendar-container">
                    <div class="calendar-header">
                        <h3>Calendar programări</h3>
                        <button id="calendar-refresh-delete" class="btn-secondary" title="Reîncarcă calendar">🔄</button>
                    </div>
                    <div class="last-appointment-banner" id="delete-info-banner" aria-live="polite" style="display:none;">
                    </div>
                    <div class="calendar-status" id="calendar-status-delete" style="display:none;">
                        Se conectează la Calendar...
                    </div>
                    <div id="calendar-events-delete" class="appointments-list-container">
                        <div style="text-align: center; padding: 2rem; color: #666;">
                            <p>Se încarcă evenimentele...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Configurează acțiunile
        const searchBtn = document.getElementById('search-delete-btn');
        const searchInput = document.getElementById('search-delete-input');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                const searchTerm = searchInput.value.trim();
                if (!searchTerm) {
                    this.showNotification('Introduceți numele pacientului', 'warning');
                    return;
                }
                this.searchAppointmentsForDelete(searchTerm);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    searchBtn.click();
                }
            });
        }

        const refreshBtn = document.getElementById('calendar-refresh-delete');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.initInlineCalendar('calendar-status-delete', 'calendar-events-delete');
            });
        }

        this.initInlineCalendar('calendar-status-delete', 'calendar-events-delete');
    }

    /**
     * Afișează interfața pentru reprogramări/anulări
     * - Listează programările marcate pentru reprogramare sau anulare
     * - Permite filtrare după dată și refresh manual
     * - Afișează calendarul pentru context
     */
    handleReprogramari() {
        console.log('Afișare tab reprogramări');
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="content-header">
                <h1>Reprogramări</h1>
                <p>Programări care necesită reprogramare sau anulare.</p>
            </div>
            <div class="form-layout two-column">
                <div class="form-container">
                    <div class="form-header reprogramari-header">
                        <h3>Listă reprogramări</h3>
                        <div class="calendar-actions-inline">
                            <button id="reprogramari-refresh" class="btn-secondary" title="Reîncarcă lista">🔄</button>
                        </div>
                    </div>
                    <div class="appointments-list-container" id="reprogramari-list">
                        <div style="text-align: center; padding: 2rem; color: #666;">
                            <p>Apăsați refresh pentru a încărca lista.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const refreshBtn = document.getElementById('reprogramari-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadReprogramariList());
        }

    }

    async loadReprogramariList() {
        const listContainer = document.getElementById('reprogramari-list');
        if (!listContainer) return;

        listContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <strong>Se încarcă...</strong>
            </div>
        `;

        try {
            const N8N_WEBHOOK_URL = 'https://transfit.site/n8n/webhook/imp-reprogramare-pacient';
            const ts = Date.now();
            const dataString = `ts=${ts}`;
            const encryptedData = await encryptRSA(dataString);
            const urlDecoded = `${N8N_WEBHOOK_URL}?data=${encodeURIComponent(encryptedData)}`;

            const response = await fetch(urlDecoded, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.renderReprogramariList(data);
        } catch (error) {
            console.error('Eroare la încărcarea reprogramărilor:', error);
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #ef4444;">
                    <p>Nu s-a putut încărca lista.</p>
                </div>
            `;
            this.showNotification('Eroare la încărcarea reprogramărilor', 'error');
        }
    }

    renderReprogramariList(data) {
        const listContainer = document.getElementById('reprogramari-list');
        if (!listContainer) return;

        const items = Array.isArray(data)
            ? data
            : (data?.items || data?.results || data?.history || []);

        if (!items.length) {
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <p>Nu există reprogramări pentru filtrul selectat.</p>
                </div>
            `;
            return;
        }

        const capitalizeWords = (value) => {
            return String(value || '')
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };

        const formatDateLabel = (value) => {
            if (!value) return 'N/A';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return 'N/A';

            const parts = new Intl.DateTimeFormat('ro-RO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).formatToParts(date);

            const day = parts.find(part => part.type === 'day')?.value || '';
            const monthRaw = parts.find(part => part.type === 'month')?.value || '';
            const year = parts.find(part => part.type === 'year')?.value || '';
            const month = monthRaw ? monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1) : '';

            return [day, month, year].filter(Boolean).join(' ');
        };

        const formatTime = (value) => {
            if (!value || value === 'N/A') return 'N/A';
            const str = String(value);
            if (str.includes(':')) return str.slice(0, 5);
            return str;
        };

        const rows = items.map((apt) => {
            const rawName = apt.patient || apt.pacient || apt.nume_complet ||
                [apt.first_name, apt.last_name].filter(Boolean).join(' ') ||
                [apt.prenume, apt.nume].filter(Boolean).join(' ') || 'N/A';
            const name = rawName === 'N/A' ? rawName : capitalizeWords(rawName);
            const dateValue = apt.data_programare || apt.data || apt.date || apt.appointment_date;
            const dateLabel = formatDateLabel(dateValue);
            const time = formatTime(apt.ora_start || apt.time || apt.appointment_time || 'N/A');
            const rawDoctor = apt.cabinet_medic || apt.medic || apt.doctor || apt.doctor_name || '';
            const doctor = rawDoctor ? capitalizeWords(rawDoctor) : '';
            const status = apt.status_confirmare || apt.status || apt.stare || apt.tip || 'N/A';
            const reason = apt.tip_vizita || apt.motiv || apt.reason || apt.detalii || apt.details || '';
            const phone = apt.phone || apt.telefon || apt.tel || '';

            return `
                <div class="appointment-card reprogramari-card">
                    <div class="appointment-card-header">
                        <strong style="color: #1800ad;">🔁 ${name}</strong>
                    </div>
                    <div class="appointment-card-body">
                        <p><strong>Pacient:</strong> ${name}</p>
                        <p><strong>Telefon:</strong> ${phone || 'N/A'}</p>
                        <p><strong>Medic:</strong> ${doctor || 'N/A'}</p>
                        <p><strong>Data:</strong> ${dateLabel} ${time !== 'N/A' ? `la ${time}` : ''}</p>
                        <p><strong>Status:</strong> ${status}</p>
                        ${reason ? `<p><strong>Motiv:</strong> ${reason}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        listContainer.innerHTML = `
            <div style="padding: 1rem;">
                <h3 style="margin-bottom: 1rem; color: #1800ad;">Reprogramări (${items.length})</h3>
                <div class="appointments-grid">
                    ${rows}
                </div>
            </div>
        `;
    }

    /**
     * Inițializează și afișează calendarul Google inline în interfață
     * - Obține token de acces pentru Google Calendar API
     * - Încarcă evenimentele din calendar
     * - Afișează status-ul conexiunii
     * @param {string} statusId - ID-ul elementului de status
     * @param {string} eventsId - ID-ul containerului pentru evenimente
     */
    async initInlineCalendar(statusId, eventsId) {
        const statusEl = document.getElementById(statusId);
        const eventsContainer = document.getElementById(eventsId);

        if (!statusEl || !eventsContainer) return;

        try {
            statusEl.style.display = 'block';
            statusEl.textContent = 'Se conectează la Calendar...';
            const accessToken = await this.ensureGoogleCalendarToken();
            if (!accessToken) {
                throw new Error('Token calendar lipsă');
            }

            statusEl.textContent = 'Calendar conectat. Se încarcă evenimentele...';
            await this.loadGoogleCalendarEvents(eventsContainer, statusEl);
        } catch (error) {
            console.error('Calendar inline error:', error);
            statusEl.textContent = 'Nu am putut conecta Calendarul.';
            eventsContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #ef4444;">
                    <p>Conectarea la Calendar a eșuat.</p>
                </div>
            `;
        }
    }

    /**
     * Asigură disponibilitatea unui token valid pentru Google Calendar
     * - Verifică token-ul existent din localStorage
     * - Solicită un token nou dacă este expirat sau lipsește
     * - Poate forța re-autentificarea utilizatorului
     * @param {boolean} forcePrompt - Forțează afișarea dialogului de autentificare
     * @returns {Promise<string|null>} - Token-ul de acces sau null
     */
    async ensureGoogleCalendarToken(forcePrompt = false) {
        if (!window.authManager) {
            this.showNotification('AuthManager nu este disponibil', 'error');
            return null;
        }

        const existingToken = window.authManager.getGoogleCalendarToken();
        if (existingToken && !forcePrompt) {
            return existingToken;
        }

        return window.authManager.requestGoogleCalendarAccess('consent');
    }

    ensureFullCalendarLoaded(timeoutMs = 8000) {
        return new Promise((resolve, reject) => {
            if (window.FullCalendar) {
                resolve(true);
                return;
            }

            const existingScript = document.querySelector('script[data-fullcalendar="true"]');
            if (existingScript) {
                const start = Date.now();
                const check = () => {
                    if (window.FullCalendar) {
                        resolve(true);
                        return;
                    }
                    if (Date.now() - start > timeoutMs) {
                        reject(new Error('FullCalendar failed to load'));
                        return;
                    }
                    setTimeout(check, 100);
                };
                check();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js';
            script.async = true;
            script.dataset.fullcalendar = 'true';
            script.onload = () => resolve(true);
            script.onerror = () => reject(new Error('FullCalendar script load error'));
            document.head.appendChild(script);
        });
    }

    /**
     * Încarcă și afișează evenimentele din Google Calendar
     * - Face request către Google Calendar API
     * - Gestionează expirarea token-ului cu retry automat
     * - Folosește FullCalendar.js pentru vizualizare grafică
     * @param {HTMLElement} eventsContainer - Container pentru afișarea evenimentelor
     * @param {HTMLElement} statusEl - Element pentru afișarea statusului
     * @param {boolean} retried - Flag pentru a preveni retry-uri infinite
     */
    async loadGoogleCalendarEvents(eventsContainer, statusEl, retried = false) {
        eventsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <strong>Se încarcă evenimentele...</strong>
            </div>
        `;

        try {
            const accessToken = await this.ensureGoogleCalendarToken();
            if (!accessToken) {
                throw new Error('Token calendar lipsă');
            }

            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);
            const timeMin = monthStart.toISOString();
            const timeMax = monthEnd.toISOString();
            const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
            url.searchParams.set('maxResults', '250');
            url.searchParams.set('timeMin', timeMin);
            url.searchParams.set('timeMax', timeMax);
            url.searchParams.set('singleEvents', 'true');
            url.searchParams.set('orderBy', 'startTime');

            console.log('Calendar fetch URL:', url.toString());
            const response = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (response.status === 401 && !retried) {
                await this.ensureGoogleCalendarToken(true);
                return this.loadGoogleCalendarEvents(eventsContainer, statusEl, true);
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('Calendar events loaded:', data?.items?.length || 0);

            try {
                await this.ensureFullCalendarLoaded();
            } catch (e) {
                console.warn('FullCalendar not available:', e);
            }

            this.renderGoogleCalendarEvents(data, eventsContainer);

            if (statusEl) {
                statusEl.textContent = 'Evenimente încărcate cu succes.';
                setTimeout(() => {
                    if (statusEl.textContent === 'Evenimente încărcate cu succes.') {
                        statusEl.textContent = '';
                        statusEl.style.display = 'none';
                    }
                }, 2500);
            }
        } catch (error) {
            console.error('Calendar fetch error:', error);
            if (statusEl) {
                statusEl.style.display = 'block';
                statusEl.textContent = 'Nu am putut încărca evenimentele.';
            }
            eventsContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #ef4444;">
                    <p>Eroare la încărcarea evenimentelor.</p>
                    <p style="font-size: 12px;">${error?.message || 'Eroare necunoscută'}</p>
                </div>
            `;
        }
    }

    renderGoogleCalendarEvents(data, container) {
        const events = data?.items || [];

        console.log('FullCalendar available:', Boolean(window.FullCalendar));
        if (window.FullCalendar) {
            container.innerHTML = '<div class="calendar-view" style="background:#fff;border-radius:12px;padding:12px;min-height:520px;"></div>';
            const calendarEl = container.querySelector('.calendar-view');

            const calendarEvents = events.map(event => {
                const start = event.start?.dateTime || event.start?.date || '';
                const end = event.end?.dateTime || event.end?.date || '';
                const isAllDay = Boolean(event.start?.date && !event.start?.dateTime);
                return {
                    title: event.summary || 'Fără titlu',
                    start,
                    end,
                    allDay: isAllDay
                };
            });

            const calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                height: 'auto',
                locale: 'ro',
                events: calendarEvents,
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }
            });

            calendar.render();
            return;
        }

        container.innerHTML = `
            <div style="text-align:center; padding:2rem; color:#ef4444;">
                <p>Nu pot afișa calendarul (biblioteca FullCalendar nu s-a încărcat).</p>
                <p style="font-size:12px;">Reîncercați cu refresh (Ctrl+F5).</p>
            </div>
        `;
    }

    /**
     * Caută programările unui pacient în backend pentru ștergere
     * - Face request către API-ul local (/api/appointments/search)
     * - Afișează rezultatele găsite în interfață
     * - Gestionează cazurile de eroare și lipsa rezultatelor
     * @param {string} patientName - Numele pacientului de căutat
     */
    async searchAppointmentsForDelete(patientName) {
        const listContainer = document.getElementById('appointments-list');
        const infoBanner = document.getElementById('delete-info-banner');
        
        // Afișează loading
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <strong>Se caută...</strong> ${patientName}
            </div>
        `;
        
        try {
            const N8N_WEBHOOK_URL = 'https://transfit.site/n8n/webhook/imp-verificare-pacient';
            // ------
            // Împarte numele în părți
            const nameParts = patientName.trim().split(' ');
            let prenume = '';
            let nume = '';
            
            if (nameParts.length >= 2) {
                // Presupunem ordinea: prenume nume (ex: Teodor Simionescu)
                prenume = nameParts.slice(0, -1).join(' ');
                nume = nameParts[nameParts.length - 1];
            } else {
                // Dacă e doar un cuvânt, îl punem ca prenume
                prenume = nameParts[0] || '';
            }
            
            // Construiește URL-ul cu parametrii
            const url = new URL(N8N_WEBHOOK_URL);
            if (prenume) url.searchParams.append('prenume', prenume.toLowerCase());
            if (nume) url.searchParams.append('nume', nume.toLowerCase());
            
            const ts = Date.now();
            const dataString = `nume=${nume}&prenume=${prenume}&ts=${ts}`;
            const encryptedData = await encryptRSA(dataString);
            
            const url_decoded=N8N_WEBHOOK_URL+`?data=${encodeURIComponent(encryptedData)}`;

            console.log('Request URL:', url_decoded.toString());
            
            // Trimite request GET către n8n
            const response = await fetch(url_decoded.toString(), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors'
            });


            // -------
            //const response = await fetch(`${API_URL}/api/appointments/search/${encodeURIComponent(patientName)}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    listContainer.innerHTML = `
                        <div style="text-align: center; padding: 2rem; color: #ef4444;">
                            <p>Nu s-au găsit programări pentru: <strong>${patientName}</strong></p>
                        </div>
                    `;
                    this.showNotification('Nu s-au găsit programări', 'info');
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            // Afișează lista de programări
            this.displayAppointmentsList(data.history, patientName);
            
        } catch (error) {
            console.error('Eroare la căutarea programărilor:', error);
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #ef4444;">
                    <p><strong>Eroare:</strong> Nu s-a putut conecta la server.</p>
                    <p style="font-size: 12px;">Verifică dacă backend-ul rulează pe http://localhost:8000</p>
                </div>
            `;
            this.showNotification('Eroare de conexiune', 'error');
        }
    }

    // Afișează lista de programări găsite
    displayAppointmentsList(data, patientName) {
        const listContainer = document.getElementById('appointments-list');
        
        // Backend returnează un singur rezultat, dar îl putem trata ca array
        const appointments = data ? data : [];
        
        if (appointments.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #ef4444;">
                    <p>Nu s-au găsit programări.</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div style="padding: 1rem;">
                <h3 style="margin-bottom: 1rem; color: #1800ad;">Programări găsite (${appointments.length})</h3>
                <div class="appointments-grid">
        `;
        
        const resolveTallyId = (apt) => {
            return (
                apt.tally_id ??
                apt['tally id'] ??
                apt.tallyId ??
                apt.tallyID ??
                ''
            );
        };

        appointments.forEach((apt, index) => {
            const rawTallyId = resolveTallyId(apt);
            const tallyId = String(rawTallyId ?? '').replace(/'/g, "\\'");
            console.log('Programare index:', index, 'tally_id:', rawTallyId, 'apt:', apt);
            const dateFormatted = new Date(apt.data_programare).toLocaleDateString('ro-RO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            html += `
                <div class="appointment-card" data-appointment-id="${tallyId}" onclick="homepageManager.selectAppointment('${tallyId}', '${patientName}', '${dateFormatted}', '${apt.ora_start.substring(0, 5) || 'N/A'}', '${apt.details?.replace(/'/g, "\\'")}')">
                    <div class="appointment-card-header">
                        <strong style="color: #1800ad;">📅 ${dateFormatted}</strong>
                    </div>
                    <div class="appointment-card-body">
                        <p><strong>Oră:</strong> ${apt.ora_start.substring(0, 5) || 'N/A'}</p>
                        <p><strong>Cabinet:</strong> ${apt.cabinet_medic.replace(/\b\w/g, char => char.toUpperCase()) || 'Nespecificat'}</p>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        listContainer.innerHTML = html;
    }

    // Selectează o programare pentru ștergere
    selectAppointment(tallyId, patientName, date, time, details) {
        // Marchează card-ul ca selectat
        document.querySelectorAll('.appointment-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-appointment-id="${tallyId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Afișează detaliile în banner
        const infoBanner = document.getElementById('delete-info-banner');
        infoBanner.style.display = 'block';
        infoBanner.innerHTML = `
            <strong>Pacient:</strong> ${patientName}<br>
            <strong>Data:</strong> ${date} la ${time}<br>
            <strong>Detalii:</strong> ${details}<br>
            <button id="confirm-delete-webhook-btn" class="btn-danger" style="margin-top: 1rem;">
                🗑️ Trimite cerere de ștergere
            </button>
        `;
        
        // Adaugă eveniment pentru trimiterea webhook-ului
        const deleteWebhookBtn = document.getElementById('confirm-delete-webhook-btn');
        if (deleteWebhookBtn) {
            deleteWebhookBtn.addEventListener('click', () => this.sendDeleteWebhook(tallyId, patientName));
        }
    }

    /**
     * Trimite webhook pentru ștergerea unei programări (folosește tally_id)
     * @param {string} tallyId - ID-ul programării din Tally
     * @param {string} patientName - Numele pacientului (pentru mesaje)
     */
    async sendDeleteWebhook(tallyId, patientName) {
        if (!tallyId) {
            this.showNotification('Nu există Tally ID pentru această programare.', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/webhooks/delete-appointment?data=${encodeURIComponent(tallyId)}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            this.showNotification(`Cererea de ștergere a fost trimisă pentru ${patientName}.`, 'success');
        } catch (error) {
            console.error('Eroare la trimiterea webhook-ului:', error);
            this.showNotification('Eroare la trimiterea cererii de ștergere.', 'error');
        }
    }

    /**
     * Șterge o programare din baza de date
     * - Solicită confirmare utilizatorului
     * - Trimite request DELETE către backend
     * - Actualizează interfața după ștergere
     * @param {number} appointmentId - ID-ul programării de șters
     * @param {string} patientName - Numele pacientului (pentru confirmare)
     */
    async deleteAppointment(appointmentId, patientName) {
        if (!confirm(`Sigur doriți să ștergeți această programare pentru ${patientName}?`)) {
            return;
        }
        
        try {
            const API_URL = 'http://localhost:8000';
            const response = await fetch(`${API_URL}/api/appointments/${appointmentId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            this.showNotification('Programare ștearsă cu succes!', 'success');
            
            // Reîncarcă lista de programări
            const searchInput = document.getElementById('search-delete-input');
            if (searchInput && searchInput.value.trim()) {
                this.searchAppointmentsForDelete(searchInput.value.trim());
            } else {
                // Resetează interfața
                document.getElementById('appointments-list').innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #666;">
                        <p>✓ Programare ștearsă cu succes!</p>
                        <p style="margin-top: 1rem;">Introduceți un nou nume pentru a căuta alte programări.</p>
                    </div>
                `;
                document.getElementById('delete-info-banner').innerHTML = `
                    Selectați o programare pentru a vedea detaliile.
                `;
            }
            
        } catch (error) {
            console.error('Eroare la ștergerea programării:', error);
            this.showNotification('Eroare la ștergerea programării', 'error');
        }
    }

    /**
     * Caută ultima programare a unui pacient prin webhook n8n
     * - Împarte numele în prenume și nume
     * - Trimite request GET către n8n automation
     * - Gestionează răspunsuri JSON și erori CORS
     * - Afișează datele găsite în banner
     * @param {string} patientName - Numele complet al pacientului
     * @param {HTMLElement} bannerEl - Element pentru afișarea rezultatelor
     */
    async searchPatientAppointment(patientName, bannerEl) {
        // URL webhook n8n
        const n8n_loaded_url = fetchUserFormLinks();
        if(!n8n_loaded_url) {
            bannerEl.innerHTML = `
                <strong>Pacient:</strong> ${patientName}<br>
                <span style="color: #ef4444;">Nu s-au găsit linkuri N8N pentru acest utilizator.</span><br>
            `;
            this.showNotification('Nu s-au găsit linkuri N8N pentru acest utilizator', 'error');
            return;
        }
        const N8N_WEBHOOK_URL = n8n_loaded_url.search;
        
        // Curăță bannerul înainte de încărcare
        bannerEl.innerHTML = '';
        
        try {
            // Împarte numele în părți
            const nameParts = patientName.trim().split(' ');
            let prenume = '';
            let nume = '';
            
            if (nameParts.length >= 2) {
                // Presupunem ordinea: prenume nume (ex: Teodor Simionescu)
                prenume = nameParts.slice(0, -1).join(' ');
                nume = nameParts[nameParts.length - 1];
            } else {
                // Dacă e doar un cuvânt, îl punem ca prenume
                prenume = nameParts[0] || '';
            }
            
            // Construiește URL-ul cu parametrii
            const url = new URL(N8N_WEBHOOK_URL);
            if (prenume) url.searchParams.append('prenume', prenume.toLowerCase());
            if (nume) url.searchParams.append('nume', nume.toLowerCase());
            
            const ts = Date.now();
            const dataString = `nume=${nume}&prenume=${prenume}&ts=${ts}`;
            const encryptedData = await encryptRSA(dataString);
            
            const url_decoded=N8N_WEBHOOK_URL+`?data=${encodeURIComponent(encryptedData)}`;

            console.log('Request URL:', url_decoded.toString());
            
            // Trimite request GET către n8n
            const response = await fetch(url_decoded.toString(), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors'
            });
            
            console.log('Response status:', response.status);
            
            // Încearcă să parsezi răspunsul JSON indiferent de status code
            let data;
            try {
                data = await response.json();
                console.log('Response data:', data);
            } catch (parseError) {
                console.error('Nu s-a putut parsa JSON:', parseError);
                throw new Error('Răspuns invalid de la server');
            }
            
            // Verifică dacă n8n returnează mesaj că nu a găsit pacientul
            if (data.message === "No item to return was found") {
                bannerEl.innerHTML = `
                    <strong>Pacient:</strong> ${patientName}<br>
                    <span style="color: #ef4444;">Nu s-au găsit programări în baza de date.</span><br>
                    <span style="color: #666; font-size: 12px;">Încercați formatul: Prenume Nume (ex: Teodor Simionescu)</span>
                `;
                this.showNotification('Pacientul nu a fost găsit', 'info');
                return;
            }
            
            // Verifică dacă sunt date valide returnate
            if (!data || (data.count === 0)) {
                bannerEl.innerHTML = `
                    <strong>Pacient:</strong> ${patientName}<br>
                    <span style="color: #ef4444;">Nu s-au găsit date.</span>
                `;
                this.showNotification('Nu s-au găsit date pentru acest pacient', 'info');
                return;
            }
            
            // Afișează datele primite din n8n
            this.displayAppointmentData(data, bannerEl, patientName);
            this.showNotification('Date încărcate cu succes', 'success');
            
        } catch (error) {
            console.error('Eroare completă:', error);
            
            let errorMessage = 'Nu s-a putut conecta la n8n automation.';
            
            // Identifică tipul de eroare
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                errorMessage = 'Eroare CORS sau conexiune. Verifică:<br>1. Webhook-ul n8n este activ<br>2. CORS este configurat în n8n<br>3. URL-ul este corect';
            } else if (error.message.includes('Răspuns invalid')) {
                errorMessage = 'Serverul n8n nu returnează JSON valid';
            } else {
                errorMessage = error.message;
            }
            
            bannerEl.innerHTML = `
                <strong>Eroare:</strong> ${errorMessage}<br>
                <span style="color: #ef4444; font-size: 12px;">Verifică consola browser-ului (F12) pentru detalii</span>
            `;
            this.showNotification('Eroare de conexiune la n8n', 'error');
        }
    }

    // Afișează datele primite din n8n
    displayAppointmentData(data, bannerEl, patientName) {
        const normalizeValue = (value) => {
            if (value === null || value === undefined) return 'N/A';
            const str = String(value).trim();
            if (!str || str.toLowerCase() === 'null') return 'N/A';
            return str;
        };

        const capitalizeWords = (value) => {
            const text = normalizeValue(value);
            if (text === 'N/A') return text;
            return text
                .split(/\s+/)
                .filter(Boolean)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };

        const formatDateLabel = (value) => {
            if (!value) return 'N/A';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return 'N/A';

            const parts = new Intl.DateTimeFormat('ro-RO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).formatToParts(date);

            const day = parts.find(part => part.type === 'day')?.value || '';
            const monthRaw = parts.find(part => part.type === 'month')?.value || '';
            const year = parts.find(part => part.type === 'year')?.value || '';
            const month = monthRaw ? monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1) : '';

            return [day, month, year].filter(Boolean).join(' ');
        };

        const formatTime = (value) => {
            const text = normalizeValue(value);
            if (text === 'N/A') return text;
            if (text.includes(':')) return text.slice(0, 5);
            return text;
        };

        // Versiune 1: Dacă primești un array de programări
        if (Array.isArray(data.history)) {
            data.history.forEach((appointment, index) => {
                const dateFormatted = formatDateLabel(appointment.data_programare);
                const timeFormatted = formatTime(appointment.ora_start);
                const medicFormatted = capitalizeWords(appointment.cabinet_medic);
                const phone = normalizeValue(appointment.phone || appointment.telefon || appointment.tel);
                const detailsRaw = normalizeValue(appointment.info_relevante);
                
                bannerEl.innerHTML += `
                    <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(229, 231, 235, 0.3);">
                        <strong>Programare ${index + 1}:</strong><br>
                        <strong>Data:</strong> ${dateFormatted} ${timeFormatted !== 'N/A' ? `la ${timeFormatted}` : ''}<br>
                        <strong>Medic:</strong> ${medicFormatted}<br>
                        <strong>Telefon:</strong> ${phone}<br>
                    </div>
                `;
            });
        } 
        // Versiune 2: Dacă primești un obiect cu proprietăți
        else if (typeof data === 'object') {
            // Adaptează câmpurile în funcție de structura JSON-ului tău
            const dateStr = data.date || data.data || data.appointment_date;
            const dateFormatted = formatDateLabel(dateStr);
            const timeFormatted = formatTime(data.time || data.ora || data.appointment_time);
            const medicFormatted = capitalizeWords(data.cabinet_medic || data.medic || data.doctor || data.doctor_name);
            const phone = normalizeValue(data.phone || data.telefon || data.tel);
            const patient = capitalizeWords(data.patient_name || data.nume_complet || data.prenume + ' ' + data.nume || patientName);
            
            bannerEl.innerHTML = `
                <strong>Pacient:</strong> ${patient}<br>
                <strong>Medic:</strong> ${medicFormatted}<br>
                <strong>Telefon:</strong> ${phone}<br>
                <strong>Data:</strong> ${dateFormatted} ${timeFormatted !== 'N/A' ? `la ${timeFormatted}` : ''}<br>
            `;

            if (data.email) {
                bannerEl.innerHTML += `<br><strong>Email:</strong> ${data.email}`;
            }
            if (data.status || data.stare) {
                bannerEl.innerHTML += `<br><strong>Status:</strong> ${data.status || data.stare}`;
            }
        }
    }

    // Sistem de notificări
    showNotification(message, type = 'info') {
        // Creează elementul de notificare
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const colors = {
            info: { bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.3)', text: '#06b6d4' },
            success: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' },
            warning: { bg: 'rgba(251, 188, 5, 0.1)', border: 'rgba(251, 188, 5, 0.3)', text: '#fbbc05' },
            error: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' }
        };
        
        const color = colors[type] || colors.info;
        
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${color.bg};
                backdrop-filter: blur(10px);
                border: 1px solid ${color.border};
                border-radius: 12px;
                padding: 16px 20px;
                color: ${color.text};
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                animation: slideInRight 0.3s ease;
            ">
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Elimină notificarea după 3 secunde
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Funcții helper pentru viitoare funcționalități
    
    // Obține datele de autentificare din localStorage
    getAuthCookie() {
        const authDataStr = localStorage.getItem('transfit_auth');
        if (authDataStr) {
            try {
                return JSON.parse(authDataStr);
            } catch (e) {
                console.error('Eroare la parsarea datelor de autentificare:', e);
                return null;
            }
        }

        const sessionStr = localStorage.getItem('transfit_session');
        if (!sessionStr) return null;
        
        try {
            const session = JSON.parse(sessionStr);
            return {
                username: session.user?.email || session.user?.name || 'Utilizator',
                authType: session.provider || 'email',
                loginTime: session.loginTime
            };
        } catch (e) {
            console.error('Eroare la parsarea datelor de autentificare:', e);
            return null;
        }
    }
    
    // Afișează informații despre utilizator
    displayUserInfo() {
        const authData = this.getAuthCookie();
        if (authData) {
            // Opțional: poți afișa numele utilizatorului în interfață
            console.log(`Bine ai venit, ${authData.username}!`);
        }
    }
    
    // Configurează butonul de logout
    setupLogoutButton() {
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
    
    // Logout - șterge datele de autentificare și redirecționează
    logout() {
        // Șterge datele de autentificare din localStorage
        localStorage.removeItem('transfit_auth');
        localStorage.removeItem('transfit_session');
        if (window.authManager && typeof window.authManager.clearSession === 'function') {
            window.authManager.clearSession();
        }
        console.log('Logout efectuat, date de autentificare șterse');
        
        // Redirecționează către pagina de login
        window.location.href = '../Start/Login.html';
    }
    
    getUserData() {
        // Obține datele utilizatorului din cookie
        const authData = this.getAuthCookie();
        if (authData) {
            return {
                name: authData.username,
                authType: authData.authType,
                loginTime: authData.loginTime
            };
        }
        return {
            name: 'Utilizator',
            email: 'user@example.com'
        };
    }
}

// Adaugă stiluri pentru animații
const addAnimationStyles = () => {
    if (!document.getElementById('homepage-animations')) {
        const style = document.createElement('style');
        style.id = 'homepage-animations';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }
        `;
        document.head.appendChild(style);
    }
};

/**
 * Verifică autentificarea utilizatorului pe homepage
 * - Controlează datele din localStorage și sesiunea Google
 * * - Validează expirarea sesiunii
 * - Redirecționează către login dacă nu este autentificat
 * @returns {boolean} - true dacă utilizatorul este autentificat, false altfel
 */
function checkPageAuthentication() {
    console.log('=== Verificare autentificare Homepage ===');
    
    // Verifică localStorage
    const authDataStr = localStorage.getItem('transfit_auth');
    console.log('Auth data din localStorage:', authDataStr);
    const sessionStr = localStorage.getItem('transfit_session');
    if (!authDataStr && sessionStr) {
        console.log('Auth data din transfit_session:', sessionStr);
        try {
            const session = JSON.parse(sessionStr);
            const now = Date.now();
            if (session.expiresAt && now > session.expiresAt) {
                console.log('❌ Sesiune Google expirată, redirecționare către login...');
                localStorage.removeItem('transfit_session');
                setTimeout(() => {
                    window.location.href = '../Start/Login.html';
                }, 500);
                return false;
            }

            console.log('✅ Utilizator autentificat (Google):', session.user?.email || session.user?.name || 'Utilizator');
            return true;
        } catch (e) {
            console.error('❌ Eroare la parsarea sesiunii Google:', e);
            localStorage.removeItem('transfit_session');
        }
    }
    
    if (!authDataStr) {
        console.log('❌ Nu există date de autentificare, redirecționare către login...');
        setTimeout(() => {
            window.location.href = '../Start/Login.html';
        }, 500);
        return false;
    }
    
    try {
        const authData = JSON.parse(authDataStr);
        console.log('Auth data parsată:', authData);
        
        // Verifică dacă sesiunea a expirat
        const now = new Date().getTime();
        if (authData.expiresAt && now > authData.expiresAt) {
            console.log('❌ Sesiune expirată, redirecționare către login...');
            localStorage.removeItem('transfit_auth');
            setTimeout(() => {
                window.location.href = '../Start/Login.html';
            }, 500);
            return false;
        }
        
        console.log('✅ Utilizator autentificat:', authData.username, '(', authData.authType, ')');
        return true;
        
    } catch (e) {
        console.error('❌ Eroare la parsarea datelor de autentificare:', e);
        localStorage.removeItem('transfit_auth');
        setTimeout(() => {
            window.location.href = '../Start/Login.html';
        }, 500);
        return false;
    }
}

// Inițializează homepage manager la încărcarea paginii
let homepageManager;
document.addEventListener('DOMContentLoaded', () => {
    // Verifică autentificarea ÎNAINTE de a inițializa pagina
    if (!checkPageAuthentication()) {
        return; // Oprește încărcarea dacă nu este autentificat
    }
    
    addAnimationStyles();
    homepageManager = new HomepageManager();
});
