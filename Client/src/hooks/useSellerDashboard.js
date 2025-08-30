// src/hooks/useSellerDashboard.js
import { useState, useEffect } from 'react';
import { sellerAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

export const useSellerDashboard = (sellerId) => {

  const [dashboardData, setDashboardData] = useState({
  stats: null,
  recentSales: [],
  lowStockPlants: [],
  plants: [],  // Ensure plants is always an array
  salesRecords: [],
  categories: []
});
  
  const [loading, setLoading] = useState({
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
    stats: null,
    recentSales: null,
    lowStockPlants: null,
    plants: null,
    salesRecords: null,
    categories: null,
    addPlant: null,
    updatePlant: null
  });

  // Fetch seller stats
  const fetchSellerStats = async () => {
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

  // Fetch recent sales
  const fetchRecentSales = async () => {
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

  // Fetch low stock plants
  const fetchLowStockPlants = async () => {
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

  // Fetch seller plants
  // src/hooks/useSellerDashboard.js - Add this at the beginning
// Update the initial state to include empty arrays


// In each fetch function, ensure we set empty arrays on error
const fetchSellerPlants = async () => {
  try {
    setLoading(prev => ({ ...prev, plants: true }));
    setError(prev => ({ ...prev, plants: null }));
    
    const response = await sellerAPI.getSellerPlants(sellerId);
    
    if (response.data.success) {
      setDashboardData(prev => ({ 
        ...prev, 
        plants: response.data.data || []  // Ensure it's always an array
      }));
    } else {
      throw new Error(response.data.error || 'Failed to fetch plants');
    }
  } catch (err) {
    const errorMessage = handleApiError(err);
    setError(prev => ({ ...prev, plants: errorMessage }));
    setDashboardData(prev => ({ ...prev, plants: [] })); // Set empty array on error
    console.error('Error fetching plants:', err);
  } finally {
    setLoading(prev => ({ ...prev, plants: false }));
  }
};

  // Fetch sales records
  const fetchSalesRecords = async () => {
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

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      setError(prev => ({ ...prev, categories: null }));
      
      const response = await sellerAPI.getCategories();
      
      if (response.data.success) {
        setDashboardData(prev => ({ ...prev, categories: response.data.categories }));
      } else {
        throw new Error(response.data.error || 'Failed to fetch categories');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(prev => ({ ...prev, categories: errorMessage }));
      console.error('Error fetching categories:', err);
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

  // Refresh all data
  const refreshAllData = async () => {
    await Promise.all([
      fetchSellerStats(),
      fetchRecentSales(),
      fetchLowStockPlants(),
      fetchSellerPlants(),
      fetchSalesRecords(),
      fetchCategories()
    ]);
  };

  // Initial data fetch
  useEffect(() => {
    if (sellerId) {
      refreshAllData();
    }
  }, [sellerId]);

  return {
    dashboardData,
    loading,
    error,
    fetchSellerStats,
    fetchRecentSales,
    fetchLowStockPlants,
    fetchSellerPlants,
    fetchSalesRecords,
    fetchCategories,
    addPlant,
    updatePlant,
    uploadImages,
    refreshAllData
  };
};