const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = {}; // To keep track of clients for each session

wss.on('connection', (ws, req) => {
  // Extract a unique ID from the query string or URL
  const sessionId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('session');

  if (!clients[sessionId]) {
    clients[sessionId] = [];
  }
  clients[sessionId].push(ws);

  ws.on('message', (message) => {
    // Broadcast the message to all clients in the same session
    clients[sessionId].forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    // Remove client from session
    clients[sessionId] = clients[sessionId].filter(client => client !== ws);
    if (clients[sessionId].length === 0) {
      delete clients[sessionId]; // Clean up if no clients are left in the session
    }
  });
});

const port = 5000;
server.listen(port, () => {
  console.log(`WebSocket server running on port ${port}`);
});
