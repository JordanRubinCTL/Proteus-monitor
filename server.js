const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;







// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('.'));

// API Routes
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalUsers: 1234,
    activeUsers: 567,
    revenue: '$12,345',
    growth: '+15%',
    lastUpdated: new Date().toISOString()
  });
});

app.get('/api/dashboard/chart-data', (req, res) => {
  const data = [];
  for (let i = 0; i < 7; i++) {
    data.push({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100) + 50
    });
  }
  res.json(data);
});

app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'active' }
  ];
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  const newUser = {
    id: Date.now(),
    name,
    email,
    status: 'active'
  };
  res.status(201).json(newUser);
});

app.get('/api/notifications', (req, res) => {
  res.json([
    { id: 1, message: 'System update completed', type: 'success', timestamp: new Date().toISOString() },
    { id: 2, message: 'New user registered', type: 'info', timestamp: new Date().toISOString() },
    { id: 3, message: 'Server maintenance in 2 hours', type: 'warning', timestamp: new Date().toISOString() }
  ]);
});



// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Proteus Chi Monitor server running at http://localhost:${port}`);
  console.log(`📊 Dashboard available at http://localhost:${port}`);
});