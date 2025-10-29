/**
 * Chi Form Components
 * Input fields, forms, and validation components
 */

class ChiInput extends ChiComponent {
  constructor() {
    super();
    this.state = {
      value: '',
      error: '',
      focused: false
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.state.value = this.props.value || '';
  }

  template() {
    const { 
      type = 'text', 
      placeholder = '', 
      label, 
      required = false,
      disabled = false 
    } = this.props;
    
    const { value, error, focused } = this.state;
    const hasError = !!error;
    const hasLabel = !!label;

    return `
      <div class="chi-input-wrapper ${hasError ? 'error' : ''} ${focused ? 'focused' : ''}">
        ${hasLabel ? `<label class="chi-label" for="input">${label}${required ? ' *' : ''}</label>` : ''}
        <input 
          id="input"
          type="${type}"
          class="chi-input"
          placeholder="${placeholder}"
          value="${value}"
          ${required ? 'required' : ''}
          ${disabled === 'true' ? 'disabled' : ''}
        />
        ${hasError ? `<div class="chi-error">${error}</div>` : ''}
      </div>
    `;
  }

  styles() {
    return `
      <style>
        :host {
          display: block;
          margin-bottom: ${ChiTheme.spacing.md};
        }

        .chi-input-wrapper {
          position: relative;
        }

        .chi-label {
          display: block;
          margin-bottom: ${ChiTheme.spacing.xs};
          font-weight: 500;
          color: ${ChiTheme.colors.dark};
          font-size: 0.875rem;
        }

        .chi-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid ${ChiTheme.colors.light};
          border-radius: 0.375rem;
          font-size: 1rem;
          line-height: 1.5;
          transition: all 0.15s ease-in-out;
          background-color: white;
          box-sizing: border-box;
        }

        .chi-input:focus {
          outline: none;
          border-color: ${ChiTheme.colors.primary};
          box-shadow: 0 0 0 0.2rem rgba(0, 122, 204, 0.25);
        }

        .chi-input:disabled {
          background-color: ${ChiTheme.colors.light};
          cursor: not-allowed;
          opacity: 0.6;
        }

        .chi-input-wrapper.error .chi-input {
          border-color: ${ChiTheme.colors.danger};
        }

        .chi-input-wrapper.error .chi-input:focus {
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }

        .chi-error {
          color: ${ChiTheme.colors.danger};
          font-size: 0.875rem;
          margin-top: ${ChiTheme.spacing.xs};
        }

        .chi-input-wrapper.focused .chi-label {
          color: ${ChiTheme.colors.primary};
        }
      </style>
    `;
  }

  bindEvents() {
    const input = this.$('#input');
    
    input.addEventListener('input', (e) => {
      this.setState({ value: e.target.value, error: '' });
      this.emit('chi-input', { value: e.target.value });
    });

    input.addEventListener('focus', () => {
      this.setState({ focused: true });
      this.emit('chi-focus');
    });

    input.addEventListener('blur', () => {
      this.setState({ focused: false });
      this.validate();
      this.emit('chi-blur', { value: this.state.value });
    });
  }

  validate() {
    const { required, type } = this.props;
    const { value } = this.state;
    let error = '';

    if (required && !value.trim()) {
      error = 'This field is required';
    } else if (type === 'email' && value && !ChiUtils.validateEmail(value)) {
      error = 'Please enter a valid email address';
    }

    this.setState({ error });
    return !error;
  }

  getValue() {
    return this.state.value;
  }

  setValue(value) {
    this.setState({ value });
    const input = this.$('#input');
    if (input) input.value = value;
  }

  setError(error) {
    this.setState({ error });
  }
}

class ChiForm extends ChiComponent {
  constructor() {
    super();
    this.state = {
      submitting: false,
      data: {}
    };
  }

  template() {
    const { title = 'Form' } = this.props;
    
    return `
      <form class="chi-form">
        <div class="form-header">
          <h3>${title}</h3>
        </div>
        <div class="form-body">
          <slot></slot>
        </div>
        <div class="form-footer">
          <chi-button type="submit" variant="primary" ${this.state.submitting ? 'loading="true"' : ''}>
            ${this.state.submitting ? 'Submitting...' : 'Submit'}
          </chi-button>
          <chi-button type="button" variant="outline" id="reset-btn">Reset</chi-button>
        </div>
      </form>
    `;
  }

