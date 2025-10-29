/**
 * Chi Button Showcase Component
 * Demonstrates various button styles and interactions
 */

class ChiButton extends ChiComponent {
  constructor() {
    super();
    this.state = {
      loading: false,
      disabled: false
    };
  }

  template() {
    const { variant = 'primary', size = 'md', loading = false, disabled = false } = this.props;
    const { loading: stateLoading, disabled: stateDisabled } = this.state;
    
    const isLoading = loading === 'true' || stateLoading;
    const isDisabled = disabled === 'true' || stateDisabled;
    
    return `
      <button 
        class="chi-btn chi-btn-${variant} chi-btn-${size} ${isLoading ? 'loading' : ''} ${isDisabled ? 'disabled' : ''}"
        ${isDisabled ? 'disabled' : ''}
      >
        ${isLoading ? '<span class="spinner"></span>' : ''}
        <slot></slot>
      </button>
    `;
  }

  styles() {
    return `
      <style>
        ${ChiAnimations.getKeyframes()}
        
        :host {
          display: inline-block;
        }

        .chi-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid transparent;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.5;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
          user-select: none;
          white-space: nowrap;
        }

        .chi-btn:hover:not(.disabled) {
          transform: translateY(-1px);
          box-shadow: ${ChiTheme.shadows.md};
        }

        .chi-btn:active:not(.disabled) {
          transform: translateY(0);
        }

        /* Variants */
        .chi-btn-primary {
          background-color: ${ChiTheme.colors.primary};
          border-color: ${ChiTheme.colors.primary};
          color: white;
        }

        .chi-btn-secondary {
          background-color: ${ChiTheme.colors.secondary};
          border-color: ${ChiTheme.colors.secondary};
          color: white;
        }

        .chi-btn-success {
          background-color: ${ChiTheme.colors.success};
          border-color: ${ChiTheme.colors.success};
          color: white;
        }

        .chi-btn-danger {
          background-color: ${ChiTheme.colors.danger};
          border-color: ${ChiTheme.colors.danger};
          color: white;
        }

        .chi-btn-warning {
          background-color: ${ChiTheme.colors.warning};
          border-color: ${ChiTheme.colors.warning};
          color: ${ChiTheme.colors.dark};
        }

        .chi-btn-outline {
          background-color: transparent;
          border-color: ${ChiTheme.colors.primary};
          color: ${ChiTheme.colors.primary};
        }

        .chi-btn-outline:hover:not(.disabled) {
          background-color: ${ChiTheme.colors.primary};
          color: white;
        }

        /* Sizes */
        .chi-btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }

        .chi-btn-lg {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
        }

        /* States */
        .chi-btn.loading {
          pointer-events: none;
          opacity: 0.7;
        }

        .chi-btn.disabled {
          pointer-events: none;
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: chi-spin 1s linear infinite;
        }
      </style>
    `;
  }

  bindEvents() {
    const button = this.$('button');
    button.addEventListener('click', (e) => {
      if (this.state.loading || this.state.disabled) {
        e.preventDefault();
        return;
      }
      this.emit('chi-click', { originalEvent: e });
    });
  }

  setLoading(loading) {
    this.setState({ loading });
  }

  setDisabled(disabled) {
    this.setState({ disabled });
  }
}

class ChiButtonShowcase extends ChiComponent {
  template() {
    return `
      <div class="showcase-container">
        <h2>Chi Button Showcase</h2>
        
        <div class="section">
          <h3>Button Variants</h3>
          <div class="button-group">
            <chi-button variant="primary">Primary</chi-button>
            <chi-button variant="secondary">Secondary</chi-button>
            <chi-button variant="success">Success</chi-button>
            <chi-button variant="danger">Danger</chi-button>
            <chi-button variant="warning">Warning</chi-button>
            <chi-button variant="outline">Outline</chi-button>
          </div>
        </div>

        <div class="section">
          <h3>Button Sizes</h3>
          <div class="button-group">
            <chi-button size="sm">Small</chi-button>
            <chi-button size="md">Medium</chi-button>
            <chi-button size="lg">Large</chi-button>
          </div>
        </div>

        <div class="section">
          <h3>Interactive Buttons</h3>
          <div class="button-group">
            <chi-button id="loading-btn" variant="primary">Click for Loading</chi-button>
            <chi-button id="toggle-btn" variant="secondary">Toggle Disabled</chi-button>
            <chi-button id="api-btn" variant="success">API Call</chi-button>
          </div>
        </div>

        <div class="section">
          <h3>Button States</h3>
          <div class="button-group">
            <chi-button loading="true" variant="primary">Loading...</chi-button>
            <chi-button disabled="true" variant="secondary">Disabled</chi-button>
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
        }

        .showcase-container {
          max-width: 800px;
          margin: 0 auto;
        }

        h2 {
          color: ${ChiTheme.colors.dark};
          margin-bottom: ${ChiTheme.spacing.lg};
          text-align: center;
        }

        .section {
          margin-bottom: ${ChiTheme.spacing.xl};
        }

        h3 {
          color: ${ChiTheme.colors.dark};
          margin-bottom: ${ChiTheme.spacing.md};
          border-bottom: 2px solid ${ChiTheme.colors.light};
          padding-bottom: ${ChiTheme.spacing.sm};
        }

        .button-group {
          display: flex;
          gap: ${ChiTheme.spacing.md};
          flex-wrap: wrap;
          align-items: center;
        }

        @media (max-width: ${ChiTheme.breakpoints.sm}) {
          .button-group {
            flex-direction: column;
            align-items: stretch;
          }
        }
      </style>
    `;
  }

  bindEvents() {
    // Loading button demo
    const loadingBtn = this.$('#loading-btn');
    loadingBtn?.addEventListener('chi-click', () => {
      loadingBtn.setLoading(true);
      setTimeout(() => {
        loadingBtn.setLoading(false);
      }, 2000);
    });

    // Toggle disabled demo
    const toggleBtn = this.$('#toggle-btn');
    let isDisabled = false;
    toggleBtn?.addEventListener('chi-click', () => {
      isDisabled = !isDisabled;
      toggleBtn.setDisabled(isDisabled);
      toggleBtn.textContent = isDisabled ? 'Enable Me' : 'Toggle Disabled';
    });

    // API call demo
    const apiBtn = this.$('#api-btn');
    apiBtn?.addEventListener('chi-click', async () => {
      try {
        apiBtn.setLoading(true);
        const data = await this.apiCall('/dashboard/stats');
        this.emit('api-success', data);
        console.log('API Response:', data);
      } catch (error) {
        this.emit('api-error', error);
        console.error('API Error:', error);
      } finally {
        apiBtn.setLoading(false);
      }
    });
  }
}

// Register components
if (typeof customElements !== 'undefined') {
  customElements.define('chi-button', ChiButton);
  customElements.define('chi-button-showcase', ChiButtonShowcase);
}