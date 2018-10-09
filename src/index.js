const LwM2M = require('lwm2m');

const server = LwM2M.createServer({
  type: 'udp4',
});

const javascriptCode = `function xpy(x, y) {
  const xm1 = x - 1;
  const yp1 = y + 1;
  return xm1 + yp1;
}`;

server.on('register', (params, accept) => {
  setImmediate(() => {
    server
      .write(params.ep, '5/0/0', javascriptCode)
      .then(console.log)
      .catch(console.log);
    server
      .read(params.ep, '3/0')
      .then((device) => {
        console.log(JSON.stringify(device, null, 4));
      });
  });
  accept();
});

console.log('Server listening on port 5683');
server.listen(5683);
