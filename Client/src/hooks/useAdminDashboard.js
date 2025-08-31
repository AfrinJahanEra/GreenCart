import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { handleApiError, formatErrorMessage } from '../utils/errorHandler';

export const useAdminDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    total_customers: 0,
    total_delivery_agents: 0,
    total_sellers: 0,
    total_revenue: 0,
    pending_orders: 0,
    low_stock_alerts: 0,
  });
  
  const [customers, setCustomers] = useState([]);
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState({
    total_alerts: 0,
    unresolved_alerts: 0,
    avg_stock_level: 0,
    most_affected_category: '',
    alerts: []
  });
  
  const [loading, setLoading] = useState({
    stats: false,
    customers: false,
    deliveryAgents: false,
    salesReps: false,
    orders: false,
    lowStockAlerts: false,
  });
  
  const [error, setError] = useState({
    stats: null,
    customers: null,
    deliveryAgents: null,
    salesReps: null,
    orders: null,
    lowStockAlerts: null,
  });

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      setError(prev => ({ ...prev, stats: null }));
      
      const response = await adminAPI.getDashboardStats();
      
      if (response.data.status === 'success') {
        setDashboardStats(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, stats: errorMessage }));
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Fetch users by role with proper error handling
  const fetchUsersByRole = async (roleName, setData, loadingKey, errorKey) => {
    try {
      setLoading(prev => ({ ...prev, [loadingKey]: true }));
      setError(prev => ({ ...prev, [errorKey]: null }));
      
      const response = await adminAPI.getUserList(roleName);
      
      if (response.data.status === 'success') {
        const responseData = response.data.data;
        const usersData = Array.isArray(responseData.users) ? responseData.users : [];
        setData(usersData);
      } else {
        throw new Error(response.data.message || `Failed to fetch ${roleName}s`);
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, [errorKey]: errorMessage }));
      setData([]);
      console.error(`Error fetching ${roleName}s:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    await fetchUsersByRole('customer', setCustomers, 'customers', 'customers');
  };

  // Fetch delivery agents
  const fetchDeliveryAgents = async () => {
    await fetchUsersByRole('delivery', setDeliveryAgents, 'deliveryAgents', 'deliveryAgents');
  };

  // Fetch sales reps (using 'seller' role)
  const fetchSalesReps = async () => {
    await fetchUsersByRole('seller', setSalesReps, 'salesReps', 'salesReps');
  };

  // Fetch all orders with delivery
  const fetchOrders = async () => {
    try {
      setLoading(prev => ({ ...prev, orders: true }));
      setError(prev => ({ ...prev, orders: null }));
      
      const response = await adminAPI.getAllOrdersWithDelivery();
      
      if (response.data.status === 'success') {
        setOrders(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, orders: errorMessage }));
      setOrders([]);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  // Fetch low stock alerts
  const fetchLowStockAlerts = async (resolved = 0) => {
    try {
      setLoading(prev => ({ ...prev, lowStockAlerts: true }));
      setError(prev => ({ ...prev, lowStockAlerts: null }));
      
      const response = await adminAPI.getLowStockAlerts(resolved);
      
      if (response.data.status === 'success') {
        setLowStockAlerts(response.data.data || {
          total_alerts: 0,
          unresolved_alerts: 0,
          avg_stock_level: 0,
          most_affected_category: '',
          alerts: []
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch low stock alerts');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, lowStockAlerts: errorMessage }));
      setLowStockAlerts({
        total_alerts: 0,
        unresolved_alerts: 0,
        avg_stock_level: 0,
        most_affected_category: '',
        alerts: []
      });
      console.error('Error fetching low stock alerts:', err);
    } finally {
      setLoading(prev => ({ ...prev, lowStockAlerts: false }));
    }
  };

  // Assign delivery agent
  const assignDeliveryAgent = async (orderId, agentId) => {
    try {
      setError(prev => ({ ...prev, orders: null }));
      
      console.log('Assigning delivery agent:', { orderId, agentId });
      
      const response = await adminAPI.assignDeliveryAgent(orderId, agentId);
      
      console.log('Assignment response:', response.data);
      
      if (response.data.status === 'success') {
        await fetchOrders(); // Refresh orders after assignment
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to assign delivery agent');
      }
    } catch (err) {
      console.error('Assignment error details:', err);
      console.error('Error response:', err.response?.data);
      
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, orders: errorMessage }));
      
      // Return more specific error message from backend
      return { 
        success: false, 
        error: err.response?.data?.message || errorMessage 
      };
    }
  };

  // Get available delivery agents
  const getAvailableDeliveryAgents = async (deliveryDate = null) => {
    try {
      const response = await adminAPI.getAvailableDeliveryAgents(deliveryDate);
      
      if (response.data.status === 'success') {
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to fetch available delivery agents');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      return { success: false, error: errorMessage, data: [] };
    }
  };

  // Apply discount
  const applyDiscount = async (discountData) => {
    try {
      setError(prev => ({ ...prev, lowStockAlerts: null }));
      
      const response = await adminAPI.applyDiscount(discountData);
      
      if (response.data.status === 'success') {
        await fetchLowStockAlerts(); // Refresh alerts after applying discount
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to apply discount');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, lowStockAlerts: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Fetch discount types
  const fetchDiscountTypes = async () => {
    try {
      const response = await adminAPI.getDiscountTypes();
      
      if (response.data.status === 'success') {
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to fetch discount types');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      return { success: false, error: errorMessage, data: [] };
    }
  };

  // Fetch all plants
  const fetchAllPlants = async () => {
    try {
      const response = await adminAPI.getAllPlants();
      
      if (response.data.status === 'success') {
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to fetch plants');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      return { success: false, error: errorMessage, data: [] };
    }
  };

  // Fetch all categories
  const fetchAllCategories = async () => {
    try {
      const response = await adminAPI.getAllCategories();
      
      if (response.data.status === 'success') {
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      return { success: false, error: errorMessage, data: [] };
    }
  };

  // Fetch all discounts
  const fetchAllDiscounts = async () => {
    try {
      const response = await adminAPI.getAllDiscounts();
      
      if (response.data.status === 'success') {
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to fetch discounts');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      return { success: false, error: errorMessage, data: [] };
    }
  };

  // Delete customer
  const deleteCustomer = async (customerId, requestorId) => {
    try {
      setError(prev => ({ ...prev, customers: null }));
      
      const response = await adminAPI.deleteCustomer(requestorId, customerId);
      
      if (response.data.status === 'success') {
        await fetchCustomers(); // Refresh customers after deletion
        await fetchDashboardStats(); // Update stats
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to delete customer');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, customers: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Refresh all data
  const refreshAllData = async () => {
    await Promise.all([
      fetchDashboardStats(),
      fetchCustomers(),
      fetchDeliveryAgents(),
      fetchSalesReps(),
      fetchOrders(),
      fetchLowStockAlerts()
    ]);
  };

  // Initial fetch on mount
  useEffect(() => {
    refreshAllData();
  }, []);

  return {
    dashboardStats,
    customers,
    deliveryAgents,
    salesReps,
    orders,
    lowStockAlerts,
    loading,
    error,
    fetchDashboardStats,
    fetchCustomers,
    fetchDeliveryAgents,
    fetchSalesReps,
    fetchOrders,
    fetchLowStockAlerts,
    assignDeliveryAgent,
    getAvailableDeliveryAgents,
    applyDiscount,
    fetchDiscountTypes,
    fetchAllPlants,
    fetchAllCategories,
    fetchAllDiscounts,
    deleteCustomer,
    refreshAllData
  };
};