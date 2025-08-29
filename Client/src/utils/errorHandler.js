export const handleApiError = (error) => {
  if (error.response) {

    console.error('API Error:', error.response.data);
    return error.response.data.message || `Server error: ${error.response.status}`;
  } else if (error.request) {

    console.error('Network Error:', error.request);
    return 'Network error: Please check your connection';
  } else {

    console.error('Error:', error.message);
    return error.message || 'An unexpected error occurred';
  }
};