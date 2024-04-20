const { errorMessage } = require('./utils.js');
const { default: config } = require('../config.js');

function validateRequest(props) {
  const { req, res, next, payload, validations } = props;
  console.log('config', config);
  if (config.debug) {
    console.log('req.headers', JSON.stringify(req.headers, null, 2));
    console.log('req.body', JSON.stringify(req.body, null, 2));
  }
  // Iterate over the validation functions
  for (const validation of validations) {
    // Call the validation function

    if (!runCatch(validation.action, req, payload)) {
      // If validation fails, send an error response and stop execution
      res
        .status(validation.status)
        .json(errorMessage(validation.message, payload.error ?? ''));
      return; // Stop execution
    }
  }

  // If all validations pass, call the next middleware or route handler
  next();
}

function runCatch(func, req, payload) {
  try {
    return func(req, payload);
  } catch (e) {
    console.error(e);
    return false;
  }
}

module.exports = {
  validateRequest,
};
