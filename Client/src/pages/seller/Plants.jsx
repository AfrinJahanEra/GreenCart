// src/pages/seller/Plants.jsx
import { useOutletContext } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { useSellerDashboard } from '../../hooks/useSellerDashboard';

const Plants = () => {
  const { dashboardData, loading, refreshAllData } = useOutletContext();
  const { user } = useAuth();
  const { updatePlant } = useSellerDashboard(user?.user_id);

  // Helper function to safely format prices
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  // Helper function to safely get stock quantity
  const getStockQuantity = (quantity) => {
    const numQuantity = parseInt(quantity);
    return isNaN(numQuantity) ? 0 : numQuantity;
  };

  // Handle loading state
  if (loading.plants) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading plants...</div>
      </div>
    );
  }

  // Enhanced logging to see what data we're getting
  console.log('Plants data received:', dashboardData.plants);
  console.log('Loading states:', loading);

  // Handle empty state
  if (!dashboardData.plants || dashboardData.plants.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>My Plants</h1>
          <Link 
            to="/seller/add-plant" 
            className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors"
          >
            Add New Plant
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 113 0v1m0 0V11m0-5.5a1.5 1.5 0 113 0v3m0 0V11" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No plants yet</h3>
          <p className="text-gray-500 mb-4">Start by adding your first plant to your inventory</p>
          <Link 
            to="/seller/add-plant" 
            className="bg-[#224229] text-white px-6 py-2 rounded-lg hover:bg-[#4b6250] transition-colors inline-block"
          >
            Add Your First Plant
          </Link>
        </div>
      </div>
    );
  }

  const handleEditPlant = (plantId) => {
    // Navigate to edit page
    window.open(`/seller/edit-plant/${plantId}`, '_blank');
  };

  const handleDeletePlant = async (plantId) => {
    if (window.confirm('Are you sure you want to delete this plant?')) {
      // Implement delete functionality
      console.log('Delete plant:', plantId);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Plants</h1>
            <p className="text-gray-600 mt-1">Manage your plant inventory and stock levels</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={refreshAllData}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Refresh Data
            </button>
            <Link 
              to="/seller/add-plant" 
              className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors"
            >
              Add New Plant
            </Link>
          </div>
        </div>
      </div>
      
      
      
      {/* Plants Table */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Plant Inventory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dashboardData.plants.map(plant => {
                console.log('Rendering plant:', plant);
                const stockQuantity = getStockQuantity(plant.stock_quantity);
                const stockStatus = stockQuantity === 0 ? 'out-of-stock' : stockQuantity <= 5 ? 'low-stock' : 'in-stock';
                
                return (
                  <tr key={plant.plant_id} className="hover:bg-gray-50">
                    {/* Plant Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img 
                            src={plant.primary_image || 'https://via.placeholder.com/48x48?text=No+Image'} 
                            alt={plant.name || 'Plant'} 
                            className="h-12 w-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/48x48?text=Error';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {plant.name || 'Unnamed Plant'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {plant.plant_id}
                          </div>
                          {plant.description && (
                            <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                              {plant.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Price */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${formatPrice(plant.base_price)}
                      </div>
                    </td>
                    
                    {/* Stock */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          stockStatus === 'out-of-stock' ? 'bg-red-100 text-red-800' :
                          stockStatus === 'low-stock' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {stockQuantity} units
                        </span>
                      </div>
                    </td>
                    
                    {/* Categories */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {plant.categories ? plant.categories.split(',').map((category, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {category.trim()}
                          </span>
                        )) : (
                          <span className="text-xs text-gray-400">No categories</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        plant.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plant.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    
                    {/* Date Added */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(plant.created_at)}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditPlant(plant.plant_id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit plant"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        
                        <Link
                          to={`/plants/${plant.plant_id}`}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="View plant"
                          target="_blank"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                        
                        <button 
                          onClick={() => handleDeletePlant(plant.plant_id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete plant"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      

    </div>
  );
};

export default Plants;