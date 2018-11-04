const dgram = require('dgram');
const os = require('os');
const logger = require('./logger');

const INTERFACES = os.networkInterfaces();
const INTERFACESv4 = Object.keys(INTERFACES)
  .map(key => INTERFACES[key].find(netIf => netIf.family === 'IPv4'))
  .filter(Boolean);

const TAG = 'UDPSocket';
const LISTENERS = [
  'onMessage',
  'onError',
  'onListening',
  'onClose',
];

class UDPSocket {
  constructor(options) {
    this.options = options;
    this.sockets = [];

    LISTENERS.forEach((listenerKey) => {
      if (typeof options[listenerKey] === 'function') {
        this[listenerKey] = options[listenerKey];
      }
    });

    this.messageListener = this.messageListener.bind(this);
    this.errorListener = this.errorListener.bind(this);
    this.listeningListener = this.listeningListener.bind(this);
    this.closeListener = this.closeListener.bind(this);
    this.setSockets = this.setSockets.bind(this);
  }

  static createSocket(options = {}) {
    return new UDPSocket(options);
  }

  setSockets(sockets) {
    this.sockets = sockets;

    sockets.forEach((socket) => {
      socket.on('message', this.messageListener(socket));
      socket.on('close', this.closeListener(socket));
    });

    return this;
  }

  async bind(port) {
    if (this.sockets.length) {
      this.sockets.forEach(socket => socket.close());
    }
    return Promise.all(INTERFACESv4.map(netIf => new Promise((resolve, reject) => {
      const socket = dgram.createSocket(Object.assign({ type: 'udp4' }, this.options || {}));
      socket.on('error', this.errorListener(socket, reject));
      socket.bind(port, netIf.address, () => this.listeningListener(socket, resolve));
    })))
      .then(sockets => this.setSockets(sockets));
  }

  send(msg, offset, length, port, address) {
    this.sockets.forEach(socket => socket.send(msg, offset, length, port, address));
  }

  sendCoapUri(bsPort, port, address) {
    this.sockets.forEach(socket => socket
      .send(`URI:coap://${socket.address().address}:${bsPort}\0`, 0, `URI:coap://${socket.address().address}:${bsPort}\0`.length, port, address));
  }

  messageListener(socket) {
    return (msg, rinfo) => {
      logger.log(TAG, 'Message received', msg, rinfo);
      if (this.onMessage) {
        this.onMessage(msg, rinfo);
      }
    };
  }

  errorListener(socket, reject) {
    return (error) => {
      logger.error(TAG, error);
      socket.close();
      if (this.onError) {
        this.onError(error);
      }

      if (reject) {
        reject(error);
      }
    };
  }

  listeningListener(socket, resolve) {
    logger.log(TAG, 'Socket listening');
    socket.setBroadcast(true);
    if (this.onListening) {
      this.onListening();
    }
    if (resolve) {
      resolve(socket);
    }
  }

  closeListener(socket) {
    return () => {
      logger.log(TAG, 'Socket closed');
      if (this.onClose) {
        this.onClose();
      }
    };
  }
}

module.exports = UDPSocket;
