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

// src/services/api.js - Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // You can add any response transformation here
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    
    // Enhanced error handling
    if (error.response?.data) {
      // Pass through the error data from backend
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// Add to your existing authAPI object in src/services/api.js
export const authAPI = {
  login: (credentials) => api.post('/accounts/login/', credentials),
  signup: (userData) => api.post('/accounts/signup/', userData),
  
  // Add these profile functions
  getProfile: (userId) => api.get(`/user/profile/${userId}/`),
  updateProfile: (requestorId, userId, formData) => {
    // Handle both JSON and FormData
    const config = {};
    if (formData instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data',
      };
    }
    return api.post(`/user/update/${requestorId}/${userId}/`, formData, config);
  },
  deleteAccount: (requestorId, userId) => 
    api.post(`/user/delete/${requestorId}/${userId}/`),
  
  // Utility functions
  getUserByEmail: (email) => 
    api.post('/user/by-email/', { email }),
  getAllUsers: () => api.get('/user/all/'),
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
  addToCart: (cartData) => api.post('/plant_detail/add-to-cart/', cartData),
  addReview: (plantId, reviewData) => 
    api.post(`/plant_detail/add-review/${plantId}/`, reviewData),
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
  getAvailableDeliveryAgents: (deliveryDate = null) => {
    const url = deliveryDate 
      ? `/admin_dashboard/available-delivery-agents/?delivery_date=${deliveryDate}`
      : '/admin_dashboard/available-delivery-agents/';
    return api.get(url);
  },
  deleteCustomer: (requestorId, customerId) => 
    api.post('/admin_dashboard/delete-customer/', { 
      requestor_id: requestorId, 
      customer_id: customerId 
    }),
  // New endpoints for discount functionality
  getDiscountTypes: () => api.get('/admin_dashboard/discount-types/'),
  getAllPlants: () => api.get('/admin_dashboard/all-plants/'),
  getAllCategories: () => api.get('/admin_dashboard/all-categories/'),
  getAllDiscounts: () => api.get('/admin_dashboard/all-discounts/'),
};

export const sellerAPI = {
  // Dashboard - All data in one call
  getSellerDashboard: (sellerId) => api.get(`/seller/${sellerId}/dashboard/`),
  
  // Individual endpoints
  getSellerStats: (sellerId) => api.get(`/seller/${sellerId}/stats/`),
  getRecentSales: (sellerId) => api.get(`/seller/${sellerId}/recent-sales/`),
  getLowStockPlants: (sellerId) => api.get(`/seller/${sellerId}/low-stock/`),
  getSellerPlants: (sellerId) => api.get(`/seller/${sellerId}/plants/`),
  getSalesRecords: (sellerId) => api.get(`/seller/${sellerId}/sales/`),
  
  // Plant management
  addPlant: (plantData) => api.post('/seller/plants/add/', plantData),
  updatePlant: (plantId, plantData) => api.put(`/seller/plants/${plantId}/update/`, plantData),
  getPlantDetails: (plantId) => api.get(`/seller/plants/${plantId}/`),
  
  // Utilities
  recordManualSale: (saleData) => api.post('/seller/record-sale/', saleData),
  getCategories: () => api.get('/seller/categories/'),
  uploadImages: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    };
    return api.post('/seller/upload-images/', formData, config);
  },
  debugSeller: (sellerId) => api.get(`/seller/${sellerId}/debug/`),
};

// src/services/api.js - Add delivery agent API functions
export const deliveryAgentAPI = {
  // Dashboard and stats
  getDashboard: (agentId) => api.get(`/delivery_agent/dashboard/${agentId}/`),
  getStats: (agentId) => api.get(`/delivery_agent/stats/${agentId}/`),
  
  // Orders management
  getAllOrders: (agentId, status = null) => {
    const url = status 
      ? `/delivery_agent/orders/${agentId}/?status=${status}`
      : `/delivery_agent/orders/${agentId}/`;
    return api.get(url);
  },
  getPendingOrders: (agentId) => api.get(`/delivery_agent/pending-orders/${agentId}/`),
  getCompletedOrders: (agentId) => api.get(`/delivery_agent/completed-orders/${agentId}/`),
  
  // Delivery actions
  updateDeliveryStatus: (data) => api.post('/delivery_agent/update-status/', data),
  markDeliveryCompleted: (data) => api.post('/delivery_agent/mark-delivered/', data),
  confirmDelivery: (data) => api.post('/delivery_agent/confirm-delivery/', data),
  
  // Statistics and earnings
  getAssignmentCount: (agentId, status = null) => {
    const url = status 
      ? `/delivery_agent/assignment-count/${agentId}/?status=${status}`
      : `/delivery_agent/assignment-count/${agentId}/`;
    return api.get(url);
  },
};




export const customerOrdersAPI = {
  // Get all customer orders
  getCustomerOrders: (userId, status = null) => {
    const url = status 
      ? `/order/orders/${userId}/?status=${status}`
      : `/order/orders/${userId}/`;
    return api.get(url);
  },

  // Get pending confirmation orders
  getPendingConfirmationOrders: (userId) => 
    api.get(`/order/pending-confirmation/${userId}/`),

  // Get completed orders ready for review
  getCompletedOrdersForReview: (userId) => 
    api.get(`/order/completed-for-review/${userId}/`),

  // Confirm delivery
  confirmDelivery: (orderId, userId) => 
    api.post('/order/confirm-delivery/', { order_id: orderId, user_id: userId }),

  // Add review
  addReview: (reviewData) => 
    api.post('/order/add-review/', reviewData),

  // Get order details
  getOrderDetails: (orderId, userId) => 
    api.get(`/order/order-details/${orderId}/?user_id=${userId}`),

  // Get customer order statistics
  getCustomerOrderStats: (userId) => 
    api.get(`/order/stats/${userId}/`),

  createOrder: (orderData) => api.post('/order/create-order/', orderData),
  getOrder: (orderId) => api.get(`/order/order-details/${orderId}/`),
  getDeliveryMethods: () => api.get('/order/delivery-methods/'),
};

// Add these to your existing api.js file



export const cartAPI = {
  getCart: (userId) => api.get(`/cart/${userId}/`),
  addToCart: (cartData) => api.post('/cart/add/', cartData),
  toggleCartItem: (data) => api.post('/cart/toggle/', data),
  updateCartQuantity: (data) => api.post('/cart/update_quantity/', data),
  removeFromCart: (data) => api.post('/cart/delete/', data),
};

export const addReview = (plantId, reviewData) => {
  return plantDetailAPI.addReview(plantId, reviewData);
};

export const deleteReview = (requestorId, reviewId) => {
  // This functionality is not implemented in the backend yet
  return Promise.reject(new Error('Delete review functionality not implemented'));
};

export default api;