// src/hooks/useDeliveryAgent.js
import { useState, useEffect, useCallback } from 'react';
import { deliveryAgentAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

export const useDeliveryAgent = (agentId) => {
  const [dashboardData, setDashboardData] = useState({
    pending_orders: [],
    completed_orders: [],
    stats: {},
    pending_assignments: [],
    completed_assignments: []
  });
  
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [assignmentCount, setAssignmentCount] = useState(0);
  
  const [loading, setLoading] = useState({
    dashboard: false,
    orders: false,
    monthlyEarnings: false,
    assignmentCount: false,
    markDelivery: false
  });
  
  const [error, setError] = useState({
    dashboard: null,
    orders: null,
    monthlyEarnings: null,
    assignmentCount: null,
    markDelivery: null
  });

  // Fetch delivery agent dashboard
  const fetchDashboard = useCallback(async () => {
    if (!agentId) return;
    
    try {
      setLoading(prev => ({ ...prev, dashboard: true }));
      setError(prev => ({ ...prev, dashboard: null }));
      
      console.log('Fetching dashboard data for agent:', agentId);
      const response = await deliveryAgentAPI.getDashboard(agentId);
      
      console.log('Dashboard API response:', response.data);
      
      if (response.data.success) {
        const data = response.data.data;
        setDashboardData({
          pending_orders: data.pending_orders || [],
          completed_orders: data.completed_orders || [],
          stats: data.stats || {},
          pending_assignments: data.pending_orders || [],
          completed_assignments: data.completed_orders || []
        });
        console.log('Dashboard data updated:', data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, dashboard: errorMessage }));
      console.error('Error fetching delivery dashboard:', err);
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  }, [agentId]);

  // Fetch all orders
  const fetchOrders = useCallback(async (status = null) => {
    if (!agentId) return;
    
    try {
      setLoading(prev => ({ ...prev, orders: true }));
      setError(prev => ({ ...prev, orders: null }));
      
      console.log('Fetching orders for agent:', agentId, 'with status:', status);
      const response = await deliveryAgentAPI.getAllOrders(agentId, status);
      
      console.log('Orders API response:', response.data);
      
      if (response.data.success) {
        return response.data.data || [];
      } else {
        throw new Error(response.data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, orders: errorMessage }));
      console.error('Error fetching orders:', err);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  }, [agentId]);

  // Fetch pending orders
  const fetchPendingOrders = useCallback(async () => {
    if (!agentId) return;
    
    try {
      console.log('Fetching pending orders for agent:', agentId);
      const response = await deliveryAgentAPI.getPendingOrders(agentId);
      
      console.log('Pending orders API response:', response.data);
      
      if (response.data.success) {
        return response.data.data || [];
      } else {
        throw new Error(response.data.error || 'Failed to fetch pending orders');
      }
    } catch (err) {
      console.error('Error fetching pending orders:', err);
      return [];
    }
  }, [agentId]);

  // Fetch completed orders
  const fetchCompletedOrders = useCallback(async () => {
    if (!agentId) return;
    
    try {
      console.log('Fetching completed orders for agent:', agentId);
      const response = await deliveryAgentAPI.getCompletedOrders(agentId);
      
      console.log('Completed orders API response:', response.data);
      
      if (response.data.success) {
        return response.data.data || [];
      } else {
        throw new Error(response.data.error || 'Failed to fetch completed orders');
      }
    } catch (err) {
      console.error('Error fetching completed orders:', err);
      return [];
    }
  }, [agentId]);

  // Update delivery status
  const updateDeliveryStatus = async (orderId, status, notes = '') => {
    try {
      setLoading(prev => ({ ...prev, markDelivery: true }));
      setError(prev => ({ ...prev, markDelivery: null }));
      
      console.log('Updating delivery status:', { orderId, status, agentId, notes });
      
      const response = await deliveryAgentAPI.updateDeliveryStatus({
        order_id: orderId,
        agent_id: agentId,
        status,
        notes
      });
      
      console.log('Update status response:', response.data);
      
      if (response.data.success) {
        // Refresh dashboard data after successful update
        await fetchDashboard();
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.error || 'Failed to update delivery status');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, markDelivery: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, markDelivery: false }));
    }
  };

  // Mark delivery as completed with enhanced status management
  const markDeliveryCompleted = async (orderId, notes = '', confirmationType = 'delivered') => {
    try {
      setLoading(prev => ({ ...prev, markDelivery: true }));
      setError(prev => ({ ...prev, markDelivery: null }));
      
      console.log('Marking delivery completed:', { orderId, agentId, notes, confirmationType });
      
      const response = await deliveryAgentAPI.confirmDelivery({
        order_id: orderId,
        agent_id: agentId,
        notes,
        type: confirmationType
      });
      
      console.log('Mark delivery response:', response.data);
      
      if (response.data.success) {
        // Refresh dashboard data after successful delivery
        await fetchDashboard();
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.error || 'Failed to confirm delivery');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, markDelivery: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, markDelivery: false }));
    }
  };

  // Legacy mark delivery function for backward compatibility
  const markDeliveryCompletedLegacy = async (orderId, notes = '') => {
    try {
      setLoading(prev => ({ ...prev, markDelivery: true }));
      setError(prev => ({ ...prev, markDelivery: null }));
      
      console.log('Legacy mark delivery completed:', { orderId, agentId, notes });
      
      const response = await deliveryAgentAPI.markDeliveryCompleted({
        order_id: orderId,
        agent_id: agentId,
        notes
      });
      
      console.log('Legacy mark delivery response:', response.data);
      
      if (response.data.success) {
        // Refresh dashboard data after successful delivery
        await fetchDashboard();
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.error || 'Failed to mark delivery as completed');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, markDelivery: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, markDelivery: false }));
    }
  };

  // Fetch assignment count
  const fetchAssignmentCount = async (status = null) => {
    try {
      setLoading(prev => ({ ...prev, assignmentCount: true }));
      setError(prev => ({ ...prev, assignmentCount: null }));
      
      console.log('Fetching assignment count for agent:', agentId, 'with status:', status);
      
      const response = await deliveryAgentAPI.getAssignmentCount(agentId, status);
      
      console.log('Assignment count response:', response.data);
      
      if (response.data.success) {
        setAssignmentCount(response.data.assignment_count);
      } else {
        throw new Error(response.data.error || 'Failed to fetch assignment count');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, assignmentCount: errorMessage }));
      console.error('Error fetching assignment count:', err);
    } finally {
      setLoading(prev => ({ ...prev, assignmentCount: false }));
    }
  };

  // Fetch monthly earnings
  const fetchMonthlyEarnings = async (year = null) => {
    try {
      setLoading(prev => ({ ...prev, monthlyEarnings: true }));
      setError(prev => ({ ...prev, monthlyEarnings: null }));
      
      console.log('Fetching monthly earnings for agent:', agentId, 'for year:', year);
      
      const response = await deliveryAgentAPI.getMonthlyEarnings(agentId, year);
      
      console.log('Monthly earnings response:', response.data);
      
      if (response.data.success) {
        const earningsData = response.data.monthly_earnings || [];
        setMonthlyEarnings(earningsData);
        return earningsData; // Return the data for component use
      } else {
        throw new Error(response.data.error || 'Failed to fetch monthly earnings');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, monthlyEarnings: errorMessage }));
      console.error('Error fetching monthly earnings:', err);
      return []; // Return empty array on error
    } finally {
      setLoading(prev => ({ ...prev, monthlyEarnings: false }));
    }
  };

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    console.log('Refreshing all delivery agent data for agent:', agentId);
    await Promise.all([
      fetchDashboard(),
      fetchMonthlyEarnings(),
      fetchAssignmentCount()
    ]);
  }, [fetchDashboard, agentId]);

  // Initial data fetch
  useEffect(() => {
    if (agentId) {
      console.log('Initial data fetch for delivery agent:', agentId);
      refreshAllData();
    }
  }, [agentId, refreshAllData]);

  return {
    dashboardData,
    monthlyEarnings,
    assignmentCount,
    loading,
    error,
    fetchDashboard,
    fetchOrders,
    fetchPendingOrders,
    fetchCompletedOrders,
    updateDeliveryStatus,
    markDeliveryCompleted,
    markDeliveryCompletedLegacy,
    fetchAssignmentCount,
    fetchMonthlyEarnings,
    refreshAllData
  };
};