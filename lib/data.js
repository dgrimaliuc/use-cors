import { parseEnvList } from './utils.js';

export const headersToRemove = [
  'cookie',
  'cookie2',
  // Strip Heroku-specific headers
  'x-request-start',
  'x-request-id',
  'via',
  'connect-time',
  'total-route-time',
  // Other Vercel added  headers
  'x-real-ip',
  'x-forwarded-for',
  'x-forwarded-proto',
  'x-forwarded-port',
  'x-forwarded-host',
  'x-vercel-forwarded-for',
  'x-vercel-deployment-url',
  'postman-token',
  'x-vercel-id',
  'referer',
];

export const originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);

// TODO implement
export const allowedResourceHosts = parseEnvList(process.env.ALLOWED_URLS, [
  'hdrezka.ag',
]);

export const originWhitelist = parseEnvList(
  process.env.CORSANYWHERE_WHITELIST,
  ['https://neon-stream.web.app', 'https://neonstream.vercel.app']
);

export const requiredHeaders = ['origin', 'content-type'];
