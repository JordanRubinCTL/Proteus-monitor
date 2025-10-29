/**
 * Chi Dashboard Component
 * Main dashboard with stats, charts, and monitoring widgets
 */

class ChiStatCard extends ChiComponent {
  template() {
    const { title, value, change, icon = '📊' } = this.props;
    const isPositive = change && change.startsWith('+');
    
    return `
      <div class="stat-card">
        <div class="stat-icon">${icon}</div>
        <div class="stat-content">
          <h3 class="stat-title">${title || 'Statistic'}</h3>
          <div class="stat-value">${value || '0'}</div>
          ${change ? `<div class="stat-change ${isPositive ? 'positive' : 'negative'}">${change}</div>` : ''}
        </div>
      </div>
    `;
  }

  styles() {
    return `
      <style>
        :host {
          display: block;
        }

        .stat-card {
          display: flex;
          align-items: center;
          padding: ${ChiTheme.spacing.lg};
          background: white;
          border-radius: 0.5rem;
          box-shadow: ${ChiTheme.shadows.sm};
          transition: all 0.2s ease-in-out;
          border-left: 4px solid ${ChiTheme.colors.primary};
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: ${ChiTheme.shadows.md};
        }

        .stat-icon {
          font-size: 2rem;
          margin-right: ${ChiTheme.spacing.md};
          opacity: 0.8;
        }

        .stat-content {
          flex: 1;
        }

        .stat-title {
          margin: 0 0 ${ChiTheme.spacing.xs} 0;
          font-size: 0.875rem;
          color: ${ChiTheme.colors.muted};
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 1.875rem;
          font-weight: 700;
          color: ${ChiTheme.colors.dark};
          margin-bottom: ${ChiTheme.spacing.xs};
        }

        .stat-change {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .stat-change.positive {
          color: ${ChiTheme.colors.success};
        }

        .stat-change.negative {
          color: ${ChiTheme.colors.danger};
        }
      </style>
    `;
  }
}

class ChiChart extends ChiComponent {
  constructor() {
    super();
    this.state = {
      data: [],
      loading: true
    };
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadData();
  }

  async loadData() {
    try {
      const data = await this.apiCall('/dashboard/chart-data');
      this.setState({ data, loading: false });
    } catch (error) {
      console.error('Failed to load chart data:', error);
      this.setState({ loading: false });
    }
  }

