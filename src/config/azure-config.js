/**
 * Azure AD Configuration Service
 * Manages Azure AD authentication setup and configuration
 */

// ========================================
// AZURE AD TENANT CONFIGURATION
// ========================================

const TENANT_CONFIG = {
    // 🚫 DISABLE AZURE AD: Set to true to completely disable Azure authentication
    disabled: false, // Set to true to skip all Azure AD authentication
    
    // ⚠️  CRITICAL: The mode here MUST match your Azure Portal app registration settings!
    
    // If you get "/common endpoint not supported" error, your app is registered as single-tenant
    // SOLUTION: Either change to single-tenant mode OR update Azure Portal to multi-tenant
    
    // Option 1: Single-tenant (RECOMMENDED if you get the /common error)
    mode: 'single-tenant',
    tenantId: '72b17115-9915-42c0-9f1b-4f98e5a4bcd2', // Replace with YOUR tenant ID from Azure Portal
    
    // Option 2: Multi-tenant (only if Azure Portal is configured as multi-tenant)
    // mode: 'multi-tenant',
    
    // Option 3: Organizations only (only if Azure Portal allows work accounts)
    // mode: 'organizations-only',
    
    clientId: "dd9e12c5-f62c-4303-bab8-824ac13e1f09", // Replace with your real clientId from Azure Portal
    
    // Optional: Your organization domain for better UX
    tenantDomain: 'localhost:3000' // Replace with your actual domain
};

/**
 * Configuration validation
 */
function validateTenantConfig() {
    const errors = [];
    const warnings = [];

    // Skip validation if Azure AD is disabled
    if (TENANT_CONFIG.disabled) {
        return { errors, warnings };
    }

    if (TENANT_CONFIG.mode === 'single-tenant') {
        if (!TENANT_CONFIG.tenantId) {
            errors.push('single-tenant mode requires a valid tenantId');
        }
    }

    if (!TENANT_CONFIG.clientId) {
        warnings.push('Please replace the placeholder clientId with your real Azure AD Application ID');
    }

    return { errors, warnings };
}

/**
 * Dynamic authority configuration based on mode
 */
function getAuthority() {
    switch (TENANT_CONFIG.mode) {
        case 'single-tenant':
            if (!TENANT_CONFIG.tenantId) {
                throw new Error('tenantId is required for single-tenant mode');
            }
            return `https://login.microsoftonline.com/${TENANT_CONFIG.tenantId}`;
        
        case 'organizations-only':
            return 'https://login.microsoftonline.com/organizations';
        
        case 'multi-tenant':
        default:
            return 'https://login.microsoftonline.com/common';
    }
}

/**
 * Dynamic scopes based on configuration
 */
function getScopes() {
    const baseScopes = ['User.Read'];
    
    if (TENANT_CONFIG.mode === 'single-tenant') {
        // Single tenant can request more permissions by default
        return [...baseScopes];
    } else if (TENANT_CONFIG.mode === 'organizations-only') {
        // Organizations only - moderate permissions
        return [...baseScopes];
    }
    
    return baseScopes;
}

/**
 * Get MSAL configuration object
 */
function getMsalConfig() {
    return {
        auth: {
            clientId: TENANT_CONFIG.clientId,
            authority: getAuthority(),
            redirectUri: 'http://localhost:3000',
            postLogoutRedirectUri: window.location.origin,
            navigateToLoginRequestUrl: false,
            // Tenant-specific configurations
            ...(TENANT_CONFIG.mode === 'single-tenant' && {
                knownAuthorities: [`${TENANT_CONFIG.tenantId}.b2clogin.com`],
                cloudDiscoveryMetadata: "",
                authorityMetadata: ""
            })
        },
        cache: {
            cacheLocation: "sessionStorage",
            storeAuthStateInCookie: false,
        },
        system: {
            loggerOptions: {
                loggerCallback: (level, message, containsPii) => {
                    if (containsPii) return;
                    console.log(`MSAL [${TENANT_CONFIG.mode.toUpperCase()}]: ${message}`);
                },
                piiLoggingEnabled: false,
                logLevel: typeof msal !== 'undefined' ? msal.LogLevel.Info : 3,
            },
            windowHashTimeout: 60000,
            iframeHashTimeout: 6000,
            loadFrameTimeout: 0
        }
    };
}

/**
 * Get login request configuration
 */
function getLoginRequest() {
    return {
        scopes: getScopes(),
        prompt: TENANT_CONFIG.mode === 'multi-tenant' ? 'select_account' : 'login',
        ...(TENANT_CONFIG.mode === 'single-tenant' && TENANT_CONFIG.tenantDomain && {
            loginHint: `@${TENANT_CONFIG.tenantDomain}`
        })
    };
}

// Export configuration for use by other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TENANT_CONFIG,
        validateTenantConfig,
        getAuthority,
        getScopes,
        getMsalConfig,
        getLoginRequest
    };
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.AzureConfig = {
        TENANT_CONFIG,
        validateTenantConfig,
        getAuthority,
        getScopes,
        getMsalConfig,
        getLoginRequest
    };
}