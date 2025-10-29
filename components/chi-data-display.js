/**
 * Chi Data Display Components
 * Tables, lists, and data visualization components
 */

class ChiTable extends ChiComponent {
  constructor() {
    super();
    this.state = {
      data: [],
      loading: true,
      sortBy: null,
      sortDirection: 'asc',
      searchTerm: '',
      currentPage: 1,
      itemsPerPage: 10
    };
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadData();
  }

  async loadData() {
    try {
      const { endpoint = '/users' } = this.props;
      const data = await this.apiCall(endpoint);
      this.setState({ data: Array.isArray(data) ? data : [], loading: false });
    } catch (error) {
      console.error('Failed to load table data:', error);
      this.setState({ data: [], loading: false });
    }
  }

  template() {
    const { title = 'Data Table', columns = [] } = this.props;
    const { data, loading, searchTerm, currentPage, itemsPerPage } = this.state;
    
    if (loading) {
      return `
        <div class="table-container">
          <div class="table-header">
            <h3>${title}</h3>
          </div>
          <div class="table-loading">
            <div class="spinner"></div>
            <p>Loading data...</p>
          </div>
        </div>
      `;
    }

    const filteredData = this.getFilteredData();
    const paginatedData = this.getPaginatedData(filteredData);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return `
      <div class="table-container">
        <div class="table-header">
          <h3>${title}</h3>
          <div class="table-controls">
            <div class="search-box">
              <input 
                type="text" 
                placeholder="Search..." 
                value="${searchTerm}"
                id="search-input"
                class="search-input"
              />
            </div>
            <chi-button size="sm" variant="outline" id="refresh-table">🔄</chi-button>
          </div>
        </div>
        
        <div class="table-wrapper">
          <table class="chi-table">
            <thead>
              <tr>
                ${this.getColumns().map(col => `
                  <th class="sortable ${this.state.sortBy === col.key ? 'sorted ' + this.state.sortDirection : ''}"
                      data-key="${col.key}">
                    ${col.label}
                    <span class="sort-indicator">
                      ${this.state.sortBy === col.key ? 
                        (this.state.sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                `).join('')}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${paginatedData.length ? paginatedData.map(item => `
                <tr>
                  ${this.getColumns().map(col => `
                    <td>${this.formatCellValue(item[col.key], col.type)}</td>
                  `).join('')}
                  <td>
                    <div class="action-buttons">
                      <chi-button size="sm" variant="outline" data-action="edit" data-id="${item.id}">✏️</chi-button>
                      <chi-button size="sm" variant="danger" data-action="delete" data-id="${item.id}">🗑️</chi-button>
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="${this.getColumns().length + 1}" class="no-data">
                    ${searchTerm ? 'No matching records found' : 'No data available'}
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        ${totalPages > 1 ? `
          <div class="table-pagination">
            <div class="pagination-info">
              Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, filteredData.length)} of ${filteredData.length} entries
            </div>
            <div class="pagination-controls">
              <chi-button 
                size="sm" 
                variant="outline" 
                ${currentPage === 1 ? 'disabled="true"' : ''}
                data-page="${currentPage - 1}"
                class="page-btn">
                ← Previous
              </chi-button>
              
              ${this.getPaginationNumbers(currentPage, totalPages).map(page => `
                <chi-button 
                  size="sm" 
                  variant="${page === currentPage ? 'primary' : 'outline'}" 
                  data-page="${page}"
                  class="page-btn">
                  ${page}
                </chi-button>
              `).join('')}
              
              <chi-button 
                size="sm" 
                variant="outline" 
                ${currentPage === totalPages ? 'disabled="true"' : ''}
                data-page="${currentPage + 1}"
                class="page-btn">
                Next →
              </chi-button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  getColumns() {
    const { columns } = this.props;
    if (columns && columns.length) {
      return JSON.parse(columns);
    }
    
    // Auto-generate columns from data
    if (this.state.data.length > 0) {
      const firstItem = this.state.data[0];
      return Object.keys(firstItem)
        .filter(key => key !== 'id')
        .map(key => ({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          type: 'text'
        }));
    }
    
    return [];
  }

  getFilteredData() {
    const { data, searchTerm, sortBy, sortDirection } = this.state;
    let filtered = [...data];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort data
    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        // Handle different data types
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }

  getPaginatedData(data) {
    const { currentPage, itemsPerPage } = this.state;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }

  getPaginationNumbers(current, total) {
    const delta = 2; // How many page numbers to show on each side
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < total - 1) {
      rangeWithDots.push('...', total);
    } else if (total > 1) {
      rangeWithDots.push(total);
    }

    return rangeWithDots.filter(page => page !== '...');
  }

  formatCellValue(value, type = 'text') {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
      case 'date':
        return ChiUtils.formatDate(value);
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'status':
        return `<span class="status-badge status-${value.toLowerCase()}">${value}</span>`;
      default:
        return String(value);
    }
  }

  styles() {
    return `
      <style>
        ${ChiAnimations.getKeyframes()}
        
        :host {
          display: block;
        }

        .table-container {
          background: white;
          border-radius: 0.5rem;
          box-shadow: ${ChiTheme.shadows.sm};
          overflow: hidden;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: ${ChiTheme.spacing.lg};
          border-bottom: 1px solid ${ChiTheme.colors.light};
        }

        .table-header h3 {
          margin: 0;
          color: ${ChiTheme.colors.dark};
        }

        .table-controls {
          display: flex;
          gap: ${ChiTheme.spacing.md};
          align-items: center;
        }

        .search-input {
          padding: 0.5rem;
          border: 2px solid ${ChiTheme.colors.light};
          border-radius: 0.375rem;
          font-size: 0.875rem;
          width: 200px;
        }

        .search-input:focus {
          outline: none;
          border-color: ${ChiTheme.colors.primary};
        }

        .table-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: ${ChiTheme.spacing.xl};
          gap: ${ChiTheme.spacing.md};
        }

        .spinner {
          width: 2rem;
          height: 2rem;
          border: 3px solid ${ChiTheme.colors.light};
          border-top: 3px solid ${ChiTheme.colors.primary};
          border-radius: 50%;
          animation: chi-spin 1s linear infinite;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .chi-table {
          width: 100%;
          border-collapse: collapse;
        }

        .chi-table th,
        .chi-table td {
          padding: ${ChiTheme.spacing.md};
          text-align: left;
          border-bottom: 1px solid ${ChiTheme.colors.light};
        }

        .chi-table th {
          background-color: ${ChiTheme.colors.light};
          font-weight: 600;
          color: ${ChiTheme.colors.dark};
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .chi-table th.sortable {
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s;
        }

        .chi-table th.sortable:hover {
          background-color: #e9ecef;
        }

        .chi-table th.sorted {
          background-color: ${ChiTheme.colors.primary};
          color: white;
        }

        .sort-indicator {
          margin-left: 0.5rem;
          opacity: 0.6;
        }

        .chi-table tbody tr:hover {
          background-color: ${ChiTheme.colors.light};
        }

        .action-buttons {
          display: flex;
          gap: ${ChiTheme.spacing.xs};
        }

        .no-data {
          text-align: center;
          color: ${ChiTheme.colors.muted};
          font-style: italic;
          padding: ${ChiTheme.spacing.xl};
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-active {
          background-color: ${ChiTheme.colors.success};
          color: white;
        }

        .status-inactive {
          background-color: ${ChiTheme.colors.danger};
          color: white;
        }

        .table-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: ${ChiTheme.spacing.lg};
          border-top: 1px solid ${ChiTheme.colors.light};
        }

        .pagination-info {
          color: ${ChiTheme.colors.muted};
          font-size: 0.875rem;
        }

        .pagination-controls {
          display: flex;
          gap: ${ChiTheme.spacing.xs};
        }

        @media (max-width: ${ChiTheme.breakpoints.md}) {
          .table-header {
            flex-direction: column;
            gap: ${ChiTheme.spacing.md};
          }

          .table-controls {
            width: 100%;
            justify-content: space-between;
          }

          .search-input {
            width: 100%;
            max-width: 200px;
          }

          .table-pagination {
            flex-direction: column;
            gap: ${ChiTheme.spacing.md};
          }
        }
      </style>
    `;
  }

  bindEvents() {
    // Search functionality
    const searchInput = this.$('#search-input');
    searchInput?.addEventListener('input', ChiUtils.debounce((e) => {
      this.setState({ searchTerm: e.target.value, currentPage: 1 });
    }, 300));

    // Refresh button
    const refreshBtn = this.$('#refresh-table');
    refreshBtn?.addEventListener('chi-click', async () => {
      this.setState({ loading: true });
      await this.loadData();
    });

    // Sorting
    this.$$('th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.key;
        const { sortBy, sortDirection } = this.state;
        
        let newDirection = 'asc';
        if (sortBy === key && sortDirection === 'asc') {
          newDirection = 'desc';
        }
        
        this.setState({ sortBy: key, sortDirection: newDirection });
      });
    });

    // Pagination
    this.$$('.page-btn').forEach(btn => {
      btn.addEventListener('chi-click', () => {
        const page = parseInt(btn.dataset.page);
        if (page && page !== this.state.currentPage) {
          this.setState({ currentPage: page });
        }
      });
    });

    // Action buttons
    this.$$('[data-action]').forEach(btn => {
      btn.addEventListener('chi-click', (e) => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        this.emit('table-action', { action, id, item: this.state.data.find(item => item.id == id) });
      });
    });
  }
}

class ChiDataDisplay extends ChiComponent {
  template() {
    return `
      <div class="data-display-container">
        <h2>📊 Data Display Components</h2>
        
        <div class="tables-section">
          <chi-table 
            title="👥 Users Management" 
            endpoint="/users"
            columns='[
              {"key": "name", "label": "Full Name", "type": "text"},
              {"key": "email", "label": "Email Address", "type": "text"},
              {"key": "status", "label": "Status", "type": "status"}
            ]'>
          </chi-table>
        </div>

        <div class="action-log" id="action-log">
          <h3>Action Log</h3>
          <div class="log-content">
            <p class="no-actions">No actions performed yet</p>
          </div>
        </div>
      </div>
    `;
  }

  styles() {
    return `
      <style>
        :host {
          display: block;
          padding: ${ChiTheme.spacing.lg};
          background-color: ${ChiTheme.colors.light};
          min-height: 100vh;
        }

        .data-display-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        h2 {
          text-align: center;
          color: ${ChiTheme.colors.dark};
          margin-bottom: ${ChiTheme.spacing.xl};
        }

        .tables-section {
          margin-bottom: ${ChiTheme.spacing.xl};
        }

        .action-log {
          background: white;
          padding: ${ChiTheme.spacing.lg};
          border-radius: 0.5rem;
          box-shadow: ${ChiTheme.shadows.sm};
        }

        .action-log h3 {
          margin: 0 0 ${ChiTheme.spacing.md} 0;
          color: ${ChiTheme.colors.dark};
        }

        .log-content {
          max-height: 300px;
          overflow-y: auto;
        }

        .no-actions {
          color: ${ChiTheme.colors.muted};
          font-style: italic;
          text-align: center;
          margin: ${ChiTheme.spacing.lg} 0;
        }

        .log-entry {
          padding: ${ChiTheme.spacing.sm};
          border-left: 3px solid ${ChiTheme.colors.primary};
          margin-bottom: ${ChiTheme.spacing.sm};
          background-color: ${ChiTheme.colors.light};
          border-radius: 0 0.25rem 0.25rem 0;
        }

        .log-time {
          font-size: 0.75rem;
          color: ${ChiTheme.colors.muted};
        }

        .log-message {
          margin-top: ${ChiTheme.spacing.xs};
          color: ${ChiTheme.colors.dark};
        }
      </style>
    `;
  }

  bindEvents() {
    const logContent = this.$('.log-content');
    
    // Listen for table actions
    this.addEventListener('table-action', (e) => {
      const { action, id, item } = e.detail;
      this.addLogEntry(`${action.toUpperCase()} action performed on item ${id} (${item?.name || 'Unknown'})`);
      
      // Handle specific actions
      if (action === 'delete') {
        if (confirm(`Are you sure you want to delete ${item?.name || 'this item'}?`)) {
          this.addLogEntry(`Item ${id} was deleted successfully`);
        }
      } else if (action === 'edit') {
        this.addLogEntry(`Edit dialog opened for item ${id}`);
      }
    });
  }

  addLogEntry(message) {
    const logContent = this.$('.log-content');
    const noActions = this.$('.no-actions');
    
    if (noActions) {
      noActions.remove();
    }

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <div class="log-time">${new Date().toLocaleTimeString()}</div>
      <div class="log-message">${message}</div>
    `;

    logContent.insertBefore(entry, logContent.firstChild);
    
    // Keep only last 10 entries
    const entries = logContent.querySelectorAll('.log-entry');
    if (entries.length > 10) {
      entries[entries.length - 1].remove();
    }
  }
}

// Register components
if (typeof customElements !== 'undefined') {
  customElements.define('chi-table', ChiTable);
  customElements.define('chi-data-display', ChiDataDisplay);
}