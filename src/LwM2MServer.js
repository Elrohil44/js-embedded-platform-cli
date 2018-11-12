const LwM2M = require('lwm2m');

LwM2M.schemas[1] = LwM2M.Schema(require('./models/server.json'));
LwM2M.schemas[3] = LwM2M.Schema(require('./models/device.json'));
LwM2M.schemas[5] = LwM2M.Schema(require('./models/firmware_update.json'));

const Registry = require('./ClientRegistry');
const config = require('./config');
const logger = require('./logger');

const TAG = 'LwM2MServer';
const LISTENERS = [
  'onRegister',
  'onUpdate',
  'onDeregister',
  'onBootstrapRequest',
  'onError',
];

class LwM2MServer {
  constructor(options) {
    this.bsServer = null;
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
    this.bootstrapRequestListener = this.bootstrapRequestListener.bind(this);
  }

  static createServer(options = {}) {
    const server = new LwM2MServer(options);
    const registry = options.registry || new Registry();
    const lwm2m = LwM2M.createServer(Object.assign({
      type: 'udp4',
      registry,
    }, options));

    const bsServer = LwM2M.bootstrap.createServer({
      type: 'udp4',
    });

    return server.setServer({
      server: lwm2m,
      registry,
      bsServer,
    });
  }

  setServer({ server, registry, bsServer }) {
    this.server = server;
    this.bsServer = bsServer;
    this.registry = registry;

    server.on('register', this.registerListener);
    bsServer.on('bootstrapRequest', this.bootstrapRequestListener);
    server.on('update', this.updateListener);
    server.on('deregister', this.deregisterListener);
    server.on('error', this.errorListener);
    bsServer.on('error', this.errorListener);
    bsServer.on('listening', this.errorListener);

    return this;
  }

  serverListen(port = config.LWM2M_LOCAL_PORT) {
    this.server.close();
    this.port = port;
    this.server.listen(port);
    return this;
  }

  bsServerListen(bsPort = config.LWM2M_BOOTSTRAP_LOCAL_PORT) {
    this.bsServer.close();
    this.bsPort = bsPort;
    this.bsServer.listen(bsPort);
    return this;
  }

  bootstrapRequestListener(params, accept) {
    logger.log(TAG, 'Bootstrap request', params);
    accept();
    setImmediate(() => {
      this.bsServer.write(params.ep, '/0/1/0', {
        uri: `coap://${config.EXTERNAL_IP}:${this.port}`,
        bootstrap: false,
        mode: 3,
        clientCert: Buffer.from([]),
        serverId: 1,
        secretKey: Buffer.from([]),
      }, { format: 'json' })
        .then(console.log)
        .then(() => this.bsServer.write(params.ep, '/1/1/0', {
          0: 1,
          1: 30,
          6: false,
          7: 'U',
        }, { format: 'tlv' }))
        .then(() => this.bsServer.finish(params.ep))
        .then(console.log)
        .catch(console.log);
      if (typeof this.onBootstrapRequest === 'function') {
        this.onBootstrapRequest(params);
      }
    });
  }

  registerListener(params, accept) {
    logger.log(TAG, 'Register request', params);
    accept();
    setImmediate(() => {
      if (typeof this.onRegister === 'function') {
        this.onRegister(params);
      }
    });
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

  async read(endpoint, resources, options) {
    return this.server.read(endpoint, resources, options);
  }

  async execute(endpoint, resources, value) {
    return this.server.execute(endpoint, resources, value);
  }

  async write(endpoint, resources, value, options) {
    return this.server.write(endpoint, resources, value, options);
  }
}

module.exports = LwM2MServer;
