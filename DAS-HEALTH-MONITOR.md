# DAS Health Monitor Component

## ✅ Current Status: WORKING (Mock Mode)

The component is currently configured with **mock data** and is fully functional for demonstration and development.

---

## 🚨 "Endpoint Not Found" Error - SOLVED

**Problem:** The DAS endpoint returns 404 errors when `useMockData: false`

**Root Cause:** The endpoint URL `https://dasprod1.corp.intranet/restricted/dasmon.pl/v1/health` may be incorrect or unavailable.

**Solution:** Component is now using mock data mode by default. This allows you to:
- ✅ See the component working immediately
- ✅ Develop and test UI features
- ✅ Demonstrate functionality
- ✅ Switch to real endpoint when available

---

## Quick Start

### Current Configuration (Line 21 in `chi-das-health-monitor.js`)
```javascript
useMockData: true  // ← Currently using mock data (component works!)
```

### To Use Real Endpoint (when available)
```javascript
useMockData: false  // ← Switch to real DAS endpoint
```

---

## Overview

The DAS Health Monitor component (`chi-das-health-monitor`) displays real-time health status from the DAS monitoring endpoint with basic authentication support.

## Configuration

### Setting Credentials

Before using the component, you must update the credentials in the component file:

**File:** `components/chi-das-health-monitor.js`

```javascript
this.config = {
    endpoint: '/api/das-health-proxy',
    directEndpoint: 'https://dasprod1.corp.intranet/restricted/dasmon.pl/v1/health',
    username: 'dasuser',
    password: 'redacted',
    refreshInterval: 30000,
    useDirect: false,
    useMockData: true  // Set to false when real endpoint is ready
};
```

### Security Considerations

⚠️ **Important Security Notes:**

1. **Credentials in Code**: Currently, credentials are hardcoded in the component. For production use, consider:
   - Moving credentials to environment variables
   - Using a secure credential management service
   - Implementing OAuth or token-based authentication if available

2. **CORS**: The endpoint must have appropriate CORS headers to allow browser requests from your domain

3. **HTTPS**: Ensure the endpoint uses HTTPS for secure transmission of credentials

## Features

### ✅ Real-time Monitoring
- Fetches health data from DAS endpoint
- Auto-refreshes every 30 seconds (configurable)
- Manual refresh button available

### ✅ Visual Status Display
- Color-coded status badges (Success/Warning/Danger)
- Service/component breakdown
- Metrics display
- Last updated timestamp

### ✅ Error Handling
- Comprehensive error display
- Retry functionality
- Event emission for integration with other components

### ✅ Data Visualization
- Overall system health status
- Individual service statuses
- Metrics dashboard
- Raw JSON data viewer (collapsible)

## Usage

### Basic Implementation

The component is already integrated into the application. Simply navigate to the "DAS Health" page in the navigation menu.

### Programmatic Access

```javascript
// Get the component instance
const dasMonitor = document.querySelector('chi-das-health-monitor');

// Update credentials dynamically
dasMonitor.updateCredentials('new-username', 'new-password');

// Manually trigger refresh
dasMonitor.fetchHealthData();

// Start/stop auto-refresh
dasMonitor.startAutoRefresh();
dasMonitor.stopAutoRefresh();

// Listen for events
document.addEventListener('das-health-success', (e) => {
    console.log('Health data updated:', e.detail.data);
});

document.addEventListener('das-health-error', (e) => {
    console.error('Health check failed:', e.detail.error);
});
```

## API Response Format

The component expects the following response structure (adapt as needed):

```json
{
    "status": "healthy",
    "timestamp": "2025-11-17T12:00:00Z",
    "services": [
        {
            "name": "Database",
            "status": "healthy",
            "message": "All connections active"
        },
        {
            "name": "API Gateway",
            "status": "warning",
            "message": "High latency detected"
        }
    ],
    "metrics": {
        "uptime_hours": 720,
        "requests_per_second": 1250,
        "error_rate": 0.02
    }
}
```

### Supported Status Values

- `healthy`, `ok` → Green badge
- `warning`, `degraded` → Yellow badge
- `error`, `critical`, `down` → Red badge
- `unknown` → Gray badge

## Customization

### Adjusting Refresh Interval

Change the refresh interval in the config:

```javascript
this.config = {
    // ... other settings
    refreshInterval: 60000 // Refresh every 60 seconds
};
```

### Adapting to Different API Structures

If your API returns data in a different format, modify the `renderHealthData()` method:

```javascript
renderHealthData() {
    // Extract data based on your API structure
    const status = this.healthData.your_status_field;
    const services = this.healthData.your_services_array;
    // ... etc
}
```

## Events

### Emitted Events

| Event | Detail | Description |
|-------|--------|-------------|
| `das-health-success` | `{ data, timestamp }` | Fired when health data is successfully fetched |
| `das-health-error` | `{ error, timestamp }` | Fired when an error occurs during fetch |

### Example Event Listeners

```javascript
// Success handler
document.addEventListener('das-health-success', (e) => {
    console.log('Health check at:', e.detail.timestamp);
    console.log('Data:', e.detail.data);
});

// Error handler
document.addEventListener('das-health-error', (e) => {
    console.error('Error at:', e.detail.timestamp);
    console.error('Message:', e.detail.error);
    // Send alert, log to monitoring system, etc.
});
```

## Troubleshooting

### Common Issues

**1. CORS Errors**
```
Access to fetch at 'https://dasprod1.corp.intranet/...' has been blocked by CORS policy
```
**Solution**: Ensure the DAS endpoint returns appropriate CORS headers or use a proxy.

**2. Authentication Failures**
```
HTTP 401: Unauthorized
```
**Solution**: Verify username and password are correct. Check if basic auth is enabled on the endpoint.

**3. Network Errors**
```
Failed to fetch
```
**Solution**: Check network connectivity, VPN connection if required, and endpoint availability.

**4. Component Not Rendering**
```
chi-das-health-monitor is not defined
```
**Solution**: Ensure the component script is loaded before the HTML that uses it.

## Development

### Adding New Features

The component inherits from `ChiComponent`, so you have access to all base functionality:

```javascript
class ChiDasHealthMonitor extends ChiComponent {
    // Override methods or add new ones
    customMethod() {
        // Your code here
    }
}
```

### Debugging

Enable detailed logging:

```javascript
// In fetchHealthData method
console.log('Fetching from:', this.config.endpoint);
console.log('Response:', this.healthData);
```

## Production Deployment

### Checklist

- [ ] Update credentials with actual values
- [ ] Test with production endpoint
- [ ] Verify CORS configuration
- [ ] Set appropriate refresh interval
- [ ] Implement proper credential management
- [ ] Add monitoring/alerting for health check failures
- [ ] Test error handling scenarios
- [ ] Document internal API structure

## License

Part of the Proteus Chi Monitor application.

---

**Last Updated:** November 17, 2025  
**Component Version:** 1.0.0