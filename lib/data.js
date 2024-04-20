const { parseEnvList } = require('./utils.js');

const originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);

// TODO implement
const allowedResourceHosts = parseEnvList(process.env.ALLOWED_URLS, [
  'hdrezka.ag',
]);

const originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST, [
  'https://neon-stream.web.app',
  'https://neonstream.vercel.app',
]);

const requiredHeaders = ['origin', 'content-type'];

module.exports = {
  originBlacklist,
  originWhitelist,
  requiredHeaders,
  allowedResourceHosts,
};
