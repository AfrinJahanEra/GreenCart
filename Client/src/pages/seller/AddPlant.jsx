// src/pages/seller/AddPlant.jsx
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme.js';
import { useSellerDashboard } from '../../hooks/useSellerDashboard';
import { useAuth } from '../../contexts/AuthContext';

const AddPlant = () => {
  const { refreshAllData } = useOutletContext();
  const { user } = useAuth();
  const { addPlant, uploadImages, dashboardData, loading } = useSellerDashboard(user?.user_id);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    stock_quantity: '',
    category_ids: '',
    features: '',
    care_tips: '',
    sizes: 'Small:-5.00,Medium:0.00,Large:10.00',
    images: []
  });

  const [uploadedImages, setUploadedImages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({ ...prev, images: Array.from(e.target.files) }));
  };

  const handleUploadImages = async () => {
    if (formData.images.length === 0) return;
    
    const result = await uploadImages(formData.images);
    if (result.success) {
      setUploadedImages(result.images);
      alert('Images uploaded successfully!');
    } else {
      alert(`Failed to upload images: ${result.error}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const plantData = {
      ...formData,
      seller_id: user.user_id,
      base_price: parseFloat(formData.base_price),
      stock_quantity: parseInt(formData.stock_quantity),
      images: uploadedImages.map(img => img.url).join(',')
    };

    const result = await addPlant(plantData);
    
    if (result.success) {
      alert('Plant added successfully!');
      setFormData({
        name: '',
        description: '',
        base_price: '',
        stock_quantity: '',
        category_ids: '',
        features: '',
        care_tips: '',
        sizes: 'Small:-5.00,Medium:0.00,Large:10.00',
        images: []
      });
      setUploadedImages([]);
      refreshAllData();
    } else {
      alert(`Failed to add plant: ${result.error}`);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Add New Plant</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>
                Plant Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>
                Base Price ($) *
              </label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>
                Initial Stock *
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                min="0"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>
                Category IDs (comma-separated)
              </label>
              <input
                type="text"
                name="category_ids"
                value={formData.category_ids}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1,2,3"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available categories: {dashboardData.categories.map(c => c.category_id).join(', ')}
              </p>
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>
                Plant Images *
              </label>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                accept="image/*"
                required
              />
              <button
                type="button"
                onClick={handleUploadImages}
                className="mt-2 bg-blue-500 text-white px-4 py-1 rounded text-sm"
                disabled={formData.images.length === 0}
              >
                Upload Images
              </button>
              {uploadedImages.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">Uploaded images:</p>
                  {uploadedImages.map((img, index) => (
                    <p key={index} className="text-xs truncate">{img.url}</p>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>
                Features (comma-separated)
              </label>
              <input
                type="text"
                name="features"
                value={formData.features}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Fragrant,Colorful,Perennial"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>
                Care Tips (comma-separated)
              </label>
              <input
                type="text"
                name="care_tips"
                value={formData.care_tips}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Water daily,Full sunlight"
              />
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading.addPlant}
          className="bg-[#224229] text-white px-6 py-2 rounded-lg hover:bg-[#4b6250] transition-colors disabled:opacity-50"
        >
          {loading.addPlant ? 'Adding Plant...' : 'Add Plant'}
        </button>
      </form>
    </div>
  );
};

export default AddPlant;