const os = require('os');

const NETWORK_INTERFACES = os.networkInterfaces();
const EXTERNAL_IP = Object.keys(NETWORK_INTERFACES).map(
  netIf => NETWORK_INTERFACES[netIf].find(addr => !addr.internal),
).find(Boolean).address;

module.exports = {
  LWM2M_DEVICE_DISCOVERY_PORT: process.env.LWM2M_DEVICE_DISCOVERY_PORT || 56840,
  LWM2M_LOCAL_PORT: process.env.LWM2M_LOCAL_PORT || 5683,
  LWM2M_BOOTSTRAP_LOCAL_PORT: process.env.LWM2M_BOOTSTRAP_LOCAL_PORT || 5685,
  SOCKET_FILE: process.env.SOCKET_FILE || '/tmp/js-embedded-websocket',
  SOCKET_PORT: process.env.SOCKET_PORT || 60606,
  DEBUG: process.env.NODE_ENV !== 'production',
  EXTERNAL_IP,
};
