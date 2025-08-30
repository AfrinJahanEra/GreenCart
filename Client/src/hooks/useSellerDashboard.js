// src/hooks/useSellerDashboard.js
import { useState, useEffect } from 'react';
import { sellerAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

export const useSellerDashboard = (sellerId) => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total_plants: 0,
      total_sold: 0,
      total_earnings: 0,
      low_stock_count: 0
    },
    recentSales: [],
    lowStockPlants: [],
    plants: [],
    salesRecords: [],
    categories: [],
    sellerInfo: null
  });
  
  const [loading, setLoading] = useState({
    dashboard: false,
    stats: false,
    recentSales: false,
    lowStockPlants: false,
    plants: false,
    salesRecords: false,
    categories: false,
    addPlant: false,
    updatePlant: false
  });
  
  const [error, setError] = useState({
    dashboard: null,
    stats: null,
    recentSales: null,
    lowStockPlants: null,
    plants: null,
    salesRecords: null,
    categories: null,
    addPlant: null,
    updatePlant: null
  });

  console.log('useSellerDashboard initialized with sellerId:', sellerId);

  // Comprehensive dashboard fetch - gets all data in one call
  const fetchCompleteDashboard = async () => {
    if (!sellerId) {
      console.warn('No seller ID provided');
      return;
    }

    try {
      console.log('Fetching complete dashboard for seller:', sellerId);
      setLoading(prev => ({ ...prev, dashboard: true }));
      setError(prev => ({ ...prev, dashboard: null }));
      
      const response = await sellerAPI.getSellerDashboard(sellerId);
      console.log('Dashboard API response:', response.data);
      
      if (response.data.success) {
        const data = response.data.data;
        console.log('Setting dashboard data:', data);
        
        setDashboardData(prev => ({
          ...prev,
          stats: data.stats || prev.stats,
          recentSales: Array.isArray(data.recent_sales) ? data.recent_sales : [],
          lowStockPlants: Array.isArray(data.low_stock_plants) ? data.low_stock_plants : [],
          plants: Array.isArray(data.all_plants) ? data.all_plants : [],
        }));
        
        // Also fetch categories and sales records separately
        await Promise.all([
          fetchCategories(),
          fetchSalesRecords()
        ]);
        
      } else {
        console.error('Dashboard API returned error:', response.data.error);
        setError(prev => ({ ...prev, dashboard: response.data.error || 'Failed to fetch dashboard' }));
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      console.error('Error fetching complete dashboard:', err);
      setError(prev => ({ ...prev, dashboard: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  };

  // Individual fetch functions (backup for specific data refresh)
  const fetchSellerStats = async () => {
    if (!sellerId) return;
    
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      setError(prev => ({ ...prev, stats: null }));
      
      const response = await sellerAPI.getSellerStats(sellerId);
      
      if (response.data.success) {
        setDashboardData(prev => ({ ...prev, stats: response.data.data }));
      } else {
        throw new Error(response.data.error || 'Failed to fetch seller stats');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, stats: errorMessage }));
      console.error('Error fetching seller stats:', err);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const fetchRecentSales = async () => {
    if (!sellerId) return;
    
    try {
      setLoading(prev => ({ ...prev, recentSales: true }));
      setError(prev => ({ ...prev, recentSales: null }));
      
      const response = await sellerAPI.getRecentSales(sellerId);
      
      if (response.data.success) {
        setDashboardData(prev => ({ ...prev, recentSales: response.data.data }));
      } else {
        throw new Error(response.data.error || 'Failed to fetch recent sales');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, recentSales: errorMessage }));
      console.error('Error fetching recent sales:', err);
    } finally {
      setLoading(prev => ({ ...prev, recentSales: false }));
    }
  };

  const fetchLowStockPlants = async () => {
    if (!sellerId) return;
    
    try {
      setLoading(prev => ({ ...prev, lowStockPlants: true }));
      setError(prev => ({ ...prev, lowStockPlants: null }));
      
      const response = await sellerAPI.getLowStockPlants(sellerId);
      
      if (response.data.success) {
        setDashboardData(prev => ({ ...prev, lowStockPlants: response.data.data }));
      } else {
        throw new Error(response.data.error || 'Failed to fetch low stock plants');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, lowStockPlants: errorMessage }));
      console.error('Error fetching low stock plants:', err);
    } finally {
      setLoading(prev => ({ ...prev, lowStockPlants: false }));
    }
  };

  const fetchSellerPlants = async () => {
    if (!sellerId) return;
    
    try {
      setLoading(prev => ({ ...prev, plants: true }));
      setError(prev => ({ ...prev, plants: null }));
      
      console.log('Fetching plants for seller:', sellerId);
      const response = await sellerAPI.getSellerPlants(sellerId);
      console.log('Plants API response:', response.data);
      
      if (response.data.success) {
        const plantsData = response.data.data || [];
        console.log('Plants data received:', plantsData);
        setDashboardData(prev => ({ 
          ...prev, 
          plants: Array.isArray(plantsData) ? plantsData : []
        }));
      } else {
        console.warn('Failed to fetch plants:', response.data.error || response.data.message);
        setDashboardData(prev => ({ ...prev, plants: [] }));
        setError(prev => ({ ...prev, plants: response.data.error || response.data.message || 'Failed to fetch plants' }));
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      console.error('Error fetching plants:', err);
      setError(prev => ({ ...prev, plants: errorMessage }));
      setDashboardData(prev => ({ ...prev, plants: [] }));
    } finally {
      setLoading(prev => ({ ...prev, plants: false }));
    }
  };

  const fetchSalesRecords = async () => {
    if (!sellerId) return;
    
    try {
      setLoading(prev => ({ ...prev, salesRecords: true }));
      setError(prev => ({ ...prev, salesRecords: null }));
      
      const response = await sellerAPI.getSalesRecords(sellerId);
      
      if (response.data.success) {
        setDashboardData(prev => ({ ...prev, salesRecords: response.data.data }));
      } else {
        throw new Error(response.data.error || 'Failed to fetch sales records');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, salesRecords: errorMessage }));
      console.error('Error fetching sales records:', err);
    } finally {
      setLoading(prev => ({ ...prev, salesRecords: false }));
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      setError(prev => ({ ...prev, categories: null }));
      
      const response = await sellerAPI.getCategories();
      
      if (response.data.success) {
        const categoriesData = response.data.categories || [];
        setDashboardData(prev => ({ 
          ...prev, 
          categories: Array.isArray(categoriesData) ? categoriesData : []
        }));
      } else {
        console.warn('Failed to fetch categories:', response.data.error);
        setDashboardData(prev => ({ ...prev, categories: [] }));
        setError(prev => ({ ...prev, categories: response.data.error || 'Failed to fetch categories' }));
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      console.error('Error fetching categories:', err);
      setError(prev => ({ ...prev, categories: errorMessage }));
      setDashboardData(prev => ({ ...prev, categories: [] }));
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  // Add new plant
  const addPlant = async (plantData, isFormData = false) => {
    try {
      setLoading(prev => ({ ...prev, addPlant: true }));
      setError(prev => ({ ...prev, addPlant: null }));
      
      let response;
      
      if (isFormData) {
        // Handle form data with file uploads
        const formData = new FormData();
        Object.keys(plantData).forEach(key => {
          if (key === 'images' && Array.isArray(plantData[key])) {
            plantData[key].forEach(file => {
              formData.append('images', file);
            });
          } else {
            formData.append(key, plantData[key]);
          }
        });
        
        response = await sellerAPI.addPlant(formData);
      } else {
        // Handle JSON data
        response = await sellerAPI.addPlant(plantData);
      }
      
      if (response.data.success) {
        // Refresh plants list after adding
        await fetchSellerPlants();
        return { success: true, data: response.data };
      } else {
        throw new Error(response.data.error || 'Failed to add plant');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, addPlant: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, addPlant: false }));
    }
  };

  // Update plant
  const updatePlant = async (plantId, plantData) => {
    try {
      setLoading(prev => ({ ...prev, updatePlant: true }));
      setError(prev => ({ ...prev, updatePlant: null }));
      
      const response = await sellerAPI.updatePlant(plantId, plantData);
      
      if (response.data.success) {
        // Refresh plants list after update
        await fetchSellerPlants();
        return { success: true, data: response.data };
      } else {
        throw new Error(response.data.error || 'Failed to update plant');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, updatePlant: errorMessage }));
      return { success: false, error: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, updatePlant: false }));
    }
  };

  // Upload images only
  const uploadImages = async (imageFiles) => {
    try {
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await sellerAPI.uploadImages(formData);
      
      if (response.data.success) {
        return { success: true, images: response.data.images };
      } else {
        throw new Error(response.data.error || 'Failed to upload images');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      return { success: false, error: errorMessage };
    }
  };

  // Record manual sale
  const recordManualSale = async (saleData) => {
    try {
      const response = await sellerAPI.recordManualSale(saleData);
      
      if (response.data.success) {
        // Refresh data after recording sale
        await Promise.all([
          fetchSellerStats(),
          fetchRecentSales(),
          fetchSellerPlants(),
          fetchSalesRecords()
        ]);
        return { success: true, data: response.data };
      } else {
        throw new Error(response.data.error || 'Failed to record sale');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      return { success: false, error: errorMessage };
    }
  };

  // Get plant details for editing
  const getPlantDetails = async (plantId) => {
    try {
      const response = await sellerAPI.getPlantDetails(plantId);
      
      if (response.data.success) {
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.error || 'Failed to fetch plant details');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      return { success: false, error: errorMessage };
    }
  };

  // Refresh all data
  const refreshAllData = async () => {
    console.log('Refreshing all seller dashboard data');
    await fetchCompleteDashboard();
  };

  // Refresh specific data sections
  const refreshPlants = () => fetchSellerPlants();
  const refreshStats = () => fetchSellerStats();
  const refreshSales = () => fetchSalesRecords();
  const refreshCategories = () => fetchCategories();

  // Initial data fetch
  useEffect(() => {
    console.log('useSellerDashboard useEffect triggered, sellerId:', sellerId);
    if (sellerId) {
      fetchCompleteDashboard();
    }
  }, [sellerId]);

  return {
    dashboardData,
    loading,
    error,
    // Main functions
    fetchCompleteDashboard,
    refreshAllData,
    // Individual refresh functions
    refreshPlants,
    refreshStats,
    refreshSales,
    refreshCategories,
    // Individual fetch functions
    fetchSellerStats,
    fetchRecentSales,
    fetchLowStockPlants,
    fetchSellerPlants,
    fetchSalesRecords,
    fetchCategories,
    // Plant management
    addPlant,
    updatePlant,
    uploadImages,
    recordManualSale,
    getPlantDetails
  };
};