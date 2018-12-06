#!/usr/bin/env node

const minimist = require('minimist');
const LwM2MServer = require('./LwM2MServer');
const UDPSocket = require('./UDPSocket');
const WebSocketServer = require('./WebSocketServer');
const ClientRegistry = require('./ClientRegistry');
const FirmwareUploader = require('./FirmwareUploader');
const MessageType = require('./MessageType');
require('./WebServer');

const {
  getCoapUri, mapLocationsToArray, mapDevices, mapDevice,
} = require('./utils');

const config = require('./config');
const logger = require('./logger');

const options = minimist(process.argv.slice(2));

function printUsage() {
  console.log([
    '',
    '  Usage: yarn start [options]',
    '',
    '',
    '  Options:',
    '',
    '    -h, --help                   \tprint this message',
    `    -b, --bootstrapPort [NUMBER] \tdefine port for bootstrap server (default: ${config.LWM2M_BOOTSTRAP_LOCAL_PORT})`,
    `    -p, --port [NUMBER]          \tdefine port for server (default: ${config.LWM2M_LOCAL_PORT})`,
    `    -d, --discoveryPort [NUMBER] \tdefine port used by devices for discovery (default: ${config.LWM2M_DEVICE_DISCOVERY_PORT})`,
    `    -s, --socketFile [SOCKET_FILE]\tdefine socket file used to communicate with web socket (default: ${config.SOCKET_FILE})`,
    `    -w, --websocketPort [SOCKET_FILE]\tdefine socket port used to communicate with web socket (default: ${config.SOCKET_PORT})`,
    `    -u, --uploadPort [NUMBER]\tdefine port used to transfer code to the device (default: ${config.UPLOAD_PORT})`,
    `    -f, --sourceFile [PATH]\tdefine source file which will be uploaded to device (default: ${config.FILE_PATH})`,
    '',
  ].join('\n'));
}

if (options.h || options.help) {
  printUsage();
  process.exit(0);
}

const ports = {
  bsPort: options.bootstrapPort || options.b || config.LWM2M_BOOTSTRAP_LOCAL_PORT,
  port: options.port || options.p || config.LWM2M_LOCAL_PORT,
  discoveryPort: options.discoveryPort || options.d || config.LWM2M_DEVICE_DISCOVERY_PORT,
  uploadPort: options.uploadPort || options.u || config.UPLOAD_PORT,
};

const socketFile = options.socketFile || options.s || config.SOCKET_FILE;
const socketPort = options.websocketPort || options.w || config.SOCKET_PORT;
const sourceFile = options.sourceFile || options.f || config.FILE_PATH;

const deviceLocations = {};
const deviceLocationsSubscribers = new Set();

setInterval(() => {
  const locations = mapLocationsToArray(deviceLocations);
  deviceLocationsSubscribers.forEach((client) => {
    client.send(JSON.stringify({
      type: MessageType.DEVICE_LOCATIONS,
      deviceLocations: locations,
    }));
  });
  Object.keys(deviceLocations).forEach((key) => {
    deviceLocations[key].healthy += 1;
  });
}, 5000);

const deviceRegistry = new ClientRegistry();
const devicesSubscribers = new Set();

setInterval(() => {
  const devices = mapDevices(deviceRegistry.clients);
  devicesSubscribers.forEach((client) => {
    client.send(JSON.stringify({
      type: MessageType.DEVICE_LIST,
      devices,
    }));
  });
}, 5000);

function connectDevice({ port, ip, endpoint }, onError) {
  if (!port || !ip || !endpoint) {
    onError({
      type: MessageType.ERROR,
      message: 'Missing parameters to request device to connect',
    });
  }

  const deviceLocation = deviceLocations[`${ip}:${port}`];
  if (!deviceLocation) {
    onError({
      type: MessageType.ERROR,
      message: 'Unable to connect: Cannot find device location in database',
    });
  }

  const coapUri = getCoapUri(deviceLocation.socket, ports.bsPort);
  const epMsg = `EP:${endpoint}`;

  deviceLocation.socket.send(epMsg, 0, epMsg.length, port, ip);
  deviceLocation.socket.send(coapUri, 0, coapUri.length, port, ip);
}

const lwm2m = LwM2MServer.createServer({
  onError(error) {
    console.error(error);
    process.exit(1);
  },
  onRegister(params) {
    const regExp = new RegExp(/(?:<((?:\/[0-9])+)>)/g);
    const objects = {};
    const instances = [];
    let match = regExp.exec(params.payload);
    while (match) {
      instances.push(match[1]);
      match = regExp.exec(params.payload);
    }
    instances
      .map(instance => instance.split('/').filter(Boolean))
      .forEach(([objectId, instanceId]) => {
        const objectInstances = objects[objectId] || [];
        objectInstances.push(instanceId);
        objects[objectId] = objectInstances;
      });
    deviceRegistry.find(params.ep)
      .then(({ location }) => deviceRegistry.update(location, { objects }))
      .catch(console.error);
  },
  registry: deviceRegistry,
});
const udp = UDPSocket.createSocket({
  onError(error) {
    console.error(error);
    process.exit(1);
  },
  onMessage(data, rinfo, socket) {
    deviceLocations[`${rinfo.address}:${rinfo.port}`] = {
      socket,
      ip: rinfo.address,
      port: rinfo.port,
      healthy: 0,
    };
  },
});

const firmwareUploader = FirmwareUploader.create(sourceFile);
const webSocketServer = WebSocketServer.createServer({
  onConnection(ws) {
    ws.on('message', (msg) => {
      let payload;
      try {
        payload = JSON.parse(msg);
      } catch (error) {
        ws.send(JSON.stringify({
          type: MessageType.ERROR,
          message: error.message,
        }));
        return;
      }

      switch (payload.type) {
        case MessageType.SUB_DEVICE_LOCATIONS:
          ws.send(JSON.stringify({
            type: MessageType.DEVICE_LOCATIONS,
            deviceLocations: mapLocationsToArray(deviceLocations),
          }));
          if (!deviceLocationsSubscribers.has(ws)) {
            ws.on('close', () => deviceLocationsSubscribers.delete(ws));
            deviceLocationsSubscribers.add(ws);
          }
          break;
        case MessageType.UNSUB_DEVICE_LOCATIONS:
          deviceLocationsSubscribers.delete(ws);
          break;
        case MessageType.CONNECT_DEVICE:
          connectDevice(payload, (err) => {
            ws.send(JSON.stringify(err));
          });
          break;
        case MessageType.SUB_DEVICE_LIST:
          ws.send(JSON.stringify({
            type: MessageType.DEVICE_LIST,
            devices: mapDevices(deviceRegistry.clients),
          }));
          if (!devicesSubscribers.has(ws)) {
            ws.on('close', () => devicesSubscribers.delete(ws));
            devicesSubscribers.add(ws);
          }
          break;
        case MessageType.GET_DEVICE:
          deviceRegistry.find(payload.endpoint)
            .then((client) => {
              ws.send(JSON.stringify({
                type: MessageType.DEVICE,
                device: mapDevice(client),
              }));
            })
            .catch((err) => {
              ws.send(JSON.stringify({
                type: MessageType.ERROR,
                message: `Device not found: ${payload.endpoint}: ${err.message}`,
              }));
            });
          break;
        case MessageType.READ:
          lwm2m.read(payload.endpoint, payload.resource)
            .then(res => ws.send(JSON.stringify({
              type: MessageType.READ_RESPONSE,
              endpoint: payload.endpoint,
              resource: payload.resource,
              data: res,
            })))
            .catch((err) => {
              ws.send(JSON.stringify({
                type: MessageType.READ_ERROR,
                endpoint: payload.endpoint,
                resource: payload.resource,
                message: err.message || 'Client Error',
                error: err.name,
              }));
            });
          break;
        case MessageType.RESTART:
          lwm2m.execute(payload.endpoint, '/3/0/4')
            .then(logger.log)
            .catch(err => ws.send(JSON.stringify({
              type: MessageType.ERROR,
              endpoint: payload.endpoint,
              error: err.name,
              message: err.message || 'Client Error',
            })));
          break;
        case MessageType.UPDATE_FIRMWARE:
          deviceRegistry.find(payload.endpoint)
            .then((client) => {
              const location = Object.keys(deviceLocations)
                .map(key => deviceLocations[key])
                .find(({ ip }) => ip === client.address);
              if (!location) {
                throw new Error('Cannot establish connection');
              }
              return lwm2m.write(payload.endpoint, '/5/0/1', `firm://${location.socket.address().address}:${ports.uploadPort}`);
            })
            .catch(err => ws.send(JSON.stringify({
              type: MessageType.ERROR,
              endpoint: payload.endpoint,
              error: err.name,
              message: err.message || 'Client Error',
            })));
          break;
        case MessageType.NOOP:
          break;
        default:
          ws.send(JSON.stringify({
            type: MessageType.UNSUPPORTED_TYPE,
          }));
      }
    });
  },
});

firmwareUploader.listen(ports.uploadPort);

lwm2m.serverListen(ports.port);
lwm2m.bsServerListen(ports.bsPort);
udp.bind()
  .then((udpServer) => {
    setInterval(() => {
      udpServer.send('', 0, 0, ports.discoveryPort, '255.255.255.255');
    }, 5000);
  });
webSocketServer.listen({ path: socketFile, port: socketPort });
