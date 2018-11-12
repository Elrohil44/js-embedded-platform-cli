const fs = require('fs');
const { LwM2MObject, LwM2MObjectInstance, OBJECT_MAPPING } = require('./models/objects');

function openFileReadOnly(path) {
  return new Promise((resolve, reject) => {
    fs.open(path, 'r', (err, fd) => {
      if (err) {
        reject(err);
      } else {
        resolve(fd);
      }
    });
  });
}

function fstat(fd) {
  return new Promise((resolve, reject) => {
    fs.fstat(fd, (err, stat) => {
      if (err) {
        reject(err);
      } else {
        resolve(stat);
      }
    });
  });
}

function getCoapUri(socket, bsPort) {
  return `URI:coap://${socket.address().address}:${bsPort}`;
}

function mapLocationsToArray(deviceLocations) {
  return Object.keys(deviceLocations)
    .map((key) => {
      const { ip, port, healthy } = deviceLocations[key];
      return { ip, port, healthy };
    });
}

function mapDevice({
  ep: endpoint, registeredAt, updatedAt, objects,
}) {
  const objectsAsClasses = Object.keys(objects)
    .map((objId) => {
      const LwM2MObjectConstructor = (OBJECT_MAPPING[objId] && OBJECT_MAPPING[objId].object)
        || LwM2MObject;
      const object = new LwM2MObjectConstructor();
      object.id = Number(objId);
      object.instances = objects[objId].map((id) => {
        const ObjectInstance = (OBJECT_MAPPING[objId] && OBJECT_MAPPING[objId].objectInstance)
          || LwM2MObjectInstance;
        const instance = new ObjectInstance();
        instance.id = Number(id);
        return instance;
      });
      return object;
    });
  return {
    endpoint,
    registeredAt,
    updatedAt,
    objects: objectsAsClasses,
  };
}

function mapDevices(clients) {
  return clients.map(mapDevice);
}

module.exports = {
  getCoapUri,
  mapLocationsToArray,
  mapDevices,
  mapDevice,
  openFileReadOnly,
  fstat,
};
