module.exports = {
  LWM2M_LOCAL_DISCOVERY_PORT: process.env.LWM2M_LOCAL_DISCOVERY_PORT || 56835,
  LWM2M_LOCAL_PORT: process.env.LWM2M_LOCAL_PORT || 5683,
  DEBUG: process.env.NODE_ENV !== 'production',
};
