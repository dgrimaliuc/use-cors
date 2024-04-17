import { requiredHeaders } from './data.js';
import { validateRequest } from './midleware.js';
import {
  extractHeaders,
  extractLocation,
  extractURL,
  removeUnusedHeaders,
} from './utils.js';
import {
  verifyBlacklist,
  verifyHostName,
  verifyRateLimit,
  verifyRequiredHeaders,
  verifyURL,
  verifyURLProvided,
  verifyWhitelist,
} from './validation.js';

function getCorsHandler(req, res, next) {
  const payload = {};
  const validations = [
    {
      action: verifyRequiredHeaders,
      status: 400,
      message: 'Missing required headers',
    },
    {
      action: verifyURLProvided,
      status: 400,
      message: 'No URL specified',
    },
    {
      action: extractURL,
      status: 400,
      message: 'Failed to extract URL',
    },
    {
      action: verifyURL,
      status: 400,
      message: 'The URL is invalid: ' + payload.url,
    },
    {
      action: extractLocation,
      status: 400,
      message: 'Failed to extract Location from: ' + payload.url,
    },
    {
      action: verifyHostName,
      status: 404,
      message: 'Invalid host: ',
    },
    {
      action: extractHeaders,
      status: 500,
      message: 'Failed to extract headers',
    },
    {
      action: verifyBlacklist,
      status: 403,
      message: `The origin was blacklisted by the operator of this proxy`,
    },

    {
      action: verifyWhitelist,
      status: 403,
      message: `The host is not whitelisted in this proxy.`,
    },
    {
      action: verifyRateLimit,
      status: 429,
      message: '',
    },
  ];

  validateRequest({ req, res, next, payload, validations });
}

function getStreamHandler(req, res, next) {
  const payload = {};
  const validations = [
    {
      action: verifyURLProvided,
      status: 400,
      message: 'No URL specified',
    },
    {
      action: extractURL,
      status: 400,
      message: 'Failed to extract URL',
    },
    {
      action: verifyURL,
      status: 400,
      message: 'The URL is invalid: ' + payload.url,
    },
  ];

  validateRequest({ req, res, next, payload, validations });
}

export { getCorsHandler, getStreamHandler };
