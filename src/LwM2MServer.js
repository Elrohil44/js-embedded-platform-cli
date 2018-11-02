const LwM2M = require('lwm2m');
const config = require('./config');
const logger = require('./logger');

const TAG = 'LwM2MServer';
const LISTENERS = [
  'onRegister',
  'onUpdate',
  'onDeregister',
  'onError',
];

class LwM2MServer {
  constructor(options) {
    this.server = null;
    this.registry = null;

    LISTENERS.forEach((listenerKey) => {
      if (typeof options[listenerKey] === 'function') {
        this[listenerKey] = options[listenerKey];
      }
    });

    this.registerListener = this.registerListener.bind(this);
    this.updateListener = this.updateListener.bind(this);
    this.deregisterListener = this.deregisterListener.bind(this);
    this.errorListener = this.errorListener.bind(this);
  }

  static createServer(options = {}) {
    const server = new LwM2MServer(options);
    const registry = new LwM2M.Registry();
    const lwm2m = LwM2M.createServer(Object.assign({
      type: 'udp4',
      registry,
    }, options));

    return server.setServer(lwm2m, registry);
  }

  setServer(server, registry) {
    this.server = server;
    this.registry = registry;

    server.on('register', this.registerListener);
    server.on('update', this.updateListener);
    server.on('deregister', this.deregisterListener);
    server.on('error', this.errorListener);

    return this;
  }

  listen(port = config.LWM2M_LOCAL_PORT) {
    this.server.listen(port);
    return this;
  }

  registerListener(params, accept) {
    logger.log(TAG, 'Register request', params);
    accept();
    if (typeof this.onRegister === 'function') {
      this.onRegister(params);
    }
  }

  updateListener(location) {
    logger.log(TAG, 'Update request', location);
    if (typeof this.onUpdate === 'function') {
      this.onUpdate(location);
    }
  }

  deregisterListener(location) {
    logger.log(TAG, 'Deregister request', location);
    if (typeof this.onDeregister === 'function') {
      this.onDeregister(location);
    }
  }

  errorListener(error) {
    logger.error(TAG, error);
    if (typeof this.onError === 'function') {
      this.onError(error);
    }
  }
}

module.exports = LwM2MServer;
