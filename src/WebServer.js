const http = require('http');
const serveStatic = require('serve-static');

const allowedExt = ['.txt', '.ico', '.png', '.html', '.js', '.ttf', '.svg', '.woff', '.css'];

const serve = serveStatic('dist/js-embedded-platform-web');

const server = http.createServer((req, res) => {
  console.log(req.url);
  if (!allowedExt.find(ext => req.url.includes(ext))) {
    req.url = 'index.html';
  }
  serve(req, res, (err) => {
    if (err) {
      res.writeHead(err.statusCode);
    }
    res.end();
  });
});

server.listen(8080);
