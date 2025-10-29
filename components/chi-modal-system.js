/**
 * Chi Modal System
 * Modal dialogs, notifications, and overlay components
 */

class ChiModal extends ChiComponent {
  constructor() {
    super();
    this.state = {
      isOpen: false,
      closing: false
    };
  }

  connectedCallback() {
    super.connectedCallback();
    
    // Listen for keyboard events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown(e) {
    if (e.key === 'Escape' && this.state.isOpen) {
      this.close();
    }
  }

  template() {
    const { title = 'Modal', size = 'md', closable = 'true' } = this.props;
    const { isOpen, closing } = this.state;

    if (!isOpen && !closing) return '';

    return `
      <div class="modal-overlay ${closing ? 'closing' : ''}" id="modal-overlay">
        <div class="modal-dialog modal-${size} ${closing ? 'closing' : ''}" id="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title">${title}</h4>
              ${closable === 'true' ? '<button class="modal-close" aria-label="Close">&times;</button>' : ''}
            </div>
            <div class="modal-body">
              <slot></slot>
            </div>
            <div class="modal-footer">
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  styles() {
    return `
      <style>
        ${ChiAnimations.getKeyframes()}
        
        :host {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1050;
          pointer-events: ${this.state.isOpen ? 'auto' : 'none'};
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: ${ChiTheme.spacing.lg};
          opacity: 1;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-overlay.closing {
          animation: fadeOut 0.3s ease-out;
        }

        .modal-dialog {
          background: white;
          border-radius: 0.5rem;
          box-shadow: ${ChiTheme.shadows.lg};
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transform: scale(1);
          animation: modalSlideIn 0.3s ease-out;
        }

        .modal-dialog.closing {
          animation: modalSlideOut 0.3s ease-out;
        }

        .modal-sm {
          max-width: 400px;
        }

        .modal-md {
          max-width: 600px;
        }

        .modal-lg {
          max-width: 900px;
        }

        .modal-xl {
          max-width: 1200px;
        }

        .modal-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: ${ChiTheme.spacing.lg};
          border-bottom: 1px solid ${ChiTheme.colors.light};
          background-color: ${ChiTheme.colors.light};
        }

        .modal-title {
          margin: 0;
          color: ${ChiTheme.colors.dark};
          font-size: 1.25rem;
          font-weight: 600;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: ${ChiTheme.colors.muted};
          padding: 0;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background-color: ${ChiTheme.colors.danger};
          color: white;
        }

        .modal-body {
          flex: 1;
          padding: ${ChiTheme.spacing.lg};
          overflow-y: auto;
        }

        .modal-footer {
          padding: ${ChiTheme.spacing.lg};
          border-top: 1px solid ${ChiTheme.colors.light};
          background-color: ${ChiTheme.colors.light};
          display: flex;
          gap: ${ChiTheme.spacing.md};
          justify-content: flex-end;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes modalSlideIn {
          from {
            transform: scale(0.9) translateY(-50px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes modalSlideOut {
          from {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          to {
            transform: scale(0.9) translateY(-50px);
            opacity: 0;
          }
        }

        @media (max-width: ${ChiTheme.breakpoints.sm}) {
          .modal-overlay {
            padding: ${ChiTheme.spacing.md};
          }

          .modal-dialog {
            margin: 0;
          }

          .modal-footer {
            flex-direction: column;
          }
        }
      </style>
    `;
  }

  bindEvents() {
    const overlay = this.$('#modal-overlay');
    const closeBtn = this.$('.modal-close');

    // Close on overlay click
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.close();
      }
    });

    // Close button
    closeBtn?.addEventListener('click', () => {
      this.close();
    });
  }

  open() {
    this.setState({ isOpen: true, closing: false });
    document.body.style.overflow = 'hidden';
    this.emit('chi-modal-open');
  }

  close() {
    if (this.props.closable === 'false') return;
    
    this.setState({ closing: true });
    
    setTimeout(() => {
      this.setState({ isOpen: false, closing: false });
      document.body.style.overflow = '';
      this.emit('chi-modal-close');
    }, 300);
  }

  toggle() {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}

class ChiNotification extends ChiComponent {
  constructor() {
    super();
    this.state = {
      visible: false,
      closing: false
    };
  }

  connectedCallback() {
    super.connectedCallback();
    
    // Auto show if autoShow is true
    if (this.props.autoshow === 'true') {
      setTimeout(() => this.show(), 100);
    }

    // Auto hide after duration
    const duration = parseInt(this.props.duration) || 5000;
    if (duration > 0) {
      this.autoHideTimeout = setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  template() {
    const { 
      type = 'info', 
      title = '', 
      closable = 'true',
      position = 'top-right'
    } = this.props;
    
    const { visible, closing } = this.state;

    if (!visible && !closing) return '';

    return `
      <div class="notification notification-${type} position-${position} ${closing ? 'closing' : ''}">
        <div class="notification-content">
          ${title ? `<div class="notification-title">${title}</div>` : ''}
          <div class="notification-message">
            <slot></slot>
          </div>
        </div>
        ${closable === 'true' ? '<button class="notification-close">&times;</button>' : ''}
      </div>
    `;
  }

  styles() {
    return `
      <style>
        :host {
          position: fixed;
          z-index: 1100;
          pointer-events: ${this.state.visible ? 'auto' : 'none'};
        }

        .notification {
          display: flex;
          align-items: flex-start;
          padding: ${ChiTheme.spacing.md};
          border-radius: 0.5rem;
          box-shadow: ${ChiTheme.shadows.lg};
          max-width: 400px;
          min-width: 300px;
          margin: ${ChiTheme.spacing.md};
          animation: slideIn 0.3s ease-out;
        }

        .notification.closing {
          animation: slideOut 0.3s ease-out;
        }

        .notification-info {
          background-color: ${ChiTheme.colors.info};
          border-left: 4px solid #0c7cd5;
          color: white;
        }

        .notification-success {
          background-color: ${ChiTheme.colors.success};
          border-left: 4px solid #1e7e34;
          color: white;
        }

        .notification-warning {
          background-color: ${ChiTheme.colors.warning};
          border-left: 4px solid #d39e00;
          color: ${ChiTheme.colors.dark};
        }

        .notification-danger {
          background-color: ${ChiTheme.colors.danger};
          border-left: 4px solid #c82333;
          color: white;
        }

        .notification-content {
          flex: 1;
        }

        .notification-title {
          font-weight: 600;
          margin-bottom: ${ChiTheme.spacing.xs};
          font-size: 1rem;
        }

        .notification-message {
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .notification-close {
          background: none;
          border: none;
          color: inherit;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0;
          width: 1.5rem;
          height: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.25rem;
          margin-left: ${ChiTheme.spacing.md};
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }

        .notification-close:hover {
          opacity: 1;
          background-color: rgba(255, 255, 255, 0.2);
        }

        /* Positions */
        .position-top-right {
          top: 0;
          right: 0;
        }

        .position-top-left {
          top: 0;
          left: 0;
        }

        .position-bottom-right {
          bottom: 0;
          right: 0;
        }

        .position-bottom-left {
          bottom: 0;
          left: 0;
        }

        .position-top-center {
          top: 0;
          left: 50%;
          transform: translateX(-50%);
        }

        .position-bottom-center {
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        /* Left positions slide from left */
        .position-top-left .notification,
        .position-bottom-left .notification {
          animation: slideInLeft 0.3s ease-out;
        }

        .position-top-left .notification.closing,
        .position-bottom-left .notification.closing {
          animation: slideOutLeft 0.3s ease-out;
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutLeft {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
      </style>
    `;
  }

  bindEvents() {
    const closeBtn = this.$('.notification-close');
    closeBtn?.addEventListener('click', () => {
      this.hide();
    });
  }

  show() {
    this.setState({ visible: true, closing: false });
    this.emit('chi-notification-show');
  }

  hide() {
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout);
    }
    
    this.setState({ closing: true });
    
    setTimeout(() => {
      this.setState({ visible: false, closing: false });
      this.emit('chi-notification-hide');
    }, 300);
  }
}

class ChiModalSystem extends ChiComponent {
  constructor() {
    super();
    this.state = {
      notifications: []
    };
  }

  template() {
    return `
      <div class="modal-system-container">
        <h2>🗂️ Modal & Notification System</h2>
        
        <div class="demo-section">
          <h3>Modal Demos</h3>
          <div class="button-group">
            <chi-button id="show-info-modal" variant="primary">Show Info Modal</chi-button>
            <chi-button id="show-form-modal" variant="success">Show Form Modal</chi-button>
            <chi-button id="show-large-modal" variant="warning">Show Large Modal</chi-button>
            <chi-button id="show-confirm-modal" variant="danger">Show Confirm Modal</chi-button>
          </div>
        </div>

        <div class="demo-section">
          <h3>Notification Demos</h3>
          <div class="button-group">
            <chi-button id="show-info-notification" variant="info">Info Notification</chi-button>
            <chi-button id="show-success-notification" variant="success">Success Notification</chi-button>
            <chi-button id="show-warning-notification" variant="warning">Warning Notification</chi-button>
            <chi-button id="show-error-notification" variant="danger">Error Notification</chi-button>
          </div>
        </div>

        <!-- Modals -->
        <chi-modal id="info-modal" title="📋 Information" size="md">
          <div style="padding: 1rem;">
            <p>This is an informational modal. It can contain any content you need to display to users.</p>
            <p>Features include:</p>
            <ul>
              <li>Responsive design</li>
              <li>Keyboard navigation (ESC to close)</li>
              <li>Click outside to close</li>
              <li>Smooth animations</li>
            </ul>
          </div>
          <div slot="footer">
            <chi-button id="close-info-modal" variant="primary">Got it!</chi-button>
          </div>
        </chi-modal>

        <chi-modal id="form-modal" title="✏️ Edit User" size="md">
          <chi-form title="">
            <chi-input label="Name" placeholder="Enter name" required="true"></chi-input>
            <chi-input label="Email" type="email" placeholder="Enter email" required="true"></chi-input>
            <chi-input label="Phone" type="tel" placeholder="Enter phone"></chi-input>
          </chi-form>
          <div slot="footer">
            <chi-button id="save-form-modal" variant="success">Save Changes</chi-button>
            <chi-button id="cancel-form-modal" variant="outline">Cancel</chi-button>
          </div>
        </chi-modal>

        <chi-modal id="large-modal" title="📊 Dashboard Overview" size="lg">
          <div style="padding: 1rem;">
            <chi-dashboard></chi-dashboard>
          </div>
          <div slot="footer">
            <chi-button id="close-large-modal" variant="primary">Close</chi-button>
          </div>
        </chi-modal>

        <chi-modal id="confirm-modal" title="⚠️ Confirm Action" size="sm">
          <div style="padding: 1rem; text-align: center;">
            <p>Are you sure you want to delete this item?</p>
            <p><strong>This action cannot be undone.</strong></p>
          </div>
          <div slot="footer">
            <chi-button id="confirm-delete" variant="danger">Delete</chi-button>
            <chi-button id="cancel-delete" variant="outline">Cancel</chi-button>
          </div>
        </chi-modal>
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

        .modal-system-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        h2 {
          text-align: center;
          color: ${ChiTheme.colors.dark};
          margin-bottom: ${ChiTheme.spacing.xl};
        }

        .demo-section {
          background: white;
          padding: ${ChiTheme.spacing.lg};
          border-radius: 0.5rem;
          box-shadow: ${ChiTheme.shadows.sm};
          margin-bottom: ${ChiTheme.spacing.lg};
        }

        .demo-section h3 {
          margin: 0 0 ${ChiTheme.spacing.md} 0;
          color: ${ChiTheme.colors.dark};
          border-bottom: 2px solid ${ChiTheme.colors.light};
          padding-bottom: ${ChiTheme.spacing.sm};
        }

        .button-group {
          display: flex;
          gap: ${ChiTheme.spacing.md};
          flex-wrap: wrap;
        }

        @media (max-width: ${ChiTheme.breakpoints.sm}) {
          .button-group {
            flex-direction: column;
          }
        }
      </style>
    `;
  }

  bindEvents() {
    // Modal triggers
    this.$('#show-info-modal')?.addEventListener('chi-click', () => {
      this.$('#info-modal').open();
    });

    this.$('#show-form-modal')?.addEventListener('chi-click', () => {
      this.$('#form-modal').open();
    });

    this.$('#show-large-modal')?.addEventListener('chi-click', () => {
      this.$('#large-modal').open();
    });

    this.$('#show-confirm-modal')?.addEventListener('chi-click', () => {
      this.$('#confirm-modal').open();
    });

    // Modal closers
    this.$('#close-info-modal')?.addEventListener('chi-click', () => {
      this.$('#info-modal').close();
    });

    this.$('#save-form-modal')?.addEventListener('chi-click', () => {
      this.showNotification('success', 'User saved successfully!');
      this.$('#form-modal').close();
    });

    this.$('#cancel-form-modal')?.addEventListener('chi-click', () => {
      this.$('#form-modal').close();
    });

    this.$('#close-large-modal')?.addEventListener('chi-click', () => {
      this.$('#large-modal').close();
    });

    this.$('#confirm-delete')?.addEventListener('chi-click', () => {
      this.showNotification('success', 'Item deleted successfully!');
      this.$('#confirm-modal').close();
    });

    this.$('#cancel-delete')?.addEventListener('chi-click', () => {
      this.$('#confirm-modal').close();
    });

    // Notification triggers
    this.$('#show-info-notification')?.addEventListener('chi-click', () => {
      this.showNotification('info', 'This is an info notification', 'Information');
    });

    this.$('#show-success-notification')?.addEventListener('chi-click', () => {
      this.showNotification('success', 'Operation completed successfully!', 'Success');
    });

    this.$('#show-warning-notification')?.addEventListener('chi-click', () => {
      this.showNotification('warning', 'Please review your input', 'Warning');
    });

    this.$('#show-error-notification')?.addEventListener('chi-click', () => {
      this.showNotification('danger', 'An error occurred while processing your request', 'Error');
    });
  }

  showNotification(type, message, title = '') {
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
  }
}

// Register components
if (typeof customElements !== 'undefined') {
  customElements.define('chi-modal', ChiModal);
  customElements.define('chi-notification', ChiNotification);
  customElements.define('chi-modal-system', ChiModalSystem);
}