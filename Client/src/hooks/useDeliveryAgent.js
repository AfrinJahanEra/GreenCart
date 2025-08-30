// src/hooks/useDeliveryAgent.js
import { useState, useEffect, useCallback } from 'react';
import { deliveryAgentAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

export const useDeliveryAgent = (agentId) => {
  const [dashboardData, setDashboardData] = useState({
    all_assignments: [],
    pending_assignments: [],
    completed_assignments: [],
    stats: {},
    history: []
  });
  
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [assignmentCount, setAssignmentCount] = useState(0);
  
  const [loading, setLoading] = useState({
    dashboard: false,
    monthlyEarnings: false,
    assignmentCount: false,
    markDelivery: false
  });
  
  const [error, setError] = useState({
    dashboard: null,
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
      
      const response = await deliveryAgentAPI.getDashboard(agentId);
      
      if (response.data.success) {
        setDashboardData(response.data.data);
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

  // Mark delivery as completed with enhanced status management
  const markDeliveryCompleted = async (orderId, notes = '', confirmationType = 'delivered') => {
    try {
      setLoading(prev => ({ ...prev, markDelivery: true }));
      setError(prev => ({ ...prev, markDelivery: null }));
      
      const response = await deliveryAgentAPI.confirmDelivery({
        order_id: orderId,
        agent_id: agentId,
        notes,
        type: confirmationType
      });
      
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
      
      const response = await deliveryAgentAPI.markDeliveryCompleted({
        order_id: orderId,
        agent_id: agentId,
        notes
      });
      
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
      
      const response = await deliveryAgentAPI.getAssignmentCount(agentId, status);
      
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
      
      const response = await deliveryAgentAPI.getMonthlyEarnings(agentId, year);
      
      if (response.data.success) {
        setMonthlyEarnings(response.data.monthly_earnings);
      } else {
        throw new Error(response.data.error || 'Failed to fetch monthly earnings');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, monthlyEarnings: errorMessage }));
      console.error('Error fetching monthly earnings:', err);
    } finally {
      setLoading(prev => ({ ...prev, monthlyEarnings: false }));
    }
  };

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      fetchDashboard(),
      fetchMonthlyEarnings(),
      fetchAssignmentCount()
    ]);
  }, [fetchDashboard]);

  // Initial data fetch
  useEffect(() => {
    if (agentId) {
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
    markDeliveryCompleted,
    markDeliveryCompletedLegacy,
    fetchAssignmentCount,
    fetchMonthlyEarnings,
    refreshAllData
  };
};