const fs = require('fs');
const net = require('net');
const utils = require('./utils');
const config = require('./config');

const PAYLOAD_TYPE_REQUEST = 0x04;
const PAYLOAD_TYPE_DESCRIPTION = 0x05;
const PAYLOAD_TYPE_FLOW_START = 0xA0;
const PAYLOAD_TYPE_FLOW_END = 0xA3;
const PAYLOAD_TYPE_CHUNK = 0xA1;
const PAYLOAD_TYPE_CHUNK_ACK = 0xA2;

const CHUNK_MULTIPLIER = 8;

class FirmwareUploader {
  constructor() {
    this.programName = '';
    this.path = '';

    this.connectionListener = this.connectionListener.bind(this);
    this._processFile = this._processFile.bind(this);
  }

  static create(path = config.FILE_PATH) {
    const uploader = new FirmwareUploader();
    uploader.programName = path.split(/\/|\\/).filter(Boolean).slice(-1)[0] || '';
    uploader.path = path;
    uploader.initServer();
    return uploader;
  }

  initServer() {
    this.server = net.createServer(this.connectionListener);
  }

  connectionListener(socket) {
    console.log('Client connected!');
    utils.openFileReadOnly(this.path)
      .then(fd => Promise.all([fd, utils.fstat(fd)]))
      .catch((err) => {
        console.error(err);
        throw err;
      })
      .then(([fd, stat]) => this._processFile(fd,
        socket, CHUNK_MULTIPLIER * Math.ceil(stat.size / CHUNK_MULTIPLIER)))
      .catch((err) => {
        console.log(err);
        socket.destroy();
      });
  }

  async _processFile(fd, socket, fileBytesAligned) {
    let chunkSize = 0;
    let chunkBuffer = null;
    let endFlag = false;
    let currChunk = 0;
    const sendChunk = (chunkNo) => {
      chunkBuffer.fill(0);
      fs.read(fd, chunkBuffer, 7, chunkSize, chunkNo * chunkSize, (err, bytesRead) => {
        if (err) {
          console.error(err);
          return;
        }

        let chunkBytesToSend = bytesRead;

        if (bytesRead < chunkSize) {
          chunkBuffer[7 + chunkBytesToSend] = 0x00;
          chunkBytesToSend += 1; // null terminator
          endFlag = true;
        }

        chunkBuffer[0] = PAYLOAD_TYPE_CHUNK;
        chunkBuffer.writeUInt16LE(currChunk, 1);
        chunkBuffer.writeUInt32LE(chunkBytesToSend, 3);
        socket.write(chunkBuffer, 'ascii', 7 + chunkBytesToSend);
        console.log(`Requested sending ${chunkNo}, sent ${currChunk} (bytes ${7 + chunkBytesToSend})`);
        currChunk += 1;
      });
    };

    socket.on('data', (buff) => {
      if (Buffer.isBuffer(buff)) {
        if (buff[0] === PAYLOAD_TYPE_REQUEST) {
          chunkSize = buff[1] * CHUNK_MULTIPLIER || 256;
          chunkBuffer = Buffer.alloc(chunkSize + 7, 0, 'ascii');
          const chunkCount = Math.ceil(fileBytesAligned / chunkSize);

          const descBuffer = Buffer.alloc(5 + this.programName.length, 0, 'ascii');
          descBuffer.write(this.programName, 4, this.programName.length, 'ascii');
          descBuffer[0] = PAYLOAD_TYPE_DESCRIPTION;
          descBuffer.writeUInt16LE(chunkCount, 1);
          descBuffer[3] = this.programName.length + 1;
          descBuffer[4 + this.programName.length] = 0x00;

          socket.write(descBuffer);
        } else if (buff[0] === PAYLOAD_TYPE_FLOW_START) {
          console.log('Flow start request');
          // start flow
          sendChunk(0);
        } else if (buff[0] === PAYLOAD_TYPE_CHUNK_ACK) {
          const ackChunk = buff.readUInt16LE(1);
          console.log(`Client ACK chunk ${ackChunk}`);
          if (endFlag) {
            socket.write(Buffer.from([PAYLOAD_TYPE_FLOW_END]));
          } else {
            sendChunk(ackChunk + 1);
          }
        } else {
          console.log('Unknown packet!', buff);
        }
      } else {
        console.log('Some weird string received: ', buff);
      }
    });

    socket.on('close', () => {
      fs.close(fd, (err) => {
        if (err) {
          console.error(err);
        }
      });
    });
  }

  async listen(port = config.UPLOAD_PORT) {
    return this.server.listen(port);
  }
}

module.exports = FirmwareUploader;