  styles() {
    return `
      <style>
        :host {
          display: block;
          background: white;
          border-radius: 0.5rem;
          box-shadow: ${ChiTheme.shadows.lg};
          overflow: hidden;
        }

        .chi-form {
          padding: ${ChiTheme.spacing.lg};
        }

        .form-header h3 {
          margin: 0 0 ${ChiTheme.spacing.lg} 0;
          color: ${ChiTheme.colors.dark};
          text-align: center;
        }

        .form-body {
          margin-bottom: ${ChiTheme.spacing.lg};
        }

        .form-footer {
          display: flex;
          gap: ${ChiTheme.spacing.md};
          justify-content: center;
          padding-top: ${ChiTheme.spacing.lg};
          border-top: 1px solid ${ChiTheme.colors.light};
        }

        @media (max-width: ${ChiTheme.breakpoints.sm}) {
          .form-footer {
            flex-direction: column;
          }
        }
      </style>
    `;
  }

  bindEvents() {
    const form = this.$('.chi-form');
    const resetBtn = this.$('#reset-btn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });

    resetBtn?.addEventListener('chi-click', () => {
      this.reset();
    });
  }

  async handleSubmit() {
    const inputs = this.querySelectorAll('chi-input');
    let isValid = true;
    const formData = {};

    // Validate all inputs
    inputs.forEach(input => {
      if (!input.validate()) {
        isValid = false;
      }
      const label = input.props.label || input.props.name || 'field';
      formData[label.toLowerCase()] = input.getValue();
    });

    if (!isValid) {
      this.emit('chi-validation-error', { errors: 'Please fix the errors above' });
      return;
    }

    this.setState({ submitting: true, data: formData });

    try {
      // Emit form submit event
      this.emit('chi-submit', { data: formData });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.emit('chi-submit-success', { data: formData });
    } catch (error) {
      this.emit('chi-submit-error', { error });
    } finally {
      this.setState({ submitting: false });
    }
  }

  reset() {
    const inputs = this.querySelectorAll('chi-input');
    inputs.forEach(input => {
      input.setValue('');
      input.setError('');
    });
    this.setState({ data: {} });
    this.emit('chi-reset');
  }

  getData() {
    return this.state.data;
  }
}

class ChiFormShowcase extends ChiComponent {
  template() {
    return `
      <div class="showcase-container">
        <h2>Chi Form Components</h2>
        
        <div class="forms-grid">
          <chi-form title="User Registration">
            <chi-input 
              label="Full Name" 
              name="fullName" 
              placeholder="Enter your full name" 
              required="true">
            </chi-input>
            <chi-input 
              label="Email Address" 
              name="email" 
              type="email" 
              placeholder="Enter your email" 
              required="true">
            </chi-input>
            <chi-input 
              label="Phone Number" 
              name="phone" 
              type="tel" 
              placeholder="Enter your phone">
            </chi-input>
          </chi-form>

          <chi-form title="Contact Form">
            <chi-input 
              label="Company" 
              name="company" 
              placeholder="Your company name">
            </chi-input>
            <chi-input 
              label="Subject" 
              name="subject" 
              placeholder="Message subject" 
              required="true">
            </chi-input>
            <chi-input 
              label="Message" 
              name="message" 
              placeholder="Your message..." 
              required="true">
            </chi-input>
          </chi-form>
        </div>

        <div class="status-display" id="status-display"></div>
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

        .showcase-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        h2 {
          text-align: center;
          color: ${ChiTheme.colors.dark};
          margin-bottom: ${ChiTheme.spacing.xl};
        }

        .forms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: ${ChiTheme.spacing.xl};
          margin-bottom: ${ChiTheme.spacing.xl};
        }

        .status-display {
          background: white;
          padding: ${ChiTheme.spacing.md};
          border-radius: 0.5rem;
          box-shadow: ${ChiTheme.shadows.sm};
          text-align: center;
          min-height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: ${ChiTheme.breakpoints.md}) {
          .forms-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
  }

  bindEvents() {
    const statusDisplay = this.$('#status-display');
    const forms = this.$$('chi-form');

    forms.forEach(form => {
      form.addEventListener('chi-submit-success', (e) => {
        statusDisplay.innerHTML = `
          <div style="color: ${ChiTheme.colors.success};">
            ✅ Form submitted successfully!<br>
            <small>Data: ${JSON.stringify(e.detail.data, null, 2)}</small>
          </div>
        `;
      });

      form.addEventListener('chi-submit-error', (e) => {
        statusDisplay.innerHTML = `
          <div style="color: ${ChiTheme.colors.danger};">
            ❌ Form submission failed!<br>
            <small>${e.detail.error}</small>
          </div>
        `;
      });

      form.addEventListener('chi-validation-error', (e) => {
        statusDisplay.innerHTML = `
          <div style="color: ${ChiTheme.colors.warning};">
            ⚠️ Please fix validation errors
          </div>
        `;
      });
    });
  }
}

// Register components
if (typeof customElements !== 'undefined') {
  customElements.define('chi-input', ChiInput);
  customElements.define('chi-form', ChiForm);
  customElements.define('chi-form-showcase', ChiFormShowcase);
}