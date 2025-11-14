/**
 * Azure AD Authentication Service
 * Handles Microsoft authentication and tenant management
 */

class AzureAuthService {
    constructor() {
        this.msalInstance = null;
        this.currentAccount = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the Azure AD authentication service
     */
    async initialize() {
        try {
            // Check if Azure AD is disabled
            if (window.AzureConfig.TENANT_CONFIG.disabled) {
                console.log('🚫 Azure AD authentication is DISABLED');
                this.handleDisabledAuth();
                return;
            }

            // Validate configuration
            const validation = window.AzureConfig.validateTenantConfig();
            if (validation.errors.length > 0) {
                console.error('❌ Configuration errors:', validation.errors);
                throw new Error(`Configuration errors: ${validation.errors.join(', ')}`);
            }
            if (validation.warnings.length > 0) {
                console.warn('⚠️ Configuration warnings:', validation.warnings);
            }

            console.log(`🔐 Azure AD Configuration: ${window.AzureConfig.TENANT_CONFIG.mode.toUpperCase()} mode`);
            console.log(`🎯 Authority: ${window.AzureConfig.getAuthority()}`);

            // Initialize MSAL
            this.msalInstance = new msal.PublicClientApplication(window.AzureConfig.getMsalConfig());
            
            // Update UI
            this.updateLoadingMessage();
            this.updateAuthConfigDisplay();

            // Handle redirect promise
            await this.handleRedirectResponse();
            
            this.isInitialized = true;
            console.log('✅ Azure AD service initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Azure AD service:', error);
            this.handleAuthError(error);
        }
    }

    /**
     * Handle disabled authentication
     */
    handleDisabledAuth() {
        const msalContainer = document.getElementById('msal-login-container');
        if (msalContainer) {
            msalContainer.style.display = 'none';
        }
        
        const authConfigDiv = document.querySelector('.auth-config');
        if (authConfigDiv) {
            authConfigDiv.innerHTML = `
                <div style="text-align: center; padding: 2rem; background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; margin: 1rem 0;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">🚫</div>
                    <h3 style="color: #6c757d; margin-bottom: 1rem;">Azure AD Authentication Disabled</h3>
                    <p style="color: #6c757d; margin: 0;">Authentication has been disabled in the configuration.</p>
                    <p style="color: #6c757d; font-size: 0.9rem; margin-top: 0.5rem;">
                        Set <code>TENANT_CONFIG.disabled = false</code> to enable Azure AD login.
                    </p>
                </div>
            `;
        }
    }

    /**
     * Handle redirect response from Azure AD
     */
    async handleRedirectResponse() {
        try {
            const response = await this.msalInstance.handleRedirectPromise();
            let account = null;
            
            if (response && response.account) {
                account = response.account;
                console.log('Login successful via redirect:', account.tenantId);
            } else {
                const currentAccounts = this.msalInstance.getAllAccounts();
                if (currentAccounts.length > 0) {
                    account = this.selectBestAccount(currentAccounts);
                    console.log('Existing session found:', account?.tenantId);
                }
            }
            
            if (account) {
                this.currentAccount = account;
                this.showUser(account);
                
                // Emit custom event for other components to listen to
                document.dispatchEvent(new CustomEvent('azure-auth-success', {
                    detail: {
                        account: account,
                        tenantId: account.tenantId,
                        isMultiTenant: true
                    }
                }));
            } else {
                console.log('No authenticated session found, initiating login...');
                this.initiateLogin();
            }
            
        } catch (error) {
            console.error("Azure AD MSAL error:", error);
            this.handleAuthError(error);
        }
    }

    /**
     * Select the best account from multiple accounts
     */
    selectBestAccount(accounts) {
        if (accounts.length === 0) return null;
        if (accounts.length === 1) return accounts[0];
        
        // Prefer accounts from the same tenant if multiple exist
        const currentDomain = window.location.hostname;
        return accounts.find(acc => acc.username.includes(currentDomain)) || accounts[0];
    }

    /**
     * Display user information
     */
    showUser(account) {
        const userInfo = document.getElementById("msal-user-info");
        const logoutBtn = document.getElementById("msal-logout-btn");
        const loadingDiv = document.getElementById("msal-loading");

        if (!userInfo || !logoutBtn || !loadingDiv) return;

        const tenantId = account.tenantId;
        const tenantName = this.getTenantDisplayName(account);
        const userDisplayName = account.name || account.username || 'Unknown User';
        const authMode = window.AzureConfig.TENANT_CONFIG.mode.replace('-', ' ').toUpperCase();
        const modeIcon = {
            'single-tenant': '🏢',
            'multi-tenant': '🌐', 
            'organizations-only': '🏛️'
        }[window.AzureConfig.TENANT_CONFIG.mode] || '🔐';
        
        userInfo.innerHTML = `
            <div style="font-weight: 600; color: #0078d4; margin-bottom: 0.5rem;">
                👤 ${userDisplayName}
            </div>
            <div style="font-size: 0.85rem; color: #666; margin-bottom: 0.25rem;">
                🏢 ${tenantName}
            </div>
            <div style="font-size: 0.75rem; color: #999; margin-bottom: 0.25rem;">
                Tenant: ${tenantId.substring(0, 8)}...
            </div>
            <div style="font-size: 0.7rem; color: #007acc; background: #f0f8ff; padding: 0.25rem 0.5rem; border-radius: 12px; display: inline-block;">
                ${modeIcon} ${authMode} MODE
            </div>
        `;
        
        userInfo.style.display = "inline-block";
        logoutBtn.style.display = "inline-block";
        loadingDiv.style.display = "none";
        
        // Store enhanced tenant info globally for use by other components
        window.currentTenant = {
            tenantId: tenantId,
            tenantName: tenantName,
            user: account,
            authMode: window.AzureConfig.TENANT_CONFIG.mode,
            authority: window.AzureConfig.getAuthority(),
            scopes: window.AzureConfig.getLoginRequest().scopes
        };
        
        console.log('Authentication successful:', {
            user: userDisplayName,
            tenant: tenantName,
            tenantId: tenantId
        });
    }

    /**
     * Get tenant display name
     */
    getTenantDisplayName(account) {
        const tenantId = account.tenantId;
        const username = account.username || '';
        const authMode = window.AzureConfig.TENANT_CONFIG.mode;
        
        // Handle single-tenant mode
        if (authMode === 'single-tenant') {
            if (window.AzureConfig.TENANT_CONFIG.tenantDomain) {
                return `${window.AzureConfig.TENANT_CONFIG.tenantDomain} (Single Tenant)`;
            }
            return `Single Tenant (${tenantId.substring(0, 8)}...)`;
        }
        
        // Handle known Microsoft tenant IDs
        const knownTenants = {
            '9188040d-6c67-4c5b-b112-36a304b66dad': 'Personal Microsoft Account',
            'f8cdef31-a31e-4b4a-93e4-5f571e91255a': 'Microsoft Corporation',
            '72f988bf-86f1-41af-91ab-2d7cd011db47': 'Microsoft Corporation'
        };
        
        if (knownTenants[tenantId]) {
            return knownTenants[tenantId];
        }
        
        // Personal account detection
        const personalDomains = ['@outlook.com', '@hotmail.com', '@live.com', '@msn.com'];
        if (personalDomains.some(domain => username.includes(domain))) {
            return authMode === 'organizations-only' ? 'Invalid Account Type' : 'Personal Microsoft Account';
        }
        
        // Business account detection
        if (username.includes('@')) {
            const domain = username.split('@')[1] || 'Unknown Domain';
            const orgName = domain.split('.')[0];
            const capitalizedOrg = orgName.charAt(0).toUpperCase() + orgName.slice(1);
            
            if (authMode === 'organizations-only') {
                return `${capitalizedOrg} Organization (Work Account)`;
            } else {
                return `${capitalizedOrg} Organization`;
            }
        }
        
        // Fallback
        return authMode === 'single-tenant' ? 'Authorized Tenant' : 'External Organization';
    }

    /**
     * Update loading message based on configuration
     */
    updateLoadingMessage() {
        const loadingDiv = document.getElementById("msal-loading");
        if (!loadingDiv) return;

        const modeMessages = {
            'single-tenant': 'Single-tenant authentication in progress',
            'multi-tenant': 'Multi-tenant authentication in progress', 
            'organizations-only': 'Organization-only authentication in progress'
        };
        
        const modeIcons = {
            'single-tenant': '🏢',
            'multi-tenant': '🌐',
            'organizations-only': '🏛️'
        };
        
        const loadingContent = `
            <div style="color: #0078d4; font-size: 1rem; text-align: center;">
                🔄 Authenticating with Microsoft...<br>
                <small style="color: #666; margin-top: 0.5rem; display: block;">
                    ${modeIcons[window.AzureConfig.TENANT_CONFIG.mode]} ${modeMessages[window.AzureConfig.TENANT_CONFIG.mode]}
                </small>
            </div>
        `;
        
        loadingDiv.innerHTML = loadingContent;
    }

    /**
     * Update authentication configuration display
     */
    updateAuthConfigDisplay() {
        const authConfigDiv = document.getElementById('auth-config-display');
        if (!authConfigDiv) return;
        
        const modeDescriptions = {
            'single-tenant': 'Restricted to specific tenant only',
            'multi-tenant': 'Accepts users from any Azure AD tenant + personal accounts',
            'organizations-only': 'Work/school accounts only (no personal accounts)'
        };
        
        const modeIcons = {
            'single-tenant': '🏢',
            'multi-tenant': '🌐',
            'organizations-only': '🏛️'
        };
        
        const authMode = window.AzureConfig.TENANT_CONFIG.mode.replace('-', ' ').toUpperCase();
        const authority = window.AzureConfig.getAuthority();
        const scopes = window.AzureConfig.getScopes();
        
        const warningMessage = window.AzureConfig.TENANT_CONFIG.mode === 'multi-tenant' ? 
            `<div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 0.75rem; border-radius: 4px; margin-top: 0.5rem; font-size: 0.8rem; color: #856404;">
                ⚠️ If you get "/common endpoint not supported" error, your Azure app is registered as single-tenant.<br>
                <strong>Solution:</strong> Change mode to 'single-tenant' or update Azure Portal to multi-tenant.
            </div>` : '';

        authConfigDiv.innerHTML = `
            <div style="font-weight: 600; color: #007acc; margin-bottom: 0.75rem;">
                🔐 Authentication Configuration
            </div>
            <div style="background: white; padding: 1rem; border-radius: 6px; margin-bottom: 0.5rem;">
                <div style="font-weight: 600; color: #333; margin-bottom: 0.5rem;">
                    ${modeIcons[window.AzureConfig.TENANT_CONFIG.mode]} ${authMode} MODE
                </div>
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">
                    ${modeDescriptions[window.AzureConfig.TENANT_CONFIG.mode]}
                </div>
                <div style="font-size: 0.75rem; color: #999;">
                    Authority: ${authority.replace('https://login.microsoftonline.com/', '')}<br>
                    Scopes: ${scopes.join(', ')}
                </div>
                ${warningMessage}
            </div>
        `;
    }

    /**
     * Show loading state
     */
    showLoading() {
        const userInfo = document.getElementById("msal-user-info");
        const logoutBtn = document.getElementById("msal-logout-btn");
        const loadingDiv = document.getElementById("msal-loading");

        if (userInfo) userInfo.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "none";
        if (loadingDiv) loadingDiv.style.display = "block";
    }

    /**
     * Initiate login process
     */
    initiateLogin() {
        this.showLoading();
        const loginRequest = window.AzureConfig.getLoginRequest();
        this.msalInstance.loginRedirect(loginRequest);
    }

    /**
     * Handle logout
     */
    logout() {
        // Clear tenant info
        delete window.currentTenant;
        
        // Emit logout event
        document.dispatchEvent(new CustomEvent('azure-auth-logout', {
            detail: { isMultiTenant: true }
        }));
        
        this.msalInstance.logoutRedirect({
            postLogoutRedirectUri: window.location.origin
        }).catch((error) => {
            console.error("Logout error:", error);
            // Force reload to clear all state
            window.location.reload();
        });
    }

    /**
     * Handle authentication errors
     */
    handleAuthError(error) {
        const loadingDiv = document.getElementById('msal-loading');
        if (!loadingDiv) return;

        if (error.errorMessage && error.errorMessage.includes('/common endpoint') || 
            error.errorMessage && error.errorMessage.includes('not supported for such applications')) {
            
            console.error('❌ /common endpoint error detected - App registration mismatch!');
            loadingDiv.innerHTML = `
                <div style="color: #d83b01; padding: 1.5rem; text-align: center; background: #fdf2f2; border-radius: 8px; border-left: 4px solid #d83b01;">
                    <div style="font-weight: 600; margin-bottom: 1rem;">⚠️ Configuration Error</div>
                    <div style="margin-bottom: 1rem; font-size: 0.9rem;">
                        The /common endpoint is not supported for your application.
                    </div>
                    <div style="font-size: 0.85rem; text-align: left; background: white; padding: 1rem; border-radius: 4px;">
                        <strong>Solutions:</strong><br><br>
                        <strong>Option 1 (Recommended):</strong> Use single-tenant mode<br>
                        • Update TENANT_CONFIG.mode to 'single-tenant'<br>
                        • Set your tenantId in the configuration<br><br>
                        <strong>Option 2:</strong> Change Azure Portal settings<br>
                        • Go to Azure Portal → App Registrations<br>
                        • Select your app → Authentication<br>
                        • Change "Supported account types" to multi-tenant
                    </div>
                </div>
            `;
            
        } else if (error.errorCode === 'consent_required' || error.errorCode === 'interaction_required') {
            console.log('Admin consent required for application');
            loadingDiv.innerHTML = `
                <div style="color: #d83b01; padding: 1rem; text-align: center;">
                    ⚠️ Admin consent required<br>
                    <small>This application requires administrator approval for your organization.</small>
                </div>
            `;
            
        } else if (error.errorCode === 'invalid_tenant') {
            console.error('❌ Invalid tenant ID in configuration');
            loadingDiv.innerHTML = `
                <div style="color: #d83b01; padding: 1rem; text-align: center;">
                    ⚠️ Invalid tenant configuration<br>
                    <small>Please check your tenantId in TENANT_CONFIG.</small>
                </div>
            `;
            
        } else {
            console.log('Attempting login despite error...');
            // For other errors, still try to login
            this.initiateLogin();
        }
    }

    /**
     * Bind logout event handler
     */
    bindLogoutHandler() {
        const logoutBtn = document.getElementById("msal-logout-btn");
        if (logoutBtn) {
            logoutBtn.onclick = () => this.logout();
        }
    }

    /**
     * Get current authenticated account
     */
    getCurrentAccount() {
        return this.currentAccount;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentAccount !== null;
    }
}

// Utility functions for global access
window.getCurrentTenant = function() {
    return window.currentTenant || null;
};

window.hasPermission = function(permission) {
    const tenant = window.currentTenant;
    if (!tenant) return false;
    
    // Add custom logic here based on your application's needs
    // This could integrate with Azure AD roles, app roles, etc.
    return true; // Default allow for demo purposes
};

// Simple function that does nothing (as requested)
function hurryupjeff() {
    // This function does nothing
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AzureAuthService;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.AzureAuthService = AzureAuthService;
}