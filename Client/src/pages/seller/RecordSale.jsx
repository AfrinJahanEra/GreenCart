// src/pages/seller/RecordSale.jsx
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme.js';

const RecordSale = () => {
  const { plants, onNewSale } = useOutletContext();
  const [formData, setFormData] = useState({
    plantId: '',
    quantity: 1,
    price: '',
    customerEmail: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update price when plant is selected
    if (name === 'plantId') {
      const selectedPlant = plants.find(p => p.id === parseInt(value));
      if (selectedPlant) {
        setFormData(prev => ({
          ...prev,
          plantId: value,
          price: selectedPlant.price * prev.quantity
        }));
      }
    }
    
    // Update price when quantity changes
    if (name === 'quantity') {
      const selectedPlant = plants.find(p => p.id === parseInt(prev.plantId));
      if (selectedPlant) {
        setFormData(prev => ({
          ...prev,
          quantity: parseInt(value),
          price: selectedPlant.price * parseInt(value)
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedPlant = plants.find(p => p.id === parseInt(formData.plantId));
    
    if (!selectedPlant) {
      alert('Please select a plant');
      return;
    }
    
    if (selectedPlant.stock < formData.quantity) {
      alert(`Not enough stock. Only ${selectedPlant.stock} available.`);
      return;
    }
    
    const newSale = {
      id: Date.now(),
      plantId: parseInt(formData.plantId),
      plantName: selectedPlant.name,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      date: new Date().toISOString().split('T')[0],
      customer: formData.customerEmail
    };
    
    onNewSale(newSale);
    alert('Sale recorded successfully!');
    setFormData({
      plantId: '',
      quantity: 1,
      price: '',
      customerEmail: ''
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Record New Sale</h1>
      
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
          >
            <option value="">-- Select a plant --</option>
            {plants.map(plant => (
              <option key={plant.id} value={plant.id}>
                {plant.name} (${plant.price.toFixed(2)}, Stock: {plant.stock})
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
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>
            Price ($)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-100"
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
          />
        </div>
        
        <button
          type="submit"
          className="bg-[#224229] text-white px-6 py-2 rounded-lg hover:bg-[#4b6250] transition-colors"
        >
          Record Sale
        </button>
      </form>
    </div>
  );
};

export default RecordSale;