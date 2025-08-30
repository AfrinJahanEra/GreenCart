// src/pages/seller/EditPlant.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSellerDashboard } from '../../hooks/useSellerDashboard';
import { theme } from '../../theme.js';

const EditPlant = () => {
  const { plantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPlantDetails, updatePlant, dashboardData, loading, uploadImages } = useSellerDashboard(user?.user_id);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    stock_quantity: '',
    category_ids: '',
    features: '',
    care_tips: '',
    sizes: '',
    images: []
  });

  const [plantDetails, setPlantDetails] = useState(null);
  const [loadingPlant, setLoadingPlant] = useState(true);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchPlantDetails = async () => {
      setLoadingPlant(true);
      const result = await getPlantDetails(plantId);
      
      if (result.success && result.data) {
        const data = result.data;
        setPlantDetails(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          base_price: data.base_price || '',
          stock_quantity: data.stock_quantity || '',
          category_ids: data.category_ids || '',
          features: data.features || '',
          care_tips: data.care_tips || '',
          sizes: data.sizes || '',
          images: []
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to load plant details' });
      }
      setLoadingPlant(false);
    };

    if (plantId) {
      fetchPlantDetails();
    }
  }, [plantId, getPlantDetails]);

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
      setMessage({ type: 'success', text: 'Images uploaded successfully!' });
    } else {
      setMessage({ type: 'error', text: `Failed to upload images: ${result.error}` });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    const updateData = {
      requestor_id: user.user_id,
      name: formData.name,
      description: formData.description,
      base_price: parseFloat(formData.base_price),
      stock_quantity: parseInt(formData.stock_quantity),
      category_ids: formData.category_ids,
      features: formData.features,
      care_tips: formData.care_tips,
      sizes: formData.sizes
    };

    // Add new images if uploaded
    if (uploadedImages.length > 0) {
      updateData.images = uploadedImages.map(img => img.url).join(',');
    }

    const result = await updatePlant(plantId, updateData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Plant updated successfully!' });
      setTimeout(() => {
        navigate('/seller/plants');
      }, 2000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update plant' });
    }
  };

  if (loadingPlant) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading plant details...</div>
      </div>
    );
  }

  if (!plantDetails) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold text-red-600">Plant not found</h2>
        <button
          onClick={() => navigate('/seller/plants')}
          className="mt-4 bg-[#224229] text-white px-4 py-2 rounded-lg"
        >
          Back to Plants
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/seller/plants')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
          Edit Plant: {plantDetails.name}
        </h1>
      </div>
      
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 
          'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}
      
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
                Stock Quantity *
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
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>
                Categories
              </label>
              {loading.categories ? (
                <div className="text-sm text-gray-500">Loading categories...</div>
              ) : dashboardData.categories && dashboardData.categories.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {dashboardData.categories.map(category => (
                    <label key={category.category_id} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        value={category.category_id}
                        checked={formData.category_ids.split(',').includes(category.category_id.toString())}
                        onChange={(e) => {
                          const categoryId = e.target.value;
                          const currentCategories = formData.category_ids ? formData.category_ids.split(',').filter(id => id.trim()) : [];
                          
                          if (e.target.checked) {
                            const newCategories = [...currentCategories, categoryId];
                            setFormData(prev => ({ ...prev, category_ids: newCategories.join(',') }));
                          } else {
                            const newCategories = currentCategories.filter(id => id !== categoryId);
                            setFormData(prev => ({ ...prev, category_ids: newCategories.join(',') }));
                          }
                        }}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No categories available</div>
              )}
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>
                Add New Images
              </label>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                accept="image/*"
              />
              <button
                type="button"
                onClick={handleUploadImages}
                className="mt-2 bg-blue-500 text-white px-4 py-1 rounded text-sm"
                disabled={formData.images.length === 0}
              >
                Upload New Images
              </button>
              {uploadedImages.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">New images uploaded:</p>
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
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading.updatePlant}
            className="bg-[#224229] text-white px-6 py-2 rounded-lg hover:bg-[#4b6250] transition-colors disabled:opacity-50"
          >
            {loading.updatePlant ? 'Updating Plant...' : 'Update Plant'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/seller/plants')}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPlant;