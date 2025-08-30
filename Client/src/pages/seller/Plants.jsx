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

  // Handle loading state
  if (loading.plants) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading plants...</div>
      </div>
    );
  }

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
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
    // Navigate to edit page or open modal
    console.log('Edit plant:', plantId);
  };

  const handleDeletePlant = async (plantId) => {
    if (window.confirm('Are you sure you want to delete this plant?')) {
      // Implement delete functionality
      console.log('Delete plant:', plantId);
    }
  };

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
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-100 p-3 font-medium">
          <div className="col-span-2">Image</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Stock</div>
          <div className="col-span-3">Actions</div>
        </div>
        
        {dashboardData.plants.map(plant => (
          <div key={plant.plant_id} className="grid grid-cols-12 p-3 border-b items-center hover:bg-gray-50">
            <div className="col-span-2">
              <img 
                src={plant.primary_image || 'https://via.placeholder.com/150'} 
                alt={plant.name} 
                className="w-12 h-12 object-cover rounded" 
              />
            </div>
            <div className="col-span-3 font-medium">
              {plant.name}
              {plant.categories && (
                <div className="text-xs text-gray-500 mt-1">
                  {plant.categories}
                </div>
              )}
            </div>
            <div className="col-span-2">${plant.base_price?.toFixed(2)}</div>
            <div className="col-span-2">
              <span className={plant.stock_quantity < 3 ? 'text-red-500 font-semibold' : ''}>
                {plant.stock_quantity}
              </span>
            </div>
            <div className="col-span-3 flex gap-2">
              <button 
                onClick={() => handleEditPlant(plant.plant_id)}
                className="text-blue-500 hover:text-blue-700 p-1"
                title="Edit plant"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button 
                onClick={() => handleDeletePlant(plant.plant_id)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Delete plant"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <Link
                to={`/plants/${plant.plant_id}`}
                className="text-green-500 hover:text-green-700 p-1"
                title="View plant"
                target="_blank"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Stats summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Plants</h3>
          <p className="text-2xl font-bold">{dashboardData.plants.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Low Stock Items</h3>
          <p className="text-2xl font-bold text-red-500">
            {dashboardData.plants.filter(p => p.stock_quantity < 5).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Out of Stock</h3>
          <p className="text-2xl font-bold text-red-500">
            {dashboardData.plants.filter(p => p.stock_quantity === 0).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Plants;