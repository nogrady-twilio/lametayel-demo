/* ===================================
   AUTHENTICATION FUNCTIONALITY
   User login, signup, and session management
   =================================== */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        this.setupFormHandlers();
        this.loadSession();
        this.setupSocialAuth();
    }
    
    setupFormHandlers() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(new FormData(loginForm));
            });
        }
        
        // Signup form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup(new FormData(signupForm));
            });
        }
        
        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSignup(new FormData(newsletterForm));
            });
        }
    }
    
    setupSocialAuth() {
        // Google login
        document.querySelectorAll('[data-provider="google"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleSocialLogin('google');
            });
        });
        
        // Facebook login
        document.querySelectorAll('[data-provider="facebook"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleSocialLogin('facebook');
            });
        });
    }
    
    loadSession() {
        const userData = sessionStorage.getItem('lametayel_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUI();
        }
    }
    
    handleLogin(formData) {
        const email = formData.get('login-email');
        const password = formData.get('login-password');
        
        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }
        
        if (!password || password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }
        
        // Show loading state
        this.setLoadingState('login-form', true);
        
        // Simulate API call
        setTimeout(() => {
            // Mock authentication - in real app, this would be an API call
            const userData = this.mockLogin(email, password);
            
            if (userData) {
                this.setUser(userData);
                this.closeModal('login-modal');
                this.showSuccess('Welcome back!');
                
                // Track login event
                if (window.lametayelTracking) {
                    window.lametayelTracking.trackEvent('User Logged In', {
                        login_method: 'email',
                        email_domain: email.split('@')[1]
                    });
                    
                    // Identify user
                    analytics.identify(userData.id, {
                        email: userData.email,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        login_timestamp: new Date().toISOString()
                    });
                }
            } else {
                this.showError('Invalid email or password');
            }
            
            this.setLoadingState('login-form', false);
        }, 1000);
    }
    
    handleSignup(formData) {
        const firstName = formData.get('signup-firstname');
        const lastName = formData.get('signup-lastname');
        const email = formData.get('signup-email');
        const password = formData.get('signup-password');
        const marketingConsent = formData.get('marketing-consent') === 'on';
        
        // Validation
        if (!firstName || firstName.length < 2) {
            this.showError('First name must be at least 2 characters');
            return;
        }
        
        if (!lastName || lastName.length < 2) {
            this.showError('Last name must be at least 2 characters');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }
        
        if (!password || password.length < 8) {
            this.showError('Password must be at least 8 characters');
            return;
        }
        
        if (!this.validatePassword(password)) {
            this.showError('Password must contain at least one number and one letter');
            return;
        }
        
        // Check if email is already used (mock check)
        if (this.isEmailTaken(email)) {
            this.showError('This email is already registered');
            return;
        }
        
        // Show loading state
        this.setLoadingState('signup-form', true);
        
        // Simulate API call
        setTimeout(() => {
            const userData = this.mockSignup({
                firstName,
                lastName,
                email,
                password,
                marketingConsent
            });
            
            this.setUser(userData);
            this.closeModal('signup-modal');
            this.showSuccess('Account created successfully!');
            
            // Track signup event
            if (window.lametayelTracking) {
                window.lametayelTracking.trackEvent('Account Created', {
                    signup_method: 'email',
                    email_domain: email.split('@')[1],
                    marketing_consent: marketingConsent
                });
                
                // Identify user
                analytics.identify(userData.id, {
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    created_at: new Date().toISOString(),
                    marketing_consent: marketingConsent
                });
            }
            
            // Update user traits
            if (window.userTraits) {
                window.userTraits.setSubscriberStatus(marketingConsent ? 'active' : 'inactive');
                window.userTraits.updateConsent('marketing_emails', marketingConsent);
            }
            
            this.setLoadingState('signup-form', false);
        }, 1500);
    }
    
    handleSocialLogin(provider) {
        // Show loading state
        const button = document.querySelector(`[data-provider="${provider}"]`);
        const originalText = button.textContent;
        button.textContent = 'Connecting...';
        button.disabled = true;
        
        // Simulate social login
        setTimeout(() => {
            const userData = this.mockSocialLogin(provider);
            
            this.setUser(userData);
            this.closeModal('login-modal');
            this.closeModal('signup-modal');
            this.showSuccess(`Signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`);
            
            // Track social login event
            if (window.lametayelTracking) {
                window.lametayelTracking.trackEvent('User Logged In', {
                    login_method: provider,
                    social_provider: provider
                });
                
                // Identify user
                analytics.identify(userData.id, {
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    social_login: provider,
                    login_timestamp: new Date().toISOString()
                });
            }
            
            // Reset button
            button.textContent = originalText;
            button.disabled = false;
        }, 1500);
    }
    
    handleNewsletterSignup(formData) {
        const email = formData.get('newsletter-email');
        
        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }
        
        // Show loading state
        const button = document.querySelector('#newsletter-form button');
        const originalText = button.textContent;
        button.textContent = 'Subscribing...';
        button.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Track newsletter signup
            if (window.lametayelTracking) {
                window.lametayelTracking.trackEvent('Newsletter Signup', {
                    signup_source: 'homepage_newsletter',
                    email_domain: email.split('@')[1]
                });
            }
            
            // Update user traits
            if (window.userTraits) {
                window.userTraits.setSubscriberStatus('pending');
                window.userTraits.updateConsent('marketing_emails', true);
            }
            
            this.showSuccess('Thank you for subscribing!');
            
            // Clear form
            document.getElementById('newsletter-email').value = '';
            
            // Reset button
            button.textContent = originalText;
            button.disabled = false;
        }, 1000);
    }
    
    // Mock authentication methods (replace with real API calls)
    
    mockLogin(email, password) {
        // Simulate some known users
        const mockUsers = [
            {
                email: 'demo@lametayel.com',
                password: 'demo123',
                firstName: 'Demo',
                lastName: 'User'
            },
            {
                email: 'test@example.com',
                password: 'test123',
                firstName: 'Test',
                lastName: 'User'
            }
        ];
        
        const user = mockUsers.find(u => u.email === email && u.password === password);
        if (user) {
            return {
                id: user.email,  // Use email as user ID
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                loginMethod: 'email',
                loginTimestamp: new Date().toISOString()
            };
        }
        
        // For demo purposes, allow any valid email/password combination
        if (password.length >= 6) {
            return {
                id: email,  // Use email as user ID
                email: email,
                firstName: email.split('@')[0],
                lastName: 'User',
                loginMethod: 'email',
                loginTimestamp: new Date().toISOString()
            };
        }
        
        return null;
    }
    
    mockSignup(userData) {
        return {
            id: userData.email,  // Use email as user ID
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            marketingConsent: userData.marketingConsent,
            loginMethod: 'email',
            createdAt: new Date().toISOString()
        };
    }
    
    mockSocialLogin(provider) {
        const mockSocialUsers = {
            google: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com'
            },
            facebook: {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@facebook.com'
            }
        };
        
        const userData = mockSocialUsers[provider];
        return {
            id: userData.email,  // Use email as user ID
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            loginMethod: provider,
            socialProvider: provider,
            loginTimestamp: new Date().toISOString()
        };
    }
    
    isEmailTaken(email) {
        // Mock check - in real app, this would be an API call
        const takenEmails = ['admin@lametayel.com', 'taken@example.com'];
        return takenEmails.includes(email.toLowerCase());
    }
    
    // User management methods
    
    setUser(userData) {
        this.currentUser = userData;
        sessionStorage.setItem('lametayel_user', JSON.stringify(userData));
        this.updateUI();
    }
    
    logout() {
        // Track logout event
        if (window.lametayelTracking) {
            window.lametayelTracking.trackEvent('User Logged Out', {
                logout_method: 'manual',
                session_duration: this.getSessionDuration()
            });
        }
        
        // Reset analytics
        if (window.analytics) {
            analytics.reset();
        }
        
        this.currentUser = null;
        sessionStorage.removeItem('lametayel_user');
        
        // Clear user-specific data
        localStorage.removeItem('lametayel_user_traits');
        
        this.updateUI();
        this.showSuccess('You have been logged out');
    }
    
    updateUI() {
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const userAvatar = document.getElementById('user-avatar');
        
        if (this.currentUser) {
            // Show user menu, hide auth buttons
            if (authButtons) authButtons.classList.add('hidden');
            if (userMenu) userMenu.classList.remove('hidden');
            
            // Update user avatar with initials
            if (userAvatar) {
                const initials = (this.currentUser.firstName?.[0] || '') + 
                                (this.currentUser.lastName?.[0] || '');
                userAvatar.innerHTML = `<span>${initials}</span>`;
            }
        } else {
            // Show auth buttons, hide user menu
            if (authButtons) authButtons.classList.remove('hidden');
            if (userMenu) userMenu.classList.add('hidden');
        }
    }
    
    // Validation methods
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    validatePassword(password) {
        // At least 8 characters, at least one letter and one number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
        return passwordRegex.test(password);
    }
    
    // UI helper methods
    
    setLoadingState(formId, loading) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input');
        
        if (loading) {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Please wait...';
            }
            inputs.forEach(input => input.disabled = true);
        } else {
            if (submitBtn) {
                submitBtn.disabled = false;
                // Restore original text
                const trackAction = submitBtn.getAttribute('data-track');
                if (trackAction === 'login-submit') {
                    submitBtn.textContent = 'Sign In';
                } else if (trackAction === 'signup-submit') {
                    submitBtn.textContent = 'Create Account';
                }
            }
            inputs.forEach(input => input.disabled = false);
        }
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showNotification(message, type = 'info') {
        if (window.lametayelApp) {
            window.lametayelApp.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
    
    closeModal(modalId) {
        if (window.lametayelApp) {
            window.lametayelApp.closeModal(modalId);
        }
    }
    
    getSessionDuration() {
        if (!this.currentUser) return 0;
        
        const loginTime = new Date(this.currentUser.loginTimestamp || Date.now());
        return Math.round((Date.now() - loginTime.getTime()) / 1000);
    }
    
    // Public API methods
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isLoggedIn() {
        return !!this.currentUser;
    }
    
    getUserId() {
        return this.currentUser?.id || null;
    }
    
    getUserEmail() {
        return this.currentUser?.email || null;
    }
    
    getUserName() {
        if (!this.currentUser) return null;
        return `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim();
    }
}

// Initialize auth manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
    console.log('Auth manager initialized');
});