
// Formular Login 1 - JavaScript cu Stil Glassmorphism
// Acest fișier extinde form-utils.js cu funcționalități specifice formularului

class LoginForm1 {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.submitBtn = document.querySelector('.login-btn');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.passwordInput = document.getElementById('password');
        this.isSubmitting = false;

        console.log('Constructor - submitBtn:', this.submitBtn);

        this.validators = {
            email: FormUtils.validateEmail,
            password: FormUtils.validatePassword
        };

        this.init();
    }

    async init() {
        // Check if already logged in
        if (window.authManager && await authManager.isAuthenticated()) {
            window.location.href = '../Homepage Rep/Homepage.html';
            return;
        }

        this.addEventListeners();
        FormUtils.setupFloatingLabels(this.form);
        this.addInputAnimations();
        FormUtils.setupPasswordToggle(this.passwordInput, this.passwordToggle);
        this.setupSocialButtons();
        this.initializeGoogleSignIn();
        FormUtils.addSharedAnimations();
    }

    async initializeGoogleSignIn() {
        try {
            if (!window.google) {
                setTimeout(() => this.initializeGoogleSignIn(), 500);
                return;
            }

            await window.authManager.initGoogleAuth();
            window.authManager.renderGoogleButton('google-signin-button');
            
            console.log('Google Sign-In initialized');
        } catch (error) {
            console.error('Google init failed:', error);
            const fallbackBtn = document.getElementById('google-btn-fallback');
            if (fallbackBtn) fallbackBtn.style.display = 'flex';
        }
    }

    addEventListeners() {
        // Trimiterea formularului
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Efecte de focus îmbunătățite
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => this.handleFocus(e));
            input.addEventListener('blur', (e) => this.handleBlur(e));
        });

        // Animație pentru checkbox-ul Ține-mă minte
        const checkbox = document.getElementById('remember');
        if (checkbox) {
            checkbox.addEventListener('change', () => this.animateCheckbox());
        }

        // Link Ai uitat parola
        const forgotLink = document.querySelector('.forgot-password');
        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => this.handleForgotPassword(e));
        }

        // Link Înregistrare
        const signupLink = document.querySelector('.signup-link a');
        if (signupLink) {
            signupLink.addEventListener('click', (e) => this.handleSignupLink(e));
        }

        // Scurtături tastatură
        this.setupKeyboardShortcuts();
    }

    addInputAnimations() {
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach((input, index) => {
            // Animație eșalonată la încărcarea paginii
            setTimeout(() => {
                input.style.opacity = '1';
                input.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }

    setupSocialButtons() {
        const fallbackBtn = document.getElementById('google-btn-fallback');
        if (fallbackBtn) {
            fallbackBtn.addEventListener('click', (e) => this.handleSocialLogin(e));
        }
    }

    handleFocus(e) {
        const wrapper = e.target.closest('.input-wrapper');
        if (wrapper) {
            wrapper.classList.add('focused');
        }
    }

    handleBlur(e) {
        const wrapper = e.target.closest('.input-wrapper');
        if (wrapper) {
            wrapper.classList.remove('focused');
        }
    }

    animateCheckbox() {
        const checkmark = document.querySelector('.checkmark');
        if (checkmark) {
            checkmark.style.animation = 'bounceIn 0.3s ease-out';
            setTimeout(() => {
                checkmark.style.animation = '';
            }, 300);
        }
    }

    handleForgotPassword(e) {
        e.preventDefault();
        FormUtils.showNotification('Funcționalitatea "Ai uitat parola?" va fi implementată în curând.', 'info', this.form);
    }

    handleSignupLink(e) {
        e.preventDefault();
        FormUtils.showNotification('Funcționalitatea de înregistrare va fi implementată în curând.', 'info', this.form);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter pentru a trimite
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.form.dispatchEvent(new Event('submit'));
            }
        });
    }

    handleSocialLogin(e) {
        FormUtils.showNotification('Google OAuth is configured! Use the Google button above.', 'info', this.form);
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) return;

        const isValid = this.validateForm();

        if (isValid) {
            await this.submitForm();
        } else {
            this.shakeForm();
        }
    }

    validateForm() {
        let isValid = true;

        Object.keys(this.validators).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(fieldName) {
        const field = document.getElementById(fieldName);
        const validator = this.validators[fieldName];

        if (!field || !validator) return true;

        const result = validator(field.value.trim(), field);

        if (result.isValid) {
            FormUtils.clearError(fieldName);
            FormUtils.showSuccess(fieldName);
        } else {
            FormUtils.showError(fieldName, result.message);
        }

        return result.isValid;
    }

    shakeForm() {
        this.form.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            this.form.style.animation = '';
        }, 500);
    }

    async submitForm() {
        this.isSubmitting = true;
        this.submitBtn.classList.add('loading');

        try {
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const rememberMe = document.getElementById('remember').checked;

            // Use authManager for login (saves session with encryption)
            await window.authManager.login(email, password);
            
            if (rememberMe) {
                await window.authManager.extendSession(true);
            }

            this.showSuccessMessage();

        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError(error.message);
        } finally {
            this.isSubmitting = false;
            this.submitBtn.classList.remove('loading');
        }
    }

    showSuccessMessage() {
        window.location.href = '../Homepage Rep/Homepage.html';
    }

    showLoginError(message) {
        FormUtils.showNotification(message || 'Conectare eșuată. Încercați din nou.', 'error', this.form);

        // Tremură cardul la eroare
        const card = document.querySelector('.login-card');
        card.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            card.style.animation = '';
        }, 500);
    }

    resetForm() {
        this.successMessage.classList.remove('show');

        setTimeout(() => {
            this.form.style.display = 'block';
            this.form.style.opacity = '1';
            this.form.style.transform = 'translateY(0)';

            const elementsToShow = ['.divider', '.social-login', '.signup-link'];
            elementsToShow.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    element.style.display = 'block';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            });

            this.form.reset();
            FormUtils.clearError('email');
            FormUtils.clearError('password');
        }, 300);
    }
}

// Inițializează formularul la încărcarea paginii
document.addEventListener('DOMContentLoaded', () => {
    new LoginForm1();
});