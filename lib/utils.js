var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST, [
  'https://neon-stream.web.app',
]);
var checkRateLimit = require('./rate-limit')(
  process.env.CORSANYWHERE_RATELIMIT
);

const requiredHeaders = ['origin'];
const headersToRemove = [
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

function parseEnvList(env, defaultValue = []) {
  if (!env) {
    return defaultValue;
  }
  return env.split(',');
}

var regexp_tld = require('./regexp-top-level-domain');
var net = require('net');
var url = require('url');

/**
 * Check whether the specified hostname is valid.
 *
 * @param hostname {string} Host name (excluding port) of requested resource.
 * @return {boolean} Whether the requested resource can be accessed.
 */
function isValidHostName(hostname) {
  return !!(
    regexp_tld.test(hostname) ||
    net.isIPv4(hostname) ||
    net.isIPv6(hostname)
  );
}

var hasRequiredHeaders = (headers) => {
  if (typeof headers !== 'object') {
    console.error('Headers are not an array:', headers);
    return false;
  }

  return (
    requiredHeaders.length == 0 ||
    Object.keys(headers).some((hd) =>
      requiredHeaders.includes(hd.toLowerCase())
    )
  );
};

var isOriginWhitelisted = (host) => {
  return originWhitelist.length === 0 || originWhitelist.includes(host);
};

const removeUnusedHeaders = (headers) => {
  if (typeof headers !== 'object') {
    console.error('Headers are not an array:', headers);
    return false;
  }

  headersToRemove.forEach((hd) => {
    delete headers[hd];
  });
};

async function proxyRequest(req, res) {
  var url = req.body.url;
  // console.log('Requesting:', url);
  try {
    const resp = await fetch(url);
    resp.text().then((text) => {
      // console.log('Response:', text);
      res.header('Content-Type', 'text/html; charset=utf-8');
      res.end(text);
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
}

function parseURL(req_url) {
  var match = req_url.match(
    /^(?:(https?:)?\/\/)?(([^\/?]+?)(?::(\d{0,5})(?=[\/?]|$))?)([\/?][\S\s]*|$)/i
  );
  //                              ^^^^^^^          ^^^^^^^^      ^^^^^^^                ^^^^^^^^^^^^
  //                            1:protocol       3:hostname     4:port                 5:path + query string
  //                                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //                                            2:host
  if (!match) {
    return null;
  }
  if (!match[1]) {
    if (/^https?:/i.test(req_url)) {
      // The pattern at top could mistakenly parse "http:///" as host="http:" and path=///.
      return null;
    }
    // Scheme is omitted.
    if (req_url.lastIndexOf('//', 0) === -1) {
      // "//" is omitted.
      req_url = '//' + req_url;
    }
    req_url = (match[4] === '443' ? 'https:' : 'http:') + req_url;
  }
  var parsed = url.parse(req_url);
  if (!parsed.hostname) {
    // "http://:1/" and "http:/notenoughslashes" could end up here.
    return null;
  }
  return parsed;
}

async function getHandler(req, res) {
  if (!req.body.url) {
    res.status(400).json({ error: 'No URL specified' });
    return;
  }

  const url = req.body.url;

  var location = parseURL(url);

  if (!location) {
    if (/https?:\/\/.+/i.test(url)) {
      res.writeHead(400, 'Bad URL parameter.');
      res.end(`The URL is invalid: '${url}'`);
      return;
    }
    return;
  }

  if (!isValidHostName(location.hostname)) {
    // Don't even try to proxy invalid hosts (such as /favicon.ico, /robots.txt)
    res.writeHead(404, 'Invalid host');
    res.end('Invalid host: ' + location.hostname);
    return;
  }

  if (!hasRequiredHeaders(req.headers)) {
    res.writeHead(401, 'Unauthorized');
    res.end('Unauthorized request');
    return;
  }

  var origin = req.headers.origin;
  if (originBlacklist.indexOf(origin) >= 0) {
    res.writeHead(403, 'Forbidden', cors_headers);
    res.end(
      `The origin ${origin} was blacklisted by the operator of this proxy.`
    );
    return;
  }

  if (!isOriginWhitelisted(origin)) {
    res.writeHead(403, 'Forbidden');
    res.end(
      `The origin "${origin}" was blacklisted by the operator of this proxy.`
    );
    return;
  }

  var rateLimitMessage = checkRateLimit(origin);
  if (rateLimitMessage) {
    res.writeHead(429, 'Too Many Requests', cors_headers);
    res.end(
      `The origin ${origin} has sent too many requests\n` + rateLimitMessage
    );
    return;
  }

  if (
    origin &&
    location.href[origin.length] === '/' &&
    location.href.lastIndexOf(origin, 0) === 0
  ) {
    var cors_headers = {};
    // Send a permanent redirect to offload the server. Badly coded clients should not waste our resources.
    cors_headers.vary = 'origin';
    cors_headers['cache-control'] = 'private';
    cors_headers.location = location.href;
    res.writeHead(301, 'Please use a direct request', cors_headers);
    res.end();
    return;
  }

  removeUnusedHeaders(req);
  await proxyRequest(req, res);
}

module.exports = { getHandler };
