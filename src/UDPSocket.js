const dgram = require('dgram');
const config = require('./config');
const logger = require('./logger');

const TAG = 'UDPSocket';
const LISTENERS = [
  'onMessage',
  'onError',
  'onListening',
  'onClose',
];

class UDPSocket {
  constructor(options) {
    this.socket = null;

    LISTENERS.forEach((listenerKey) => {
      if (typeof options[listenerKey] === 'function') {
        this[listenerKey] = options[listenerKey];
      }
    });

    this.messageListener = this.messageListener.bind(this);
    this.errorListener = this.errorListener.bind(this);
    this.listeningListener = this.listeningListener.bind(this);
    this.closeListener = this.closeListener.bind(this);
  }

  static createSocket(options = {}) {
    const udpSocket = new UDPSocket(options);
    const socket = dgram.createSocket(Object.assign({ type: 'udp4' }, options));

    return udpSocket.setSocket(socket);
  }

  setSocket(socket) {
    this.socket = socket;

    socket.on('message', this.messageListener);
    socket.on('error', this.errorListener);
    socket.on('close', this.closeListener);
    socket.on('listening', this.listeningListener);

    return this;
  }

  async bind(port = config.LWM2M_LOCAL_DISCOVERY_PORT) {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.socket.bind(port);
    });
  }

  messageListener(msg, rinfo) {
    logger.log(TAG, 'Message received', msg, rinfo);
    if (this.onMessage) {
      this.onMessage(msg, rinfo);
    }
  }

  errorListener(error) {
    logger.error(TAG, error);
    this.socket.close();
    if (this.onError) {
      this.onError(error);
    }

    if (this.reject) {
      this.reject(error);
      this.reject = null;
    }
  }

  listeningListener() {
    logger.log(TAG, 'Socket listening');
    this.socket.setBroadcast(true);
    if (this.onListening) {
      this.onListening();
    }

    if (this.resolve) {
      this.resolve(this);
      this.resolve = null;
    }
  }

  closeListener() {
    logger.log(TAG, 'Socket closed');
    if (this.onClose) {
      this.onClose();
    }
  }
}

module.exports = UDPSocket;
