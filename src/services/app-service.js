/**
 * Main Application Service
 * Handles application initialization, navigation, and global state
 */

class ProteusApp {
    constructor() {
        this.currentPage = 'welcome';
        this.azureAuth = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🚀 Initializing Proteus Chi Monitor...');
            
            // Initialize Azure Authentication Service
            if (typeof window.AzureAuthService !== 'undefined') {
                this.azureAuth = new window.AzureAuthService();
                await this.azureAuth.initialize();
            }
            
            // Bind event handlers
            this.bindEvents();
            
            // Initialize UI
            this.hideLoadingScreen();
            
            // Check backend connection
            await this.checkBackendConnection();
            
            this.isInitialized = true;
            console.log('✅ Proteus Chi Monitor initialized successfully!');
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showNotification('danger', 'Failed to initialize application', 'Initialization Error');
        }
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            });
        });

        // Mobile menu toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        navToggle?.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu?.classList.remove('active');
            });
        });

        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Application error:', e.error);
            this.showNotification('danger', 'An unexpected error occurred', 'Error');
        });

        // Listen for custom events from components
        document.addEventListener('api-success', (e) => {
            console.log('API Success:', e.detail);
        });

        document.addEventListener('api-error', (e) => {
            console.error('API Error:', e.detail);
            this.showNotification('warning', 'API request failed. Please check your connection.', 'Connection Issue');
        });

        // Azure AD event listeners
        document.addEventListener('azure-auth-success', (e) => {
            console.log('Azure AD authentication successful:', e.detail);
            this.showNotification('success', 'Successfully authenticated with Azure AD', 'Authentication Success');
        });

        document.addEventListener('azure-auth-logout', (e) => {
            console.log('Azure AD logout:', e.detail);
            this.showNotification('info', 'Successfully logged out', 'Logout');
        });

        // Bind Azure logout handler if service exists
        if (this.azureAuth) {
            this.azureAuth.bindLogoutHandler();
        }
    }

    /**
     * Navigate to a specific page
     */
    navigateTo(page) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Show corresponding page
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });
        const activePage = document.getElementById(`${page}-page`);
        if (activePage) {
            activePage.classList.add('active');
        }

        this.currentPage = page;

        // Update page title
        const titles = {
            'welcome': '🚀 Proteus Chi Monitor - Home',
            'dashboard': '📊 Dashboard - Proteus Chi Monitor',
            'buttons': '🎯 Buttons - Proteus Chi Monitor',
            'forms': '📝 Forms - Proteus Chi Monitor',
            'data': '📋 Data Display - Proteus Chi Monitor',
            'modals': '🗂️ Modals - Proteus Chi Monitor',
            'das-health': '🏥 DAS Health - Proteus Chi Monitor',
        };
        document.title = titles[page] || '🚀 Proteus Chi Monitor';

        // Emit navigation event for other components to listen to
        document.dispatchEvent(new CustomEvent('app-navigation', {
            detail: { 
                previousPage: this.currentPage,
                currentPage: page 
            }
        }));
    }

    /**
     * Hide loading screen with animation
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        
        if (!loadingScreen) {
            console.warn('Loading screen not found');
            return;
        }
        
        // Simulate loading time
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            }, 500);
        }, 1500);
    }

    /**
     * Check backend server connection
     */
    async checkBackendConnection() {
        try {
            const response = await fetch('/api/dashboard/stats');
            if (response.ok) {
                this.showNotification('success', 'Backend connection established', 'System Ready');
                return true;
            } else {
                throw new Error('Backend not responding');
            }
        } catch (error) {
            console.warn('Backend connection failed:', error);
            this.showNotification('warning', 'Backend server not available. Some features may be limited.', 'Connection Warning');
            return false;
        }
    }

    /**
     * Show notification to user
     */
    showNotification(type, message, title = '') {
        // Try to use Chi notification if available
        if (typeof chi !== 'undefined' && chi.notification) {
            const notification = document.createElement('chi-notification');
            notification.setAttribute('type', type);
            notification.setAttribute('title', title);
            notification.setAttribute('autoshow', 'true');
            notification.setAttribute('duration', '5000');
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            // Remove from DOM after hide
            notification.addEventListener('chi-notification-hide', () => {
                notification.remove();
            });
        } else {
            // Fallback to console and simple alert for critical messages
            console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
            if (type === 'danger') {
                alert(`${title}: ${message}`);
            }
        }
    }

    /**
     * Get current page
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Check if backend is available
     */
    async isBackendAvailable() {
        try {
            const response = await fetch('/api/dashboard/stats');
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get application state
     */
    getState() {
        return {
            currentPage: this.currentPage,
            isInitialized: this.isInitialized,
            isAuthenticated: this.azureAuth ? this.azureAuth.isAuthenticated() : false,
            currentTenant: window.getCurrentTenant ? window.getCurrentTenant() : null
        };
    }

    /**
     * Refresh application data
     */
    async refresh() {
        console.log('🔄 Refreshing application data...');
        
        // Emit refresh event for components to listen to
        document.dispatchEvent(new CustomEvent('app-refresh', {
            detail: { timestamp: Date.now() }
        }));

        // Re-check backend connection
        await this.checkBackendConnection();
        
        this.showNotification('info', 'Application data refreshed', 'Refresh Complete');
    }

    /**
     * Handle application shutdown/cleanup
     */
    shutdown() {
        console.log('🔄 Shutting down application...');
        
        // Cleanup event listeners
        // Note: In a real application, you'd want to track and remove all event listeners
        
        // Clear any timers or intervals
        // Clear any cached data
        
        this.isInitialized = false;
        console.log('✅ Application shutdown complete');
    }
}

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Optional: Register service worker for offline functionality
        console.log('Service Worker support detected');
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProteusApp;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ProteusApp = ProteusApp;
}