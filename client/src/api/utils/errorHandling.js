/**
 * Formats error responses consistently across the application
 * 
 * @param {Error} error - The error object from a failed request
 * @param {string} defaultMessage - Default message to show if none is provided in the error
 * @returns {Object} Formatted error object
 */
export const formatApiError = (error, defaultMessage = 'An unexpected error occurred') => {
  // Network errors (no response)
  if (!error.response) {
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      isNetworkError: true
    };
  }

  // API error with response
  const status = error.response.status;
  let message = defaultMessage;

  // Try to get message from different response formats
  if (error.response.data) {
    if (typeof error.response.data === 'string') {
      message = error.response.data;
    } else if (error.response.data.message) {
      message = error.response.data.message;
    } else if (error.response.data.error) {
      message = error.response.data.error;
    }
  }

  return {
    message,
    status,
    data: error.response.data,
    isAuthError: status === 401 || status === 403
  };
};

/**
 * Parse validation errors from API responses
 * 
 * @param {Object} error - Error response from API
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const parseValidationErrors = (error) => {
  if (!error.response?.data?.errors) {
    return {};
  }

  // Transform array of errors into object with field names as keys
  const validationErrors = {};
  
  // Handle different validation error formats
  const errors = error.response.data.errors;
  
  if (Array.isArray(errors)) {
    // Array of error objects with field and message
    errors.forEach(err => {
      if (err.field && err.message) {
        validationErrors[err.field] = err.message;
      }
    });
  } else if (typeof errors === 'object') {
    // Object with field names as keys
    Object.keys(errors).forEach(key => {
      validationErrors[key] = Array.isArray(errors[key]) 
        ? errors[key].join(', ')
        : errors[key];
    });
  }
  
  return validationErrors;
};