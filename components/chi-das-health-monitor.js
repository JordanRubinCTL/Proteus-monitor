/**
 * DAS Health Monitor Component
 * Displays health status from DAS monitoring endpoint with basic authentication
 * 
 * CURRENT CONFIGURATION: PROXY MODE
 * ----------------------------------
 * Using server-side proxy to avoid CORS issues
 * Proxy endpoint: /api/das-health-proxy
 * Target: https://dasprod1.corp.intranet/restricted/dasmon.pl/v1/health
 */

class ChiDasHealthMonitor extends ChiComponent {
    constructor() {
        super();
        
        // Configuration for DAS endpoint
        this.config = {
            // Proxy endpoint to avoid CORS issues
            endpoint: '/api/das-health-proxy',
            // Direct endpoint
            directEndpoint: 'https://dasprod1.corp.intranet/restricted/dasmon.pl/v1/health',
            username: 'dasuser',
            password: 'D@su$eR',
            refreshInterval: 300000 // Refresh every 300 seconds
        };
        
        this.healthData = null;
        this.isLoading = true;
        this.error = null;
        this.refreshTimer = null;
        
        // Load Chi CSS into shadow DOM
        this.loadChiCSS();
    }
    
    /**
     * Load Chi CSS into shadow DOM (same version as main app)
     */
    loadChiCSS() {
        const chiCSS = document.createElement('link');
        chiCSS.rel = 'stylesheet';
        chiCSS.href = 'https://lib.lumen.com/chi/6.67.0/chi-portal.css';
        chiCSS.integrity = 'sha256-iA3FwGgnKpn/w8P2BwmuIqfyPvbH/pubeTjtINO9gKI=';
        chiCSS.crossOrigin = 'anonymous';
        chiCSS.onload = () => {
            console.log('✅ Chi CSS loaded in DAS Health shadow DOM');
        };
        chiCSS.onerror = () => {
            console.error('❌ Failed to load Chi CSS in shadow DOM');
        };
        this.shadowRoot.appendChild(chiCSS);
    }

    /**
     * Fetch health data via proxy with basic authentication
     */
    async fetchHealthData() {
        this.isLoading = true;
        this.error = null;
        this.render();

        try {
            const targetUrl = this.config.endpoint;
            
            console.log(`🔍 DAS Health: Fetching via proxy from ${targetUrl}`);
            console.log(`📡 Target endpoint: ${this.config.directEndpoint}`);
            console.log(`� Username: ${this.config.username}`);

            const fetchOptions = {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'X-DAS-Username': this.config.username,
                    'X-DAS-Password': this.config.password
                }
            };

            console.log('📤 Sending request to proxy...');
            const response = await fetch(targetUrl, fetchOptions);
            
            console.log(`📥 Proxy response: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'No response body');
                console.error('❌ Proxy error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
            }

            const responseText = await response.text();
            console.log('📄 Response body:', responseText);
            
            this.healthData = JSON.parse(responseText);
            this.isLoading = false;
            this.error = null;
            
            console.log('✅ DAS Health: Data fetched successfully', this.healthData);
            
            // Emit success event
            this.emitEvent('das-health-success', {
                data: this.healthData,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('❌ DAS Health fetch error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            
            // Provide more specific error messages
            let errorMessage = error.message;
            
            if (error.message.includes('Failed to fetch')) {
                errorMessage = '� Proxy Connection Failed\n\n' +
                             'Cannot reach the proxy endpoint at:\n' +
                             this.config.endpoint + '\n\n' +
                             'Troubleshooting:\n' +
                             '1. Is the server running? Check terminal for:\n' +
                             '   "🚀 Proteus Chi Monitor server running at http://localhost:3000"\n\n' +
                             '2. Start the server:\n' +
                             '   $ node server.js\n\n' +
                             '3. Verify proxy endpoint exists in server.js\n\n' +
                             '4. Check browser console for detailed errors';
            } else if (error.message.includes('401')) {
                errorMessage = '🔴 Authentication Failed (401)\n\n' +
                             'The DAS server rejected the credentials.\n\n' +
                             'Current credentials:\n' +
                             '• Username: ' + this.config.username + '\n' +
                             '• Password: ********\n\n' +
                             'Verify credentials with DAS team.';
            } else if (error.message.includes('404')) {
                errorMessage = '🔴 Endpoint Not Found (404)\n\n' +
                             'The DAS endpoint does not exist:\n' +
                             this.config.directEndpoint + '\n\n' +
                             'Possible issues:\n' +
                             '• Wrong URL path\n' +
                             '• Service not deployed\n' +
                             '• API version changed\n\n' +
                             'Contact DAS team to verify the correct endpoint.';
            } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
                const statusCode = error.message.match(/\d{3}/)?.[0] || '5xx';
                errorMessage = `🔴 Server Error (${statusCode})\n\n` +
                             'The DAS service is experiencing issues.\n\n' +
                             '• 500: Internal server error\n' +
                             '• 502: Bad gateway (proxy cannot reach DAS)\n' +
                             '• 503: Service unavailable\n\n' +
                             'This is a DAS service issue, not a configuration problem.\n' +
                             'Contact DAS team or wait for service to recover.';
            } else if (error.message.includes('Unexpected token')) {
                errorMessage = '🔴 Invalid JSON Response\n\n' +
                             'The endpoint returned invalid JSON data.\n\n' +
                             'Possible causes:\n' +
                             '• Endpoint returns HTML error page\n' +
                             '• Endpoint returns plain text\n' +
                             '• Response is corrupted\n\n' +
                             'Check browser console for raw response.';
            }
            
            this.error = errorMessage;
            this.isLoading = false;
            
            // Emit error event
            this.emitEvent('das-health-error', {
                error: errorMessage,
                timestamp: new Date()
            });
        }

        this.render();
    }

    /**
     * Start auto-refresh
     */
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        this.refreshTimer = setInterval(() => {
            this.fetchHealthData();
        }, this.config.refreshInterval);
    }

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    /**
     * Update credentials
     */
    updateCredentials(username, password) {
        this.config.username = username;
        this.config.password = password;
    }

    /**
     * Get health status badge color
     */
    getStatusColor(status) {
        const statusMap = {
            'healthy': 'success',
            'ok': 'success',
            'warning': 'warning',
            'degraded': 'warning',
            'error': 'danger',
            'critical': 'danger',
            'down': 'danger'
        };
        
        const normalizedStatus = status ? status.toLowerCase() : 'unknown';
        return statusMap[normalizedStatus] || 'muted';
    }

    /**
     * Format timestamp
     */
    formatTimestamp(timestamp) {
        if (!timestamp) return 'N/A';
        
        try {
            const date = new Date(timestamp);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            return timestamp;
        }
    }

    /**
     * Render loading state
     */
    renderLoading() {
        return `
            <div class="chi-card">
                <div class="chi-card__header">
                    <div class="chi-card__title">DAS Health Monitor</div>
                </div>
                <div class="chi-card__content">
                    <div style="text-align: center; padding: 3rem;">
                        <div class="chi-spinner -lg"></div>
                        <p style="margin-top: 1rem; color: #666;">Loading health data...</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render error state
     */
    renderError() {
        return `
            <div class="chi-card">
                <div class="chi-card__header">
                    <div class="chi-card__title">DAS Health Monitor</div>
                </div>
                <div class="chi-card__content">
                    <div class="chi-alert -danger -center" role="alert">
                        <i class="chi-alert__icon chi-icon icon-circle-warning" aria-hidden="true"></i>
                        <div class="chi-alert__content">
                            <p class="chi-alert__text">
                                <strong>Error:</strong> ${this.escapeHtml(this.error)}
                            </p>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 1rem;">
                        <button class="chi-button -primary" id="retry-btn">
                            <i class="chi-icon icon-refresh" aria-hidden="true"></i>
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render health data
     */
    renderHealthData() {
        if (!this.healthData) {
            return this.renderLoading();
        }

        // DAS API returns: {"checks": [{"id": "DASPROD", "status": "up", "data": {...}}]}
        const checks = this.healthData.checks || [];
        const timestamp = this.healthData.timestamp || new Date().toISOString();
        
        // Determine overall status from checks
        let overallStatus = 'healthy';
        if (checks.some(c => c.status === 'down' || c.status === 'critical')) {
            overallStatus = 'critical';
        } else if (checks.some(c => c.status === 'warning' || c.status === 'degraded')) {
            overallStatus = 'warning';
        } else if (checks.every(c => c.status === 'up')) {
            overallStatus = 'healthy';
        }
        
        // Extract metrics from first check's data if available
        const primaryCheck = checks[0] || {};
        const checkData = primaryCheck.data || {};
        const metrics = {
            total_checks: checks.length,
            healthy_checks: checks.filter(c => c.status === 'up').length,
            ...checkData
        };

        return `
            <div class="chi-card">
                <div class="chi-card__header">
                    <div class="chi-card__title">
                        <i class="chi-icon icon-circle-info-outline" aria-hidden="true"></i>
                        DAS Health Monitor
                    </div>
                    <div class="chi-card__actions">
                        <button class="chi-button -xs -flat -icon" id="refresh-btn" title="Refresh">
                            <div class="chi-button__content">
                                <i class="chi-icon icon-refresh" aria-hidden="true"></i>
                            </div>
                        </button>
                    </div>
                </div>
                <div class="chi-card__content">
                    <!-- Overall Status -->
                    <div style="margin-bottom: 2rem;">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                            <span class="chi-badge -${this.getStatusColor(overallStatus)} -lg">
                                ${this.escapeHtml(String(overallStatus).toUpperCase())}
                            </span>
                            <span style="color: #666; font-size: 0.875rem;">
                                Last updated: ${this.formatTimestamp(timestamp)}
                            </span>
                        </div>
                        <div style="color: #666; font-size: 0.875rem;">
                            ${checks.length} health check${checks.length !== 1 ? 's' : ''} monitored
                        </div>
                    </div>

                    <!-- Services/Components Status -->
                    ${Array.isArray(checks) && checks.length > 0 ? `
                        <div style="margin-bottom: 2rem;">
                            <h4 style="margin-bottom: 1rem; color: #333;">Health Checks (${checks.length} total)</h4>
                            <div class="health-checks-container">
                                ${checks.map((check, index) => `
                                    <details class="health-check-item" ${index === 0 ? 'open' : ''}>
                                        <summary class="health-check-summary">
                                            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                                <span style="font-weight: 600; font-size: 1rem;">
                                                    ${this.escapeHtml(check.id || 'Unknown')}
                                                </span>
                                                <span class="chi-badge -${this.getStatusColor(check.status === 'up' ? 'healthy' : check.status)} -sm">
                                                    ${this.escapeHtml(String(check.status || 'unknown').toUpperCase())}
                                                </span>
                                            </div>
                                        </summary>
                                        <div class="health-check-content">
                                            ${check.data && Object.keys(check.data).length > 0 ? `
                                                <div style="padding: 1rem; background: #f8f9fa; border-radius: 4px;">
                                                    <h5 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.75rem; color: #333;">Details (${Object.keys(check.data).length} fields):</h5>
                                                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.75rem;">
                                                        ${Object.entries(check.data).map(([key, value]) => {
                                                            // Handle nested objects and arrays
                                                            let displayValue = value;
                                                            let isComplex = false;
                                                            if (typeof value === 'object' && value !== null) {
                                                                displayValue = JSON.stringify(value, null, 2);
                                                                isComplex = true;
                                                            }
                                                            return `
                                                                <div style="background: white; padding: 0.75rem; border-radius: 4px; border: 1px solid #e0e0e0;">
                                                                    <div style="font-weight: 600; color: #0072CE; margin-bottom: 0.35rem; font-size: 0.75rem; text-transform: uppercase;">
                                                                        ${this.escapeHtml(key.replace(/_/g, ' '))}
                                                                    </div>
                                                                    <div style="color: #242424; word-break: break-word; font-family: ${isComplex ? 'monospace' : 'inherit'}; font-size: 0.875rem; ${isComplex ? 'background: #f5f5f5; padding: 0.5rem; border-radius: 2px; overflow-x: auto;' : ''}">
                                                                        ${this.escapeHtml(String(displayValue))}
                                                                    </div>
                                                                </div>
                                                            `;
                                                        }).join('')}
                                                    </div>
                                                </div>
                                            ` : '<div style="padding: 1rem; color: #999; font-size: 0.875rem; text-align: center; background: #f8f9fa; border-radius: 4px;">No data available</div>'}
                                        </div>
                                    </details>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Metrics -->
                    ${Object.keys(metrics).length > 0 ? `
                        <div style="margin-bottom: 2rem;">
                            <h4 style="margin-bottom: 1rem; color: #333;">Summary Metrics</h4>
                            <div class="chi-grid">
                                ${Object.entries(metrics).map(([key, value]) => {
                                    // Skip very long values in the metrics display
                                    const displayValue = typeof value === 'object' 
                                        ? JSON.stringify(value).substring(0, 50) + '...'
                                        : String(value).length > 50
                                        ? String(value).substring(0, 50) + '...'
                                        : String(value);
                                    
                                    return `
                                        <div class="chi-col -w--12 -w-md--6 -w-lg--4" style="margin-bottom: 1rem;">
                                            <div style="padding: 1rem; background: #f8f9fa; border-radius: 4px; border-left: 3px solid #0072CE;">
                                                <div style="font-size: 0.75rem; color: #666; text-transform: uppercase; margin-bottom: 0.25rem; font-weight: 600;">
                                                    ${this.escapeHtml(key.replace(/_/g, ' '))}
                                                </div>
                                                <div style="font-size: 1.125rem; font-weight: 600; color: #242424; word-break: break-word;">
                                                    ${this.escapeHtml(displayValue)}
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    render() {
        let content;
        
        if (this.isLoading && !this.healthData) {
            content = this.renderLoading();
        } else if (this.error && !this.healthData) {
            content = this.renderError();
        } else {
            content = this.renderHealthData();
        }

        // Preserve Chi CSS link during re-render
        const chiCSS = this.shadowRoot.querySelector('link[href*="chi-portal.css"]');
        
        this.shadowRoot.innerHTML = `
            ${this.getStyles()}
            <div class="das-health-monitor">
                ${content}
            </div>
        `;
        
        // Re-attach Chi CSS if it existed
        if (chiCSS) {
            this.shadowRoot.insertBefore(chiCSS, this.shadowRoot.firstChild);
        }

        this.attachEventListeners();
    }

    getStyles() {
        return `
            <style>
                :host {
                    display: block;
                    margin: 2rem;
                }

                .das-health-monitor {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .chi-spinner {
                    border: 3px solid rgba(0, 0, 0, 0.1);
                    border-top-color: #0047BB;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Native details/summary accordion styling */
                .health-checks-container {
                    border: 1px solid #d0d0d0;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .health-check-item {
                    border-bottom: 1px solid #d0d0d0;
                }

                .health-check-item:last-child {
                    border-bottom: none;
                }

                .health-check-summary {
                    padding: 1rem 1.5rem;
                    background: #fff;
                    cursor: pointer;
                    user-select: none;
                    list-style: none;
                    transition: background-color 0.2s ease;
                }

                .health-check-summary::-webkit-details-marker {
                    display: none;
                }

                .health-check-summary::marker {
                    display: none;
                }

                .health-check-summary:hover {
                    background: #f8f9fa;
                }

                .health-check-item[open] .health-check-summary {
                    background: #f8f9fa;
                    border-bottom: 1px solid #d0d0d0;
                }

                .health-check-content {
                    padding: 1rem 1.5rem;
                    background: #fff;
                    animation: slideDown 0.2s ease-out;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            </style>
        `;
    }

    attachEventListeners() {
        const refreshBtn = this.shadowRoot.getElementById('refresh-btn');
        const retryBtn = this.shadowRoot.getElementById('retry-btn');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.fetchHealthData());
        }

        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.fetchHealthData());
        }

        // Native <details> elements handle their own expand/collapse
        // No additional JavaScript needed for accordion functionality
    }

    connectedCallback() {
        this.render();
        // Fetch initial data
        this.fetchHealthData();
        // Start auto-refresh
        this.startAutoRefresh();
    }

    disconnectedCallback() {
        // Stop auto-refresh when component is removed
        this.stopAutoRefresh();
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Emit custom event
     */
    emitEvent(eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }
}

// Register the custom element
customElements.define('chi-das-health-monitor', ChiDasHealthMonitor);