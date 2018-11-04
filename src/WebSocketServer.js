const http = require('http');
const webSocketServer = require('ws');
const fs = require('fs');
const config = require('./config');
const logger = require('./logger');

const TAG = 'WebSocketServer';
const LISTENERS = [
  'onConnection',
];

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

function preListen(socketFile) {
  try {
    if (fs.existsSync(socketFile)) {
      fs.unlinkSync(socketFile);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

class WebSocketServer {
  constructor(options) {
    this.wss = null;
    this.server = null;

    LISTENERS.forEach((listenerKey) => {
      if (typeof options[listenerKey] === 'function') {
        this[listenerKey] = options[listenerKey];
      }
    });

    this.connectionListener = this.connectionListener.bind(this);
  }

  static createServer(options = {}) {
    const wss = new WebSocketServer(options);
    wss.server = http.createServer();
    wss.wss = new webSocketServer.Server({ server: wss.server });

    wss.wss.on('connection', wss.connectionListener);
    return wss;
  }

  listen(path = config.SOCKET_FILE) {
    if (this.server.listening) return;
    preListen(path);

    this.server.listen({ path }, () => {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      this.healthCheckInterval = setInterval(() => {
        this.wss.clients.forEach((ws) => {
          if (ws.isAlive === false) return ws.terminate();

          Object.assign(ws, { isAlive: false });
          return ws.ping(noop);
        });
      }, 30000);
    });
  }

  connectionListener(ws) {
    logger.log(TAG, 'Connection received');
    Object.assign(ws, { isAlive: true });
    ws.on('pong', heartbeat);
    ws.on('message', (data) => {
      logger.log(TAG, 'Message received', data);
    });
    if (typeof this.onConnection === 'function') {
      this.onConnection(ws);
    }
  }
}

module.exports = WebSocketServer;
