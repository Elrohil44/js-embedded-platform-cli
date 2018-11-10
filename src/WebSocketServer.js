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
    this.wssUnix = null;
    this.serverUnix = null;
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
    wss.wss = new webSocketServer.Server({ server: wss.server, clientTracking: true });
    wss.serverUnix = http.createServer();
    wss.wssUnix = new webSocketServer.Server({ server: wss.serverUnix, clientTracking: true });

    wss.wss.on('connection', wss.connectionListener);
    wss.wssUnix.on('connection', wss.connectionListener);
    return wss;
  }

  listen({ path = config.SOCKET_FILE, port = config.SOCKET_PORT }) {
    if (this.server.listening) return;
    preListen(path);

    this.server.listen({ port }, () => {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      this.healthCheckInterval = setInterval(() => {
        this.wss.clients.forEach((ws) => {
          if (ws.isAlive === false) return ws.terminate();

          Object.assign(ws, { isAlive: false });
          return ws.ping(noop);
        });
      }, 15000);
    });

    this.serverUnix.listen({ path }, () => {
      if (this.healthCheckIntervalUnix) {
        clearInterval(this.healthCheckIntervalUnix);
      }
      this.healthCheckIntervalUnix = setInterval(() => {
        this.wssUnix.clients.forEach((ws) => {
          if (ws.isAlive === false) return ws.terminate();

          Object.assign(ws, { isAlive: false });
          return ws.ping(noop);
        });
      }, 15000);
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
