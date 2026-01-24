// TransfIT Homepage - Funcționalități Card-uri
// Acest fișier conține gestionarea interacțiunilor cu card-urile de pe pagina principală

class HomepageManager {
    constructor() {
        this.navItems = document.querySelectorAll('.nav-item');
        // Bază de date mock pentru programări (ulterior va fi înlocuită cu API real)
        this.mockAppointments = [
            { patient: 'Popescu Ion', date: '2026-01-20', time: '10:00', details: 'Consultație fizioterapie' },
            { patient: 'Ionescu Maria', date: '2026-01-22', time: '14:30', details: 'Tratament recuperare post-operatorie' },
            { patient: 'Georgescu Andrei', date: '2026-01-23', time: '09:00', details: 'Masaj terapeutic' },
            { patient: 'Popescu Ion', date: '2026-01-24', time: '11:00', details: 'Control fizioterapie' },
            { patient: 'Dumitrescu Elena', date: '2026-01-25', time: '16:00', details: 'Kinetoterapie' }
        ];
        this.init();
    }

    init() {
        this.setupNavListeners();
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

    handleProgramare() {
        console.log('Afișare formular creare programare');
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="content-header">
                <h1>Creare programare</h1>
                <p>Completați formularul de mai jos pentru a crea o programare nouă.</p>
            </div>
            <div class="form-layout">
                <div class="form-container">
                    <div class="last-input">
                        <input type="text" id="last-appointment-input" placeholder="Nume pacient (ex: Popescu Ion)" aria-label="Nume pacient" />
                        <button id="save-appointment-btn" class="btn-primary" aria-label="Caută ultima programare">Caută</button>
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
                    <div class="last-appointment-banner" id="last-appointment-banner" aria-live="polite">
                        Ultima programare: niciuna încă.
                    </div>
                    <iframe
                        src="https://calendar.google.com/calendar/embed?src=en.romanian%23holiday%40group.v.calendar.google.com&ctz=Europe/Bucharest"
                        class="calendar-iframe"
                        frameborder="0"
                        scrolling="no"
                        title="Calendar test">
                    </iframe>
                </div>
            </div>
        `;

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
                this.searchPatientAppointment(patientName, bannerEl);
            });
            // Permite căutarea cu Enter
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    btn.click();
                }
            });
        }
    }

    handleStergere() {
        console.log('Funcționalitate Ștergere programare - Va fi implementată');
        // TODO: Redirect către pagina de ștergere programare
        // window.location.href = 'stergere.html';
        
        this.showNotification('Ștergere programare - Funcționalitate în dezvoltare', 'info');
    }

    // Căutare programare pacient (API PostgreSQL)
    async searchPatientAppointment(patientName, bannerEl) {
        const API_URL = 'http://localhost:8000';
        
        // Afișează loading
        bannerEl.innerHTML = `<strong>Se caută...</strong> ${patientName}`;
        
        try {
            const response = await fetch(`${API_URL}/api/appointments/search/${encodeURIComponent(patientName)}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    bannerEl.innerHTML = `
                        <strong>Pacient:</strong> ${patientName}<br>
                        <span style="color: #ef4444;">Nu s-au găsit programări.</span>
                    `;
                    this.showNotification('Nu s-au găsit programări pentru acest pacient', 'info');
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            const lastApt = data.last_appointment;
            
            // Afișează ultima programare
            const dateFormatted = new Date(lastApt.date).toLocaleDateString('ro-RO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            bannerEl.innerHTML = `
                <strong>Pacient:</strong> ${data.patient_name}<br>
                <strong>Data:</strong> ${dateFormatted} la ${lastApt.time}<br>
                <strong>Detalii:</strong> ${lastApt.details}
            `;
            
            this.showNotification(`Găsit: ${data.total_appointments} programare/programări`, 'success');
            
        } catch (error) {
            console.error('Eroare la căutarea programării:', error);
            bannerEl.innerHTML = `
                <strong>Eroare:</strong> Nu s-a putut conecta la server.<br>
                <span style="color: #ef4444;">Verifică dacă backend-ul rulează pe ${API_URL}</span>
            `;
            this.showNotification('Eroare de conexiune la API', 'error');
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
    
    getUserData() {
        // TODO: Obține datele utilizatorului din localStorage sau API
        return {
            name: 'Utilizator',
            email: 'user@example.com'
        };
    }

    checkAuthentication() {
        // TODO: Verifică dacă utilizatorul este autentificat
        return true;
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

// Inițializează homepage manager la încărcarea paginii
document.addEventListener('DOMContentLoaded', () => {
    addAnimationStyles();
    new HomepageManager();
});
