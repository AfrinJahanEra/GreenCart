export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return data.message || 'Bad request. Please check your input.';
      case 401:
        return 'Authentication failed. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.message || `Server error: ${status}`;
    }
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error. Please check your internet connection.';
  } else {
    // Other errors
    return error.message || 'An unexpected error occurred.';
  }
};

export const formatErrorMessage = (error, defaultMessage = 'An error occurred') => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return defaultMessage;
};