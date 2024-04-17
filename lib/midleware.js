import { errorMessage } from './utils.js';

export function validateRequest(props) {
  const { req, res, next, payload, validations } = props;

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
