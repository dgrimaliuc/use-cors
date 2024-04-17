import { originBlacklist, originWhitelist, requiredHeaders } from './data.js';
import { checkRateLimit } from './rate-limit.js';
import { regexp_tld } from './regexp-top-level-domain.js';
import net from 'net';

export const verifyRequiredHeaders = (req, payload) => {
  const found = Object.keys(req.headers).filter((hd) =>
    requiredHeaders.includes(hd.toLowerCase())
  );
  payload.error = payload.requiredHeaders;
  return requiredHeaders.length == 0 || found.length === requiredHeaders.length;
};

export const verifyURLProvided = (req) => {
  return !!req.body.url;
};

export const verifyURL = (_, payload) => {
  return /https?:\/\/.+/i.test(payload.url);
};

export const verifyWhitelist = (_, payload) => {
  payload.error = payload.headers.origin;
  return (
    originWhitelist.length === 0 ||
    originWhitelist.includes(payload.headers.origin)
  );
};

export function verifyRateLimit(_, payload) {
  const rateLimitMessage = checkRateLimit(payload.headers.origin);
  if (rateLimitMessage) {
    payload.error = rateLimitMessage;
  }
  return !rateLimitMessage;
}

export function verifyHostName(_, payload) {
  const host = payload.location.hostname;
  payload.error = host;
  return !!(regexp_tld.test(host) || net.isIPv4(host) || net.isIPv6(host));
}

export function verifyBlacklist(_, payload) {
  const origin = payload.headers.origin;
  payload.error = origin;
  return originBlacklist.indexOf(origin) < 0;
}
