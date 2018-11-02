const LwM2MServer = require('./LwM2MServer');
const UDPSocket = require('./UDPSocket');

const lwm2m = LwM2MServer.createServer();
const udp = UDPSocket.createSocket();

console.log(process.env.NODE_ENV);

lwm2m.listen();
udp.bind();

setInterval(() => console.log(lwm2m.registry.clients), 5000);
