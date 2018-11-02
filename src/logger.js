const { Console } = require('console');
const fs = require('fs');
const { DEBUG } = require('./config');

module.exports = DEBUG
  ? new Console(process.stdout, process.stderr)
  : new Console(fs.createWriteStream('/dev/null'));
