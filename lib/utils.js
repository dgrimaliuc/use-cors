var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST, [
  'https://neon-stream.web.app',
]);
var checkRateLimit = require('./rate-limit')(
  process.env.CORSANYWHERE_RATELIMIT
);

const requiredHeaders = ['origin', 'content-type'];
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
    return false;
  }

  return (
    requiredHeaders.length == 0 ||
    Object.keys(headers).filter((hd) =>
      requiredHeaders.includes(hd.toLowerCase())
    ).length === requiredHeaders.length
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

const errorMessage = (message) => {
  return {
    error: message,
  };
};

async function proxyRequest(req, res, props = {}) {
  var url = req.body.url;
  let resp = null;
  try {
    resp = await fetch(url, props);
    resp.text().then((text) => {
      res.header('Content-Type', resp.headers.get('content-type'));
      res.end(text);
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(400).json(errorMessage(err.message));
  }
}

function verifyRateLimit(origin, res) {
  var rateLimitMessage = checkRateLimit(origin);
  if (rateLimitMessage) {
    res
      .status(429)
      .json(
        errorMessage(
          `The origin ${origin} has sent too many requests\n` + rateLimitMessage
        )
      );
    return;
  }
}

function verifyBlacklist(origin, res) {
  if (originBlacklist.indexOf(origin) >= 0) {
    res
      .status(403)
      .json(
        errorMessage(
          `The origin ${origin} was blacklisted by the operator of this proxy.`
        )
      );
    return;
  }
}

function verifyRequiredHeaders(req, res) {
  if (!hasRequiredHeaders(req.headers)) {
    res
      .status(401)
      .json(errorMessage('Content-Type not set or request is unauthorized'));
    return;
  }
}
function verifyWhitelist(origin, res) {
  if (!isOriginWhitelisted(origin)) {
    res
      .status(403)
      .json(
        errorMessage(
          `The origin "${origin}" was blacklisted by the operator of this proxy.`
        )
      );
    return;
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

async function getCorsHandler(req, res) {
  verifyRequiredHeaders(req, res);

  if (!req.body.url) {
    res.status(400).json(errorMessage('No URL specified'));
    return;
  }

  const url = req.body.url;

  var location = parseURL(url);

  if (!location) {
    if (/https?:\/\/.+/i.test(url)) {
      res.status(400).json(errorMessage(`The URL is invalid: '${url}'`));
      return;
    }
    return;
  }

  if (!isValidHostName(location.hostname)) {
    // Don't even try to proxy invalid hosts (such as /favicon.ico, /robots.txt)
    res.status(404).json(errorMessage('Invalid host: ' + location.hostname));
    return;
  }

  var origin = req.headers.origin || '';
  verifyBlacklist(origin, res);
  verifyWhitelist(origin, res);
  verifyRateLimit(origin, res);

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

async function getStreamHandler(req, res) {
  removeUnusedHeaders(req);

  await proxyRequest(req, res, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Host: 'hdrezka.ag',
      Origin: 'https://hdrezka.ag',
    },
    body: new URLSearchParams(req.body),
  });
}

module.exports = { getCorsHandler, getStreamHandler };
