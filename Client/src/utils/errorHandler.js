export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    console.error('API Error:', error.response.data);
    return error.response.data.message || `Server error: ${error.response.status}`;
  } else if (error.request) {
    // Request made but no response received
    console.error('Network Error:', error.request);
    return 'Network error: Please check your connection';
  } else {
    // Something else happened
    console.error('Error:', error.message);
    return error.message || 'An unexpected error occurred';
  }
};