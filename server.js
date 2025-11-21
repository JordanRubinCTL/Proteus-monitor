const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');

const app = express();
const port = process.env.PORT || 3000;







// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('.'));

// API Routes
app.get('/api/service-status', async (req, res) => {
  const { exec } = require('child_process');
  const { NodeSSH } = require('node-ssh');
  const services = [];
  
  // Configuration: Set to true if running in Docker and need to check host services
  const USE_SSH = process.env.CHECK_HOST_SERVICES === 'true';
  const SSH_HOST = process.env.SSH_HOST || 'host.docker.internal';
  const SSH_USER = process.env.SSH_USER || 'root';
  const SSH_KEY_PATH = process.env.SSH_KEY_PATH || '/root/.ssh/id_rsa';
  
  const checkService = async (name, command, pattern) => {
    try {
      let stdout = '';
      
      if (USE_SSH) {
        const ssh = new NodeSSH();
        await ssh.connect({
          host: SSH_HOST,
          username: SSH_USER,
          privateKeyPath: SSH_KEY_PATH,
          readyTimeout: 5000
        });
        const result = await ssh.execCommand(command);
        stdout = result.stdout;
        ssh.dispose();
      } else {
        // Direct execution on host
        stdout = await new Promise((resolve, reject) => {
          exec(command, (error, stdout) => {
            resolve(stdout || '');
          });
        });
      }
      
      const running = stdout.includes(pattern) || stdout.trim().length > 0;
      services.push({
        name: name,
        status: running ? 'running' : 'not running'
      });
    } catch (error) {
      console.error(`Error checking ${name}:`, error.message);
      services.push({
        name: name,
        status: 'error'
      });
    }
  };
  
  try {
    await Promise.all([
      checkService('UCF Protevs', 'echo "UCF"', 'UCF'),
      checkService('DHCP SERVER', 'ps -aef | grep -v grep | grep dhcpd', 'dhcpd -user dhcpd -group dhcpd'),
      checkService('DHCP Watcher', 'ps -aef | grep -v grep | grep dhcpd_watcher', '/usr/bin/perl /app/automation/bin/dhcpd_watcher'),
      checkService('CVS Server', 'ps -aef | grep -v grep | grep cvsd', '/usr/sbin/cvsd -f /etc/cvsd/cvsd.conf'),
      checkService('CRON', 'ps -aef | grep -v grep | grep cron', '/usr/sbin/cron'),
      checkService('SFTP Server', 'ps -aef | grep -v grep | grep vsftpd', '/usr/sbin/vsftpd'),
      checkService('Postgres', 'ps -aef | grep -v grep | grep postgresql', '/usr/lib/postgresql/14/bin/postgres -D'),
      checkService('TFTP', 'ps -aef | grep -v grep | grep /usr/sbin/in.tftpd', '/usr/sbin/in.tftpd --listen'),
      checkService('NFS', 'mount | grep ucf', '/mnt/nfs/ucfcorpnfs')
    ]);
    
    res.json({
      timestamp: new Date().toISOString(),
      services: services
    });
  } catch (error) {
    console.error('Service status check failed:', error);
    res.status(500).json({
      error: 'Failed to check service status',
      timestamp: new Date().toISOString()
    });
  }
});

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

// DAS Health Proxy Endpoint
// This endpoint proxies requests to the DAS health endpoint to avoid CORS issues
app.get('/api/das-health-proxy', (req, res) => {
  const username = req.headers['x-das-username'];
  const password = req.headers['x-das-password'];

  console.log(`\n📥 DAS Health Proxy Request Received`);
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password ? '********' : '(missing)'}`);

  if (!username || !password) {
    console.log(`❌ Missing credentials`);
    return res.status(400).json({ 
      error: 'Missing credentials',
      message: 'X-DAS-Username and X-DAS-Password headers are required' 
    });
  }

  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  const targetUrl = 'https://dasprod1.corp.intranet/restricted/dasmon.pl/v1/health';

  console.log(`🔄 Proxying request to: ${targetUrl}`);
  console.log(`   Authorization: Basic ${credentials.substring(0, 10)}...`);

  const options = {
    hostname: 'dasprod1.corp.intranet',
    path: '/restricted/dasmon.pl/v1/health',
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json'
    },
    // For corporate internal servers, you might need to disable SSL verification
    // Remove this in production if your cert is valid
    rejectUnauthorized: false
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = '';

    console.log(`📡 DAS responded with status: ${proxyRes.statusCode}`);

    proxyRes.on('data', (chunk) => {
      data += chunk;
    });

    proxyRes.on('end', () => {
      console.log(`✅ DAS health response complete (${data.length} bytes)`);
      console.log(`   First 100 chars: ${data.substring(0, 100)}...`);
      
      res.status(proxyRes.statusCode);
      
      // Forward headers
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });

      // Try to parse as JSON, fallback to plain text
      try {
        const jsonData = JSON.parse(data);
        console.log(`✅ JSON parsed successfully`);
        res.json(jsonData);
      } catch (e) {
        console.log(`⚠️  Response is not JSON, sending as plain text`);
        res.send(data);
      }
    });
  });

  proxyReq.on('error', (error) => {
    console.error(`\n❌ DAS Health Proxy Error:`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    console.error(`   Details:`, error);
    
    res.status(502).json({ 
      error: 'Proxy Error',
      message: error.message,
      code: error.code,
      details: 'Failed to connect to DAS health endpoint. Possible reasons:\n' +
               '1. Not connected to corporate network/VPN\n' +
               '2. DAS service is down\n' +
               '3. DNS cannot resolve dasprod1.corp.intranet\n' +
               '4. Network configuration issue'
    });
  });

  proxyReq.end();
});



// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Proteus Chi Monitor server running at http://localhost:${port}`);
  console.log(`📊 Dashboard available at http://localhost:${port}`);
});