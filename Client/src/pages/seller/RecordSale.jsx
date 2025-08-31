// src/pages/seller/RecordSale.jsx
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSellerDashboard } from '../../hooks/useSellerDashboard';
import { theme } from '../../theme.js';

const RecordSale = () => {
  const { dashboardData } = useOutletContext();
  const { user } = useAuth();
  const { recordManualSale } = useSellerDashboard(user?.user_id);
  
  const [formData, setFormData] = useState({
    plantId: '',
    quantity: 1,
    salePrice: '',
    customerEmail: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update price when plant is selected
    if (name === 'plantId') {
      const selectedPlant = dashboardData.plants?.find(p => p.plant_id === parseInt(value));
      if (selectedPlant) {
        setFormData(prev => ({
          ...prev,
          plantId: value,
          salePrice: (selectedPlant.base_price * prev.quantity).toFixed(2)
        }));
      }
    }
    
    // Update price when quantity changes
    if (name === 'quantity') {
      const selectedPlant = dashboardData.plants?.find(p => p.plant_id === parseInt(formData.plantId));
      if (selectedPlant) {
        setFormData(prev => ({
          ...prev,
          quantity: parseInt(value),
          salePrice: (selectedPlant.base_price * parseInt(value)).toFixed(2)
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    const selectedPlant = dashboardData.plants?.find(p => p.plant_id === parseInt(formData.plantId));
    
    if (!selectedPlant) {
      setMessage({ type: 'error', text: 'Please select a plant' });
      setLoading(false);
      return;
    }
    
    if (selectedPlant.stock_quantity < formData.quantity) {
      setMessage({ 
        type: 'error', 
        text: `Not enough stock. Only ${selectedPlant.stock_quantity} available.` 
      });
      setLoading(false);
      return;
    }
    
    const saleData = {
      seller_id: user.user_id,
      plant_id: parseInt(formData.plantId),
      quantity: parseInt(formData.quantity),
      sale_price: parseFloat(formData.salePrice),
      customer_email: formData.customerEmail
    };
    
    const result = await recordManualSale(saleData);
    
    if (result.success) {
      setMessage({ 
        type: 'success', 
        text: `Sale recorded successfully! Order ID: ${result.data.order_id}` 
      });
      setFormData({
        plantId: '',
        quantity: 1,
        salePrice: '',
        customerEmail: ''
      });
    } else {
      setMessage({ 
        type: 'error', 
        text: result.error || 'Failed to record sale' 
      });
    }
    
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Record New Sale</h1>
      
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 
          'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>
            Select Plant
          </label>
          <select
            name="plantId"
            value={formData.plantId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
            disabled={loading}
          >
            <option value="">-- Select a plant --</option>
            {dashboardData.plants?.filter(plant => plant.stock_quantity > 0).map(plant => (
              <option key={plant.plant_id} value={plant.plant_id}>
                {plant.name} (${plant.base_price?.toFixed(2)}, Stock: {plant.stock_quantity})
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
            min="1"
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>
            Sale Price ($)
          </label>
          <input
            type="number"
            name="salePrice"
            value={formData.salePrice}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            step="0.01"
            min="0"
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>
            Customer Email
          </label>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !dashboardData.plants?.length}
          className="bg-[#224229] text-white px-6 py-2 rounded-lg hover:bg-[#4b6250] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Recording Sale...' : 'Record Sale'}
        </button>
      </form>
      
      {(!dashboardData.plants || dashboardData.plants.length === 0) && (
        <div className="mt-4 p-4 bg-yellow-100 text-yellow-700 rounded-lg">
          <p>No plants available to record sales. Please add plants first.</p>
        </div>
      )}
    </div>
  );
};

export default RecordSale;