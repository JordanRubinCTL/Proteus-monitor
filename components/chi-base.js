/**
 * Chi Base Component System
 * Foundational classes and utilities for Chi Web Components
 */

// Base Chi Component Class
class ChiComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {};
    this.props = {};
  }

  connectedCallback() {
    this.extractProps();
    this.render();
    this.bindEvents();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  // Extract attributes as props
  extractProps() {
    Array.from(this.attributes).forEach(attr => {
      this.props[attr.name] = attr.value;
    });
  }

  // State management
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  getState() {
    return this.state;
  }

  // Template method to be overridden
  template() {
    return '<div>Chi Component</div>';
  }

  // Styles method to be overridden
  styles() {
    return `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
      </style>
    `;
  }

  // Render method
  render() {
    this.shadowRoot.innerHTML = this.styles() + this.template();
  }

  // Event binding method to be overridden
  bindEvents() {
    // Override in child classes
  }

  // Cleanup method
  cleanup() {
    // Override in child classes if needed
  }

  // Utility method for API calls
  async apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Event emitter utility
  emit(eventName, detail = {}) {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true
    }));
  }

  // Query utility for shadow DOM
  $(selector) {
    return this.shadowRoot.querySelector(selector);
  }

  $$(selector) {
    return this.shadowRoot.querySelectorAll(selector);
  }
}

// Chi Theme and Utility Classes
class ChiTheme {
  static colors = {
    primary: '#007acc',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    white: '#ffffff',
    muted: '#6c757d'
  };

  static spacing = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '3rem'
  };

  static breakpoints = {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px'
  };

  static shadows = {
    sm: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
    md: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
    lg: '0 1rem 3rem rgba(0, 0, 0, 0.175)'
  };
}

// Animation utilities
class ChiAnimations {
  static fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
  }

  static slideIn(element, direction = 'left', duration = 300) {
    const transforms = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      up: 'translateY(-100%)',
      down: 'translateY(100%)'
    };

    element.style.transform = transforms[direction];
    element.style.transition = `transform ${duration}ms ease-in-out`;
    
    requestAnimationFrame(() => {
      element.style.transform = 'translateX(0) translateY(0)';
    });
  }

  static pulse(element, duration = 1000) {
    element.style.animation = `chi-pulse ${duration}ms ease-in-out infinite`;
  }

  static getKeyframes() {
    return `
      @keyframes chi-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes chi-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes chi-bounce {
        0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
        40%, 43% { transform: translateY(-30px); }
        70% { transform: translateY(-15px); }
        90% { transform: translateY(-4px); }
      }
    `;
  }
}

// Utility functions
const ChiUtils = {
  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Format date
  formatDate(date, format = 'short') {
    const d = new Date(date);
    const options = {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
      time: { hour: '2-digit', minute: '2-digit' }
    };
    return d.toLocaleDateString('en-US', options[format]);
  },

  // Generate unique ID
  generateId(prefix = 'chi') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Validate email
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChiComponent, ChiTheme, ChiAnimations, ChiUtils };
}