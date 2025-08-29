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
      config.headers.Authorization = `Bearer ${token}`;
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

export const authAPI = {
  login: (credentials) => api.post('/accounts/login/', credentials),
  signup: (userData) => api.post('/accounts/signup/', userData),
};

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

export const adminAPI = {
  getDashboardStats: () => api.get('/admin_dashboard/stats/'),
  getActivityLog: (activityType, startDate, endDate) => api.post('/admin_dashboard/activity-log/', { activity_type: activityType, start_date: startDate, end_date: endDate }),
  getUserList: (roleName) => api.get(`/admin_dashboard/user-list/${roleName}/`),
  assignDeliveryAgent: (orderId, agentId) => api.post('/admin_dashboard/assign-delivery-agent/', { order_id: orderId, agent_id: agentId }),
  getLowStockAlerts: (resolved) => api.post('/admin_dashboard/low-stock-alerts/', { resolved }),
  getAllOrdersWithDelivery: () => api.get('/admin_dashboard/all-orders/'),
  getOrderDetails: (orderId) => api.get(`/admin_dashboard/order-details/${orderId}/`),
  applyDiscount: (discountData) => api.post('/admin_dashboard/apply-discount/', discountData),
  getOrderOverview: () => api.get('/admin_dashboard/order-overview/'),
  getLowStockDetails: () => api.get('/admin_dashboard/low-stock-details/'),
  getDeliveryAgentPerformance: () => api.get('/admin_dashboard/delivery-agent-performance/'),
};

export const addReview = (plantId, userId, reviewData) => {
  return plantDetailAPI.addReview(plantId, userId, reviewData);
};

export const deleteReview = (requestorId, reviewId) => {
  return plantDetailAPI.deleteReview(requestorId, reviewId);
};

export default api;