const minimist = require('minimist');
const LwM2MServer = require('./LwM2MServer');
const UDPSocket = require('./UDPSocket');
const WebSocketServer = require('./WebSocketServer');
const config = require('./config');

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
};

const socketFile = options.socketFile || options.s || config.SOCKET_FILE;

const lwm2m = LwM2MServer.createServer({
  onError(error) {
    console.error(error);
    process.exit(1);
  },
});
const udp = UDPSocket.createSocket({
  onError(error) {
    console.error(error);
    process.exit(1);
  },
});

const webSocketServer = WebSocketServer.createServer();
webSocketServer.listen(socketFile);

lwm2m.serverListen(ports.port);
lwm2m.bsServerListen(ports.bsPort);
udp.bind()
  .then((udpServer) => {
    setTimeout(() => {
      udpServer.socket.send('EP:jsembedded2222\0', 0, 'EP:jsembedded422\0'.length, ports.discoveryPort, '255.255.255.255');
      udpServer.socket.send(`URI:coap://${config.EXTERNAL_IP}:${ports.bsPort}\0`, 0, `URI:coap://${config.EXTERNAL_IP}:${ports.bsPort}\0`.length, ports.discoveryPort, '255.255.255.255');
    }, 5000);
    setInterval(() => {
      udpServer.socket.send('', 0, 0, ports.discoveryPort, '255.255.255.255');
    }, 5000);
  });
