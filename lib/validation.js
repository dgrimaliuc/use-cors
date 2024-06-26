const {
  originBlacklist,
  originWhitelist,
  requiredHeaders,
  allowedResourceHosts,
} = require('./data.js');
const { checkRateLimit } = require('./rate-limit.js');
const { regexp_tld } = require('./regexp-top-level-domain.js');
const net = require('net');

const verifyRequiredHeaders = (req, payload) => {
  const found = Object.keys(req.headers).filter((hd) =>
    requiredHeaders.includes(hd.toLowerCase())
  );
  payload.error = payload.requiredHeaders;
  return requiredHeaders.length == 0 || found.length === requiredHeaders.length;
};

const verifyURLProvided = (req, payload) => {
  payload.error = JSON.stringify(req.body);
  payload.error = 'No URL specified';
  return !!req.body.url;
};

const verifyURL = (_, payload) => {
  payload.error = payload.url;
  return /https?:\/\/.+/i.test(payload.url);
};

const verifyWhitelist = (_, payload) => {
  payload.error = payload.headers.origin;
  return (
    originWhitelist.length === 0 ||
    originWhitelist.includes(payload.headers.origin)
  );
};

const verifyResourceHost = (_, payload) => {
  payload.error = payload.location.host;
  return (
    allowedResourceHosts.length === 0 ||
    allowedResourceHosts.includes(payload.location.host)
  );
};

function verifyRateLimit(_, payload) {
  const rateLimitMessage = checkRateLimit(payload.headers.origin);
  if (rateLimitMessage) {
    payload.error = rateLimitMessage;
  }
  return !rateLimitMessage;
}

function verifyHostName(_, payload) {
  const host = payload.location.hostname;
  payload.error = host;
  return !!(regexp_tld.test(host) || net.isIPv4(host) || net.isIPv6(host));
}

function verifyBlacklist(_, payload) {
  const origin = payload.headers.origin;
  payload.error = origin;
  return originBlacklist.indexOf(origin) < 0;
}

module.exports = {
  verifyRequiredHeaders,
  verifyURLProvided,
  verifyResourceHost,
  verifyURL,
  verifyWhitelist,
  verifyRateLimit,
  verifyHostName,
  verifyBlacklist,
};