  template() {
    const { title = 'Chart', type = 'line' } = this.props;
    const { data, loading } = this.state;

    if (loading) {
      return `
        <div class="chart-container">
          <div class="chart-header">
            <h3>${title}</h3>
          </div>
          <div class="chart-loading">
            <div class="spinner"></div>
            <p>Loading chart data...</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="chart-container">
        <div class="chart-header">
          <h3>${title}</h3>
          <chi-button size="sm" variant="outline" id="refresh-btn">🔄 Refresh</chi-button>
        </div>
        <div class="chart-content">
          ${this.renderChart(data, type)}
        </div>
      </div>
    `;
  }

  renderChart(data, type) {
    if (!data.length) {
      return '<div class="no-data">No data available</div>';
    }

    const maxValue = Math.max(...data.map(d => d.value));
    
    if (type === 'bar') {
      return `
        <div class="bar-chart">
          ${data.map(item => `
            <div class="bar-item">
              <div class="bar" style="height: ${(item.value / maxValue) * 100}%"></div>
              <div class="bar-label">${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Default line chart representation
    return `
      <div class="line-chart">
        <svg viewBox="0 0 400 200" class="chart-svg">
          <polyline
            points="${data.map((item, index) => 
              `${(index / (data.length - 1)) * 380 + 10},${190 - (item.value / maxValue) * 170}`
            ).join(' ')}"
            class="chart-line"
          />
          ${data.map((item, index) => `
            <circle
              cx="${(index / (data.length - 1)) * 380 + 10}"
              cy="${190 - (item.value / maxValue) * 170}"
              r="4"
              class="chart-point"
            />
          `).join('')}
        </svg>
        <div class="chart-labels">
          ${data.map(item => `
            <span class="chart-label">${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          `).join('')}
        </div>
      </div>
    `;
  }

  styles() {
    return `
      <style>
        ${ChiAnimations.getKeyframes()}
        
        :host {
          display: block;
        }

        .chart-container {
          background: white;
          border-radius: 0.5rem;
          box-shadow: ${ChiTheme.shadows.sm};
          overflow: hidden;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: ${ChiTheme.spacing.lg};
          border-bottom: 1px solid ${ChiTheme.colors.light};
        }

        .chart-header h3 {
          margin: 0;
          color: ${ChiTheme.colors.dark};
        }

        .chart-content {
          padding: ${ChiTheme.spacing.lg};
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chart-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: ${ChiTheme.spacing.md};
          color: ${ChiTheme.colors.muted};
        }

        .spinner {
          width: 2rem;
          height: 2rem;
          border: 3px solid ${ChiTheme.colors.light};
          border-top: 3px solid ${ChiTheme.colors.primary};
          border-radius: 50%;
          animation: chi-spin 1s linear infinite;
        }

        .line-chart {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .chart-svg {
          flex: 1;
          width: 100%;
        }

        .chart-line {
          fill: none;
          stroke: ${ChiTheme.colors.primary};
          stroke-width: 2;
        }

        .chart-point {
          fill: ${ChiTheme.colors.primary};
          stroke: white;
          stroke-width: 2;
        }

        .chart-labels {
          display: flex;
          justify-content: space-between;
          margin-top: ${ChiTheme.spacing.sm};
          padding: 0 10px;
        }

        .chart-label {
          font-size: 0.75rem;
          color: ${ChiTheme.colors.muted};
        }

        .bar-chart {
          display: flex;
          align-items: end;
          gap: ${ChiTheme.spacing.sm};
          height: 200px;
          width: 100%;
          padding: 0 ${ChiTheme.spacing.sm};
        }

        .bar-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }

        .bar {
          width: 100%;
          background: linear-gradient(to top, ${ChiTheme.colors.primary}, ${ChiTheme.colors.info});
          border-radius: 4px 4px 0 0;
          transition: all 0.3s ease;
        }

        .bar:hover {
          opacity: 0.8;
        }

        .bar-label {
          margin-top: ${ChiTheme.spacing.xs};
          font-size: 0.75rem;
          color: ${ChiTheme.colors.muted};
        }

        .no-data {
          color: ${ChiTheme.colors.muted};
          text-align: center;
        }
      </style>
    `;
  }

  bindEvents() {
    const refreshBtn = this.$('#refresh-btn');
    refreshBtn?.addEventListener('chi-click', async () => {
      this.setState({ loading: true });
      await this.loadData();
    });
  }
}

class ChiDashboard extends ChiComponent {
  constructor() {
    super();
    this.state = {
      stats: {},
      loading: true,
      lastUpdated: null
    };
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadStats();
    this.startAutoRefresh();
  }

  async loadStats() {
    try {
      const stats = await this.apiCall('/dashboard/stats');
      this.setState({ 
        stats, 
        loading: false, 
        lastUpdated: new Date().toLocaleTimeString() 
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      this.setState({ loading: false });
    }
  }

  startAutoRefresh() {
    // Refresh stats every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadStats();
    }, 30000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  template() {
    const { stats, loading, lastUpdated } = this.state;

    return `
      <div class="dashboard-container">
        <div class="dashboard-header">
          <h2>📊 Proteus Monitor Dashboard</h2>
          <div class="dashboard-controls">
            ${lastUpdated ? `<span class="last-updated">Last updated: ${lastUpdated}</span>` : ''}
            <chi-button size="sm" variant="outline" id="refresh-dashboard">🔄 Refresh</chi-button>
          </div>
        </div>

        ${loading ? `
          <div class="loading-overlay">
            <div class="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        ` : `
          <div class="stats-grid">
            <chi-stat-card 
              title="Total Users" 
              value="${stats.totalUsers || '0'}" 
              change="+12%" 
              icon="👥">
            </chi-stat-card>
            <chi-stat-card 
              title="Active Users" 
              value="${stats.activeUsers || '0'}" 
              change="+8%" 
              icon="✅">
            </chi-stat-card>
            <chi-stat-card 
              title="Revenue" 
              value="${stats.revenue || '$0'}" 
              change="${stats.growth || '+0%'}" 
              icon="💰">
            </chi-stat-card>
            <chi-stat-card 
              title="Performance" 
              value="98.5%" 
              change="+2%" 
              icon="⚡">
            </chi-stat-card>
          </div>

          <div class="charts-grid">
            <chi-chart title="📈 Traffic Trend" type="line"></chi-chart>
            <chi-chart title="📊 Revenue Breakdown" type="bar"></chi-chart>
          </div>

          <div class="actions-section">
            <h3>Quick Actions</h3>
            <div class="actions-grid">
              <chi-button variant="primary" id="export-data">📊 Export Data</chi-button>
              <chi-button variant="success" id="generate-report">📋 Generate Report</chi-button>
              <chi-button variant="warning" id="system-check">🔧 System Check</chi-button>
              <chi-button variant="info" id="view-logs">📝 View Logs</chi-button>
            </div>
          </div>
        `}
      </div>
    `;
  }

  styles() {
    return `
      <style>
        ${ChiAnimations.getKeyframes()}
        
        :host {
          display: block;
          padding: ${ChiTheme.spacing.lg};
          background-color: ${ChiTheme.colors.light};
          min-height: 100vh;
        }

        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${ChiTheme.spacing.xl};
          padding: ${ChiTheme.spacing.lg};
          background: white;
          border-radius: 0.5rem;
          box-shadow: ${ChiTheme.shadows.sm};
        }

        .dashboard-header h2 {
          margin: 0;
          color: ${ChiTheme.colors.dark};
        }

        .dashboard-controls {
          display: flex;
          align-items: center;
          gap: ${ChiTheme.spacing.md};
        }

        .last-updated {
          font-size: 0.875rem;
          color: ${ChiTheme.colors.muted};
        }

        .loading-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: ${ChiTheme.spacing.xl};
          background: white;
          border-radius: 0.5rem;
          box-shadow: ${ChiTheme.shadows.sm};
          gap: ${ChiTheme.spacing.md};
        }

        .spinner {
          width: 3rem;
          height: 3rem;
          border: 4px solid ${ChiTheme.colors.light};
          border-top: 4px solid ${ChiTheme.colors.primary};
          border-radius: 50%;
          animation: chi-spin 1s linear infinite;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: ${ChiTheme.spacing.lg};
          margin-bottom: ${ChiTheme.spacing.xl};
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: ${ChiTheme.spacing.lg};
          margin-bottom: ${ChiTheme.spacing.xl};
        }

        .actions-section {
          background: white;
          padding: ${ChiTheme.spacing.lg};
          border-radius: 0.5rem;
          box-shadow: ${ChiTheme.shadows.sm};
        }

        .actions-section h3 {
          margin: 0 0 ${ChiTheme.spacing.lg} 0;
          color: ${ChiTheme.colors.dark};
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: ${ChiTheme.spacing.md};
        }

        @media (max-width: ${ChiTheme.breakpoints.lg}) {
          .dashboard-header {
            flex-direction: column;
            gap: ${ChiTheme.spacing.md};
            text-align: center;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: ${ChiTheme.breakpoints.sm}) {
          :host {
            padding: ${ChiTheme.spacing.md};
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
  }

  bindEvents() {
    const refreshBtn = this.$('#refresh-dashboard');
    refreshBtn?.addEventListener('chi-click', async () => {
      await this.loadStats();
    });

    // Action buttons
    const exportBtn = this.$('#export-data');
    exportBtn?.addEventListener('chi-click', () => {
      this.emit('export-data', { stats: this.state.stats });
      alert('Data export initiated!');
    });

    const reportBtn = this.$('#generate-report');
    reportBtn?.addEventListener('chi-click', () => {
      this.emit('generate-report');
      alert('Report generation started!');
    });

    const checkBtn = this.$('#system-check');
    checkBtn?.addEventListener('chi-click', () => {
      this.emit('system-check');
      alert('System check initiated!');
    });

    const logsBtn = this.$('#view-logs');
    logsBtn?.addEventListener('chi-click', () => {
      this.emit('view-logs');
      alert('Opening logs viewer...');
    });
  }
}

// Register components
if (typeof customElements !== 'undefined') {
  customElements.define('chi-stat-card', ChiStatCard);
  customElements.define('chi-chart', ChiChart);
  customElements.define('chi-dashboard', ChiDashboard);
}