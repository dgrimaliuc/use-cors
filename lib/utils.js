const url = require('url');

function parseEnvList(env, defaultValue = []) {
  if (!env) {
    return defaultValue;
  }
  return env.split(',');
}

// TODO use this
function arrayToMap(arr) {
  arr.reduce(
    (accumulator, current) =>
      (accumulator = { ...accumulator, [current]: true }),
    {}
  );
}

const extractURL = (req, payload) => {
  payload.url = req.body.url;
  payload.error = payload.url;
  return true;
};

const extractLocation = (_, payload) => {
  payload.location = parseURL(payload.url);
  payload.error = payload.url;
  return !!payload.location;
};

const extractHeaders = (req, payload) => {
  payload.headers = req.headers;
  payload.error = payload.headers;
  return !!payload.headers;
};

const errorMessage = (...messages) => {
  return {
    error: messages.filter((it) => it !== '').join(' '),
  };
};

async function proxyRequest(req, res, props = {}) {
  var req_url = req.body.url;

  try {
    const resp = await fetch(req_url, props);
    resp.text().then((text) => {
      res.header('Content-Type', resp.headers.get('content-type'));
      res.send(text);
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(400).json(errorMessage(err.message));
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

module.exports = {
  parseEnvList,
  extractURL,
  extractLocation,
  extractHeaders,
  errorMessage,
  proxyRequest,
  parseURL,
};
