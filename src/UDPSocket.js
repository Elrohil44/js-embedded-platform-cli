const dgram = require('dgram');
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
    this.options = options;
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
    return new UDPSocket(options);
  }

  setSocket(socket) {
    this.socket = socket;

    socket.on('message', this.messageListener);
    socket.on('error', this.errorListener);
    socket.on('close', this.closeListener);

    return this;
  }

  bind(port) {
    if (this.socket) {
      this.socket.close();
    }
    if (this.reject) {
      this.reject(new Error('Socket closed'));
    }
    return new Promise((resolve, reject) => {
      this.reject = reject;
      this.setSocket(dgram.createSocket(Object.assign({ type: 'udp4' }, this.options || {})));
      this.socket.bind(port, () => this.listeningListener(resolve, reject));
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

  listeningListener(resolve) {
    logger.log(TAG, 'Socket listening');
    this.socket.setBroadcast(true);
    if (this.onListening) {
      this.onListening();
    }
    if (resolve) {
      resolve(this);
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
