// src/hooks/useCustomerOrders.js
import { useState, useEffect } from 'react';
import { customerOrdersAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

export const useCustomerOrders = (userId) => {
  const [orders, setOrders] = useState({
    all: [],
    pendingConfirmation: [],
    completedForReview: []
  });
  
  const [stats, setStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    delivered_orders: 0,
    total_spent: 0
  });
  
  const [loading, setLoading] = useState({
    all: false,
    pendingConfirmation: false,
    completedForReview: false,
    stats: false,
    confirmDelivery: false,
    addReview: false
  });
  
  const [error, setError] = useState({
    all: null,
    pendingConfirmation: null,
    completedForReview: null,
    stats: null,
    confirmDelivery: null,
    addReview: null
  });

  // Fetch all customer orders
  const fetchCustomerOrders = async (status = null) => {
    if (!userId) return;
    
    try {
      setLoading(prev => ({ ...prev, all: true }));
      setError(prev => ({ ...prev, all: null }));
      
      const response = await customerOrdersAPI.getCustomerOrders(userId, status);
      
      if (response.data.success) {
        setOrders(prev => ({ ...prev, all: response.data.orders }));
      } else {
        throw new Error(response.data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, all: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  };

  // Fetch pending confirmation orders
  const fetchPendingConfirmationOrders = async () => {
    if (!userId) return;
    
    try {
      setLoading(prev => ({ ...prev, pendingConfirmation: true }));
      setError(prev => ({ ...prev, pendingConfirmation: null }));
      
      const response = await customerOrdersAPI.getPendingConfirmationOrders(userId);
      
      if (response.data.success) {
        setOrders(prev => ({ ...prev, pendingConfirmation: response.data.orders }));
      } else {
        throw new Error(response.data.error || 'Failed to fetch pending confirmation orders');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, pendingConfirmation: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, pendingConfirmation: false }));
    }
  };

  // Fetch completed orders for review
  const fetchCompletedOrdersForReview = async () => {
    if (!userId) return;
    
    try {
      setLoading(prev => ({ ...prev, completedForReview: true }));
      setError(prev => ({ ...prev, completedForReview: null }));
      
      const response = await customerOrdersAPI.getCompletedOrdersForReview(userId);
      
      if (response.data.success) {
        setOrders(prev => ({ ...prev, completedForReview: response.data.orders }));
      } else {
        throw new Error(response.data.error || 'Failed to fetch completed orders for review');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, completedForReview: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, completedForReview: false }));
    }
  };

  // Fetch customer order statistics
  const fetchCustomerOrderStats = async () => {
    if (!userId) return;
    
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      setError(prev => ({ ...prev, stats: null }));
      
      const response = await customerOrdersAPI.getCustomerOrderStats(userId);
      
      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        throw new Error(response.data.error || 'Failed to fetch order statistics');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, stats: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Confirm delivery
  const confirmDelivery = async (orderId) => {
    try {
      setLoading(prev => ({ ...prev, confirmDelivery: true }));
      setError(prev => ({ ...prev, confirmDelivery: null }));
      
      const response = await customerOrdersAPI.confirmDelivery(orderId, userId);
      
      if (response.data.success) {
        // Refresh the orders after confirmation
        await Promise.all([
          fetchPendingConfirmationOrders(),
          fetchCustomerOrders()
        ]);
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.error || 'Failed to confirm delivery');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, confirmDelivery: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, confirmDelivery: false }));
    }
  };

  // Add review
  const addReview = async (reviewData) => {
    try {
      setLoading(prev => ({ ...prev, addReview: true }));
      setError(prev => ({ ...prev, addReview: null }));
      
      const response = await customerOrdersAPI.addReview({
        ...reviewData,
        user_id: userId
      });
      
      if (response.data.success) {
        // Refresh completed orders after adding review
        await fetchCompletedOrdersForReview();
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.error || 'Failed to add review');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, addReview: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, addReview: false }));
    }
  };

  // Refresh all data
  const refreshAllData = async () => {
    await Promise.all([
      fetchCustomerOrders(),
      fetchPendingConfirmationOrders(),
      fetchCompletedOrdersForReview(),
      fetchCustomerOrderStats()
    ]);
  };

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      refreshAllData();
    }
  }, [userId]);

  return {
    orders,
    stats,
    loading,
    error,
    fetchCustomerOrders,
    fetchPendingConfirmationOrders,
    fetchCompletedOrdersForReview,
    fetchCustomerOrderStats,
    confirmDelivery,
    addReview,
    refreshAllData
  };
};