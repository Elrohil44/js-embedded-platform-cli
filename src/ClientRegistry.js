const { Registry } = require('lwm2m');
const errors = require('lwm2m/lib/errors');

class ClientRegistry extends Registry {
  constructor() {
    super();
    this.clients = [];
    this._id = 0;
  }

  _find(endpoint, callback) {
    const client = this.clients.find(c => c.ep === endpoint);
    if (!client) {
      callback(new errors.DeviceNotFound());
      return;
    }
    callback(null, Object.assign({}, client));
  }

  _get(location, callback) {
    const client = this.clients.find(c => c.location === parseInt(location, 10));
    if (!client) {
      callback(new errors.DeviceNotFound());
      return;
    }
    callback(null, Object.assign({}, client));
    console.log(client);
  }

  _save(params, callback) {
    const now = new Date();
    const location = this._id;
    this._id += 1;
    const client = Object.assign({
      expires: new Date(Date.now() + (params.lt || 86400) * 1e3),
      registeredAt: now,
      updatedAt: now,
      location,
    }, params);

    this.clients.push(client);
    callback(null, location);
  }

  _update(location, params, callback) {
    this.get(location)
      .then((res) => {
        console.log(res);
        const client = Object.assign(res, params, {
          expires: new Date(Date.now() + (params.lt || res.lt) * 1e3),
          updatedAt: new Date(),
        });
        this.clients[this.clients.findIndex(c => c.location === client.location)] = client;
        callback(null, location);
      })
      .catch(callback);
  }

  _delete(location, callback) {
    this.get(location)
      .then((client) => {
        this.clients = this.clients.filter(c => c.location !== location);
        callback(null, client);
      })
      .catch(callback);
  }
}

module.exports = ClientRegistry;
