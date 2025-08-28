import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const homeAPI = {
  getTopCategories: () => api.get('/home/top-categories/'),
  getTopPlants: () => api.get('/home/top-plants/'),
  getTopSellers: () => api.get('/home/top-sellers/'),
};

export const plantCollectionAPI = {
  getPlantsByCategory: (categorySlug) => api.get(`/plant_collection/category/${categorySlug}/`),
  searchPlants: (query) => api.get(`/plant_collection/search/?q=${query}`),
  getAllCategories: () => api.get('/plant_collection/categories/'),
};

export const authAPI = {
  login: (credentials) => api.post('/accounts/login/', credentials),
  signup: (userData) => api.post('/accounts/signup/', userData),
  logout: () => api.post('/accounts/logout/'),
  getProfile: (userId) => api.get(`/user/${userId}/`),
  updateProfile: (requestorId, userId, userData) => api.post(`/user/update/${userId}/`, userData),
  deleteAccount: (requestorId, userId) => api.post(`/user/delete/${userId}/`),
};

export const plantDetailAPI = {
  getPlantDetails: (plantId) => api.get(`/plant_detail/plant/${plantId}/`),
  addToCart: (cartData) => api.post('/plant_detail/cart/add/', cartData),
  getReviews: (plantId, limit = 50, offset = 0) => 
    api.get(`/plant_detail/reviews/${plantId}/?limit=${limit}&offset=${offset}`),
  addReview: (plantId, userId, reviewData) => 
    api.post(`/plant_detail/review/add/${plantId}/${userId}/`, reviewData),
  deleteReview: (requestorId, reviewId) => 
    api.post(`/plant_detail/review/delete/${requestorId}/`, { review_id: reviewId }),
};

export const addReview = (plantId, userId, reviewData) => {
  return plantDetailAPI.addReview(plantId, userId, reviewData);
};

export const deleteReview = (requestorId, reviewId) => {
  return plantDetailAPI.deleteReview(requestorId, reviewId);
};

export default api;