# Proteus Chi Monitor

A modern web components application with a Vue.js backend, built with Chi UI components.

## 🚀 Features

- **Modern Web Components**: Built with custom elements and shadow DOM
- **Vue.js Backend**: Express server with RESTful APIs
- **Responsive Design**: Mobile-first, responsive layouts
- **Real-time Data**: Dashboard with live statistics and charts
- **Interactive Components**: Buttons, forms, modals, and data tables
- **Clean Architecture**: Modular, reusable components

## 📦 Project Structure

```
/
├── server.js              # Vue.js Express server
├── package.json           # Dependencies and scripts
├── index.html            # Main application
├── simple-chi.html       # Simple demo page
└── components/           # Chi web components
    ├── chi-base.js       # Base component class
    ├── chi-button-showcase.js
    ├── chi-form-components.js
    ├── chi-dashboard.js
    ├── chi-data-display.js
    └── chi-modal-system.js
```

## 🛠️ Getting Started

### Architecture

The application uses a **nginx + Node.js** architecture:
- **Nginx**: Reverse proxy, static file serving, rate limiting, security headers
- **Node.js/Express**: API server and application logic
- **Supervisor**: Process management for both services

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

#### Local Development
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Main application: http://localhost:3000
   - Simple demo: http://localhost:3000/simple-chi.html

#### Docker Deployment
1. **Build and run with Docker:**
   ```bash
   docker build -t proteus-chi-monitor .
   docker run -d --name proteus-monitor -p 80:80 proteus-chi-monitor
   ```

2. **Or use Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Main application: http://localhost
   - Simple demo: http://localhost/simple-chi.html

### Production

```bash
npm start
```

## 🎯 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build the application

## 📊 API Endpoints

- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/chart-data` - Chart data points
- `GET /api/users` - User data for tables
- `POST /api/users` - Create new user
- `GET /api/notifications` - System notifications

## 🎨 Components

### Chi Base Component
Foundation class with utilities for all components.

### Chi Button Showcase
Interactive button components with various styles and states.

### Chi Form Components
Form inputs with validation and submission handling.

### Chi Dashboard
Real-time dashboard with statistics and charts.

### Chi Data Display
Tables with sorting, filtering, and pagination.

### Chi Modal System
Modal dialogs and notification system.



## 🔧 Customization

### Theming
Components use the `ChiTheme` class for consistent styling:

```javascript
ChiTheme.colors = {
  primary: '#007acc',
  secondary: '#6c757d',
  success: '#28a745',
  // ...
};
```

### Component Extension
Extend the base component class:

```javascript
class MyComponent extends ChiComponent {
  template() {
    return '<div>My Custom Component</div>';
  }
  
  styles() {
    return '<style>/* Custom styles */</style>';
  }
}
```

## 🌐 Browser Support

- Chrome 60+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## 📱 Mobile Support

Fully responsive design with mobile-optimized components and touch interactions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For questions or issues:
- Check the documentation
- Open an issue on GitHub
- Contact support team

---

Built with ❤️ using Web Components and Vue.js