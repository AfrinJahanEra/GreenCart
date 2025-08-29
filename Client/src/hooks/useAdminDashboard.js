import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

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
      const response = await adminAPI.getDashboardStats();
      setDashboardStats(response.data.data);
      setError(prev => ({ ...prev, stats: null }));
    } catch (err) {
      setError(prev => ({ ...prev, stats: handleApiError(err) }));
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(prev => ({ ...prev, customers: true }));
      const response = await adminAPI.getUserList('customer');
      // Handles both array and object with users array
      const customerData = Array.isArray(response.data.data) 
        ? response.data.data 
        : response.data.data.users || []; // Fallback to empty array
      setCustomers(customerData);
      setError(prev => ({ ...prev, customers: null }));
    } catch (err) {
      setError(prev => ({ ...prev, customers: handleApiError(err) }));
      setCustomers([]); // Fallback to empty array on error
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  };

  // Fetch delivery agents
  const fetchDeliveryAgents = async () => {
    try {
      setLoading(prev => ({ ...prev, deliveryAgents: true }));
      const response = await adminAPI.getUserList('delivery');
      const agentData = Array.isArray(response.data.data) 
        ? response.data.data 
        : response.data.data.users || [];
      setDeliveryAgents(agentData);
      setError(prev => ({ ...prev, deliveryAgents: null }));
    } catch (err) {
      setError(prev => ({ ...prev, deliveryAgents: handleApiError(err) }));
      setDeliveryAgents([]);
    } finally {
      setLoading(prev => ({ ...prev, deliveryAgents: false }));
    }
  };

  // Fetch sales reps
  const fetchSalesReps = async () => {
    try {
      setLoading(prev => ({ ...prev, salesReps: true }));
      const response = await adminAPI.getUserList('sales');
      const salesData = Array.isArray(response.data.data) 
        ? response.data.data 
        : response.data.data.users || [];
      setSalesReps(salesData);
      setError(prev => ({ ...prev, salesReps: null }));
    } catch (err) {
      setError(prev => ({ ...prev, salesReps: handleApiError(err) }));
      setSalesReps([]);
    } finally {
      setLoading(prev => ({ ...prev, salesReps: false }));
    }
  };
  // Fetch all orders with delivery
  const fetchOrders = async () => {
    try {
      setLoading(prev => ({ ...prev, orders: true }));
      const response = await adminAPI.getAllOrdersWithDelivery();
      setOrders(response.data.data);
      setError(prev => ({ ...prev, orders: null }));
    } catch (err) {
      setError(prev => ({ ...prev, orders: handleApiError(err) }));
      setOrders([]);
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  // Fetch low stock alerts
  const fetchLowStockAlerts = async (resolved = 0) => {
    try {
      setLoading(prev => ({ ...prev, lowStockAlerts: true }));
      const response = await adminAPI.getLowStockAlerts(resolved);
      setLowStockAlerts(response.data.data);
      setError(prev => ({ ...prev, lowStockAlerts: null }));
    } catch (err) {
      setError(prev => ({ ...prev, lowStockAlerts: handleApiError(err) }));
      setLowStockAlerts({ alerts: [], total_alerts: 0, unresolved_alerts: 0, avg_stock_level: 0 });
    } finally {
      setLoading(prev => ({ ...prev, lowStockAlerts: false }));
    }
  };

  // Assign delivery agent
  const assignDeliveryAgent = async (orderId, agentId) => {
    try {
      await adminAPI.assignDeliveryAgent(orderId, agentId);
      await fetchOrders(); // Refresh orders after assignment
      setError(prev => ({ ...prev, orders: null }));
    } catch (err) {
      setError(prev => ({ ...prev, orders: handleApiError(err) }));
    }
  };

  // Apply discount
  const applyDiscount = async (discountData) => {
    try {
      await adminAPI.applyDiscount(discountData);
      await fetchLowStockAlerts(); // Refresh low stock alerts after applying discount
      setError(prev => ({ ...prev, lowStockAlerts: null }));
    } catch (err) {
      setError(prev => ({ ...prev, lowStockAlerts: handleApiError(err) }));
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchDashboardStats();
    fetchCustomers();
    fetchDeliveryAgents();
    fetchSalesReps();
    fetchOrders();
    fetchLowStockAlerts();
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
    applyDiscount,
  };
};