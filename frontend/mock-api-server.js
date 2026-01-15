// Mock API server for local development
const http = require('http');

// In-memory data store
const users = new Map();

// Initialize with a demo user
users.set('demo-user', {
  userId: 'demo-user',
  tokenLimit: 100000,
  tokenUsage: 45230,
  lastUpdated: new Date().toISOString()
});

function handleRequest(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  console.log(`${req.method} ${path}`);

  // GET /users - List all users
  if (req.method === 'GET' && path === '/users') {
    const userList = Array.from(users.values()).map(user => ({
      ...user,
      percentageUsed: Math.round((user.tokenUsage / user.tokenLimit) * 100 * 100) / 100
    }));
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ users: userList }));
    return;
  }

  // GET /users/:userId - Get user
  if (req.method === 'GET' && path.startsWith('/users/')) {
    const userId = path.split('/')[2];
    const user = users.get(userId);
    
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'User not found', message: `User ${userId} not found` }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
    return;
  }

  // POST /users - Create user
  if (req.method === 'POST' && path === '/users') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      
      if (users.has(data.userId)) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User exists', message: 'User already exists' }));
        return;
      }
      
      const user = {
        userId: data.userId,
        tokenLimit: data.tokenLimit,
        tokenUsage: 0,
        lastUpdated: new Date().toISOString()
      };
      
      users.set(data.userId, user);
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, user }));
    });
    return;
  }

  // PUT /users/:userId/limit - Update limit
  if (req.method === 'PUT' && path.includes('/limit')) {
    const userId = path.split('/')[2];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const user = users.get(userId);
      
      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }
      
      user.tokenLimit = data.newLimit;
      user.lastUpdated = new Date().toISOString();
      users.set(userId, user);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, user }));
    });
    return;
  }

  // POST /invoke/:userId - Mock model invocation
  if (req.method === 'POST' && path.startsWith('/invoke/')) {
    const userId = path.split('/')[2];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const user = users.get(userId);
      
      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }
      
      const remainingTokens = user.tokenLimit - user.tokenUsage;
      
      if (remainingTokens <= 0) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Token limit exceeded', message: 'No tokens remaining' }));
        return;
      }
      
      // Simulate token usage (random between 100-500)
      const tokensConsumed = Math.floor(Math.random() * 400) + 100;
      user.tokenUsage += tokensConsumed;
      user.lastUpdated = new Date().toISOString();
      users.set(userId, user);
      
      const newRemainingTokens = user.tokenLimit - user.tokenUsage;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        response: `This is a mock response to your prompt: "${data.prompt}". In a real deployment, this would be Claude Sonnet 4.5's response.`,
        tokensConsumed,
        remainingTokens: Math.max(0, newRemainingTokens)
      }));
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}

const server = http.createServer(handleRequest);
const PORT = 3001;

server.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET    /users');
  console.log('  GET    /users/:userId');
  console.log('  POST   /users');
  console.log('  PUT    /users/:userId/limit');
  console.log('  POST   /invoke/:userId');
});
