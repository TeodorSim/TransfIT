
class FormUtils {
    /**
     * Validează câmpul de email/username pentru formular
     * - Verifică dacă valoarea nu este goală
     * - Returnează status de validare și mesaj de eroare
     * @param {string} value - Valoarea de validat
     * @returns {Object} - {isValid: boolean, message: string}
     */
    static validateEmail(value) {
        if (!value) {
            return { isValid: false, message: 'Datele de logare sunt invalide' };
        }
        return { isValid: true };
    }
    
    /**
     * Validează câmpul de parolă pentru formular
     * - Verifică dacă valoarea nu este goală
     * - Returnează status de validare și mesaj de eroare
     * @param {string} value - Valoarea de validat
     * @returns {Object} - {isValid: boolean, message: string}
     */
    static validatePassword(value) {
        if (!value) {
            return { isValid: false, message: 'Datele de logare sunt invalide' };
        }
        return { isValid: true };
    }
    
    /**
     * Afișează mesaj de eroare pentru un câmp specific
     * - Adaugă clasă de eroare pentru styling vizual
     * - Afișează mesajul sub câmp
     * - Aplică animație shake pentru atenție vizuală
     * @param {string} fieldName - ID-ul câmpului de input
     * @param {string} message - Mesajul de eroare de afișat
     */
    static showError(fieldName, message) {
        const formGroup = document.getElementById(fieldName).closest('.form-group');
        const errorElement = document.getElementById(fieldName + 'Error');
        
        if (formGroup && errorElement) {
            formGroup.classList.add('error');
            errorElement.textContent = message;
            errorElement.classList.add('show');
            
            // Adaugă animație de shake la câmp
            const field = document.getElementById(fieldName);
            if (field) {
                field.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    field.style.animation = '';
                }, 500);
            }
        }
    }
    
    /**
     * Șterge mesajul de eroare pentru un câmp specific
     * - Elimină clasa de eroare
     * - Ascunde mesajul cu animație fade-out
     * @param {string} fieldName - ID-ul câmpului de input
     */
    static clearError(fieldName) {
        const formGroup = document.getElementById(fieldName).closest('.form-group');
        const errorElement = document.getElementById(fieldName + 'Error');
        
        if (formGroup && errorElement) {
            formGroup.classList.remove('error');
            errorElement.classList.remove('show');
            setTimeout(() => {
                errorElement.textContent = '';
            }, 300);
        }
    }
    
    static showSuccess(fieldName) {
        const field = document.getElementById(fieldName);
        const wrapper = field?.closest('.input-wrapper');
        
        if (wrapper) {
            // Adaugă indicație subtilă de succes
            wrapper.style.borderColor = '#22c55e';
            setTimeout(() => {
                wrapper.style.borderColor = '';
            }, 2000);
        }
    }
    
    /**
     * Simulează autentificarea utilizatorului (pentru dezvoltare/testare)
     * - Creează o întârziere artificială pentru a simula cererea de rețea
     * - Acceptă doar credențialele admin/admin
     * - Folosită când backend-ul nu este disponibil
     * @param {string} email - Email/username de testat
     * @param {string} password - Parola de testat
     * @returns {Promise} - Rezolvă cu {success, user} sau respinge cu Error
     */
    static simulateLogin(email, password) {
        return new Promise((resolve, reject) => {
            // Simulează întârzierea rețelei
            setTimeout(() => {
                // Acceptă doar admin/admin
                if (email === 'admin' && password === 'admin') {
                    resolve({ success: true, user: { email } });
                } else {
                    reject(new Error('Datele de logare sunt invalide'));
                }
            }, 2000);
        });
    }
    
    /**
     * Afișează o notificare temporară stilizată
     * - Creează un element vizual cu glassmorphism
     * - Aplică culori diferite bazate pe tip (error/success/info)
     * - Se auto-elimină după 3 secunde cu animație
     * @param {string} message - Mesajul de afișat
     * @param {string} type - Tipul notificării ('error', 'success', 'info')
     * @param {HTMLElement} container - Container-ul unde se inserează notificarea
     */
    static showNotification(message, type = 'info', container = null) {
        const targetContainer = container || document.querySelector('form');
        if (!targetContainer) return;
        
        // Creează elementul de notificare
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        let backgroundColor, borderColor, textColor;
        switch (type) {
            case 'error':
                backgroundColor = 'rgba(239, 68, 68, 0.1)';
                borderColor = 'rgba(239, 68, 68, 0.3)';
                textColor = '#ef4444';
                break;
            case 'success':
                backgroundColor = 'rgba(34, 197, 94, 0.1)';
                borderColor = 'rgba(34, 197, 94, 0.3)';
                textColor = '#22c55e';
                break;
            default:
                backgroundColor = 'rgba(6, 182, 212, 0.1)';
                borderColor = 'rgba(6, 182, 212, 0.3)';
                textColor = '#06b6d4';
        }
        
        notification.innerHTML = `
            <div style="
                background: ${backgroundColor}; 
                backdrop-filter: blur(10px); 
                border: 1px solid ${borderColor}; 
                border-radius: 12px; 
                padding: 12px 16px; 
                margin-top: 16px; 
                color: ${textColor}; 
                text-align: center;
                font-size: 14px;
                animation: slideIn 0.3s ease;
            ">
                ${message}
            </div>
        `;
        
        targetContainer.appendChild(notification);
        
        // Elimină notificarea după 3 secunde
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    /**
     * Configurează comportamentul label-urilor flotante pentru input-uri
     * - Label-ul se mută deasupra când câmpul are valoare
     * - Verifică starea inițială la încărcare
     * - Reacționează la schimbări în timp real
     * @param {HTMLFormElement} form - Formularul care conține input-urile
     */
    static setupFloatingLabels(form) {
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            // Verifică dacă câmpul are valoare la încărcarea paginii
            if (input.value.trim() !== '') {
                input.classList.add('has-value');
            }
            
            input.addEventListener('input', () => {
                if (input.value.trim() !== '') {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            });
        });
    }
    
    /**
     * Configurează butonul de toggle pentru vizibilitatea parolei
     * - Schimbă între type='password' și type='text'
     * - Animează iconița de ochi
     * - Păstrează focusul pe câmpul de parolă
     * @param {HTMLInputElement} passwordInput - Input-ul de parolă
     * @param {HTMLButtonElement} toggleButton - Butonul de toggle
     */
    static setupPasswordToggle(passwordInput, toggleButton) {
        if (toggleButton && passwordInput) {
            toggleButton.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                const eyeIcon = toggleButton.querySelector('.eye-icon');
                
                passwordInput.type = isPassword ? 'text' : 'password';
                if (eyeIcon) {
                    eyeIcon.classList.toggle('show-password', isPassword);
                }
                
                // Adaugă efect de tranziție lină
                toggleButton.style.transform = 'translateY(-50%) scale(0.9)';
                setTimeout(() => {
                    toggleButton.style.transform = 'translateY(-50%) scale(1)';
                }, 150);
                
                // Păstrează focusul pe câmpul de parolă
                passwordInput.focus();
            });
        }
    }
    
    static addEntranceAnimation(element, delay = 100) {
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, delay);
        }
    }
    
    /**
     * Adaugă stiluri CSS pentru animații partajate în document
     * - Verifică dacă stilurile există deja pentru a evita duplicarea
     * - Include animații pentru slide, shake, pulse, spin
     * - Folosit de toate componentele formularului
     */
    static addSharedAnimations() {
        // adaugă stilurile CSS pentru animații dacă nu sunt deja prezente
        if (!document.getElementById('shared-animations')) {
            const style = document.createElement('style');
            style.id = 'shared-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideOut {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(-10px); }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                @keyframes checkmarkPop {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
                
                @keyframes successPulse {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                @keyframes spin {
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
}