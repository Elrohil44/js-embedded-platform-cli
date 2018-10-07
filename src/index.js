const LwM2M = require('lwm2m');

const server = LwM2M.createServer({
  type: 'udp4',
});

server.on('register', (params, accept) => {
  setImmediate(() => {
    server
      .read(params.ep, '3/0')
      .then((device) => {
        console.log(JSON.stringify(device, null, 4));
      });
    accept();
  });
});

console.log('Server listening on port 5678');
server.listen(5678);
