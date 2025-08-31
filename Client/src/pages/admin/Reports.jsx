import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Reports = () => {
  const { 
    lowStockAlerts, 
    applyDiscount, 
    fetchLowStockAlerts, 
    loading, 
    error,
    fetchDiscountTypes,
    fetchAllPlants,
    fetchAllCategories,
    fetchAllDiscounts
  } = useOutletContext();
  
  const [discountData, setDiscountData] = useState({
    discount_type: '', // Initialize as empty string
    category_id: '',
    plant_id: '',
    discount_value: '',
    is_percentage: true,
    start_date: '',
    end_date: '',
  });
  const [filterResolved, setFilterResolved] = useState(0); // 0 for unresolved, 1 for all
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [plants, setPlants] = useState([]);
  const [discountTypes, setDiscountTypes] = useState([]);
  const [isLoadingDiscountTypes, setIsLoadingDiscountTypes] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [activeTab, setActiveTab] = useState('apply'); // 'apply' or 'view'

  // Fetch discount types, categories, plants, and discounts
  useEffect(() => {
    const fetchData = async () => {
      if (showDiscountModal && activeTab === 'apply') {
        setIsLoadingDiscountTypes(true);
        try {
          // Fetch discount types
          const discountTypesResult = await fetchDiscountTypes();
          console.log('Discount types API response:', discountTypesResult);
          if (discountTypesResult.success) {
            setDiscountTypes(discountTypesResult.data);
            // Set default discount type to the first one if available and none is currently selected
            if (discountTypesResult.data.length > 0 && !discountData.discount_type) {
              setDiscountData(prev => ({
                ...prev,
                discount_type: discountTypesResult.data[0].name
              }));
            }
          } else {
            console.error('Failed to fetch discount types:', discountTypesResult.error);
            alert('Failed to load discount types. Please try again.');
          }

          // Fetch categories
          const categoriesResult = await fetchAllCategories();
          if (categoriesResult.success) {
            setCategories(categoriesResult.data);
          } else {
            console.error('Failed to fetch categories:', categoriesResult.error);
          }

          // Fetch plants
          const plantsResult = await fetchAllPlants();
          if (plantsResult.success) {
            setPlants(plantsResult.data);
          } else {
            console.error('Failed to fetch plants:', plantsResult.error);
          }
        } catch (err) {
          console.error('Error fetching data:', err);
          alert('Error loading data. Please check your connection and try again.');
        } finally {
          setIsLoadingDiscountTypes(false);
        }
      }
      
      // Fetch discounts when viewing discounts
      if (activeTab === 'view') {
        try {
          const discountsResult = await fetchAllDiscounts();
          console.log('Discounts API response:', discountsResult);
          if (discountsResult.success) {
            setDiscounts(discountsResult.data);
          } else {
            console.error('Failed to fetch discounts:', discountsResult.error);
          }
        } catch (err) {
          console.error('Error fetching discounts:', err);
        }
      }
    };

    fetchData();
  }, [showDiscountModal, activeTab, fetchAllDiscounts, fetchDiscountTypes, fetchAllCategories, fetchAllPlants]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setDiscountData(prev => ({ ...prev, [name]: val }));
    
    // Reset specific fields when discount type changes
    if (name === 'discount_type') {
      setDiscountData(prev => ({
        ...prev,
        category_id: '',
        plant_id: '',
        discount_value: '',
        is_percentage: true
      }));
    }
  };

  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    try {
      // Make sure discount types are loaded
      if (isLoadingDiscountTypes) {
        alert('Still loading discount types. Please wait.');
        return;
      }
      
      console.log('Current discountTypes:', discountTypes);
      console.log('Current discountData:', discountData);
      
      if (discountTypes.length === 0) {
        alert('No discount types available. Please try again.');
        return;
      }
      
      // Validate that a discount type is selected
      if (!discountData.discount_type) {
        alert('Please select a discount type.');
        return;
      }
      
      // Get discount type ID based on name
      const discountTypeMap = {};
      discountTypes.forEach(type => {
        discountTypeMap[type.name] = type.discount_type_id;
      });
      
      console.log('Discount type map:', discountTypeMap);
      console.log('Looking for discount type:', discountData.discount_type);
      
      const discountTypeId = discountTypeMap[discountData.discount_type];
      
      if (!discountTypeId) {
        alert(`Invalid discount type selected: ${discountData.discount_type}`);
        console.error('Available discount types:', discountTypes);
        console.error('Selected discount type:', discountData.discount_type);
        return;
      }
      
      // Validate required fields
      if (!discountData.discount_value) {
        alert('Please enter a discount value');
        return;
      }
      
      if (!discountData.start_date || !discountData.end_date) {
        alert('Please enter both start and end dates');
        return;
      }
      
      // Validate dates
      const startDate = new Date(discountData.start_date);
      const endDate = new Date(discountData.end_date);
      
      if (startDate >= endDate) {
        alert('End date must be after start date');
        return;
      }
      
      // Prepare data based on discount type
      const dataToSend = {
        discount_type_id: discountTypeId,
        discount_value: parseFloat(discountData.discount_value),
        is_percentage: discountData.is_percentage ? 1 : 0,
        start_date: discountData.start_date,
        end_date: discountData.end_date,
        category_id: discountData.discount_type === 'Category' ? parseInt(discountData.category_id) : null,
        plant_id: discountData.discount_type === 'Plant-specific' ? parseInt(discountData.plant_id) : null
      };
      
      // Remove null values
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === null) {
          delete dataToSend[key];
        }
      });
      
      console.log('Sending discount data:', dataToSend);
      
      const result = await applyDiscount(dataToSend);
      
      if (result && result.success) {
        setShowDiscountModal(false);
        // Reset form with default discount type
        setDiscountData({
          discount_type: discountTypes.length > 0 ? discountTypes[0].name : '',
          category_id: '',
          plant_id: '',
          discount_value: '',
          is_percentage: true,
          start_date: '',
          end_date: '',
        });
        alert('Discount applied successfully!');
        // Refresh discounts list
        setActiveTab('view');
        
        // Force refresh the discounts data
        try {
          const discountsResult = await fetchAllDiscounts();
          if (discountsResult.success) {
            setDiscounts(discountsResult.data);
          } else {
            console.error('Failed to fetch discounts:', discountsResult.error);
          }
        } catch (err) {
          console.error('Error fetching discounts:', err);
        }
      } else {
        const errorMessage = result?.error || 'Failed to apply discount';
        alert(`Error: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Error applying discount:', err);
      alert('Failed to apply discount: ' + (err.message || 'Unknown error'));
    }
  };

  const handleFilterChange = (resolved) => {
    setFilterResolved(resolved);
    fetchLowStockAlerts(resolved);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const formatDiscountValue = (value, isPercentage) => {
    if (isPercentage) {
      return `${value}%`;
    }
    return `₹${value}`;
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>Discount Management</h1>
        <button
          onClick={() => {
            setShowDiscountModal(true);
            setActiveTab('apply');
          }}
          className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors w-full md:w-auto"
        >
          Apply New Discount
        </button>
      </div>
      
      {/* Discount Tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'apply' ? 'border-b-2 border-[#224229] text-[#224229]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('apply')}
          >
            Apply Discount
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'view' ? 'border-b-2 border-[#224229] text-[#224229]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('view')}
          >
            View Discounts
          </button>
        </div>
      </div>
      
      {activeTab === 'apply' && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.primary }}>Low Stock Alerts</h2>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => handleFilterChange(0)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterResolved === 0 ? 'bg-[#224229] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Unresolved Alerts
              </button>
              <button
                onClick={() => handleFilterChange(1)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterResolved === 1 ? 'bg-[#224229] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Alerts
              </button>
            </div>
            {loading.lowStockAlerts && <div className="text-center">Loading alerts...</div>}
            {error.lowStockAlerts && <div className="text-red-500 mb-4">{error.lowStockAlerts}</div>}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="hidden md:grid grid-cols-12 bg-gray-100 p-3 font-medium">
                <div className="col-span-2">Plant ID</div>
                <div className="col-span-3">Plant Name</div>
                <div className="col-span-2">Stock Level</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-3">Status</div>
              </div>
              {lowStockAlerts.alerts?.length > 0 ? (
                lowStockAlerts.alerts.map(alert => (
                  <div key={alert.plant_id} className="grid grid-cols-1 md:grid-cols-12 p-4 border-b gap-4 md:gap-0">
                    <div className="md:hidden space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Plant ID:</span>
                        <span>{alert.plant_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Plant Name:</span>
                        <span>{alert.plant_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Stock Level:</span>
                        <span>{alert.stock_level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Category:</span>
                        <span>{alert.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          alert.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {alert.resolved ? 'Resolved' : 'Unresolved'}
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:grid col-span-2 items-center">{alert.plant_id}</div>
                    <div className="hidden md:grid col-span-3 items-center">{alert.plant_name}</div>
                    <div className="hidden md:grid col-span-2 items-center">{alert.stock_level}</div>
                    <div className="hidden md:grid col-span-2 items-center">{alert.category}</div>
                    <div className="hidden md:grid col-span-3 items-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        alert.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {alert.resolved ? 'Resolved' : 'Unresolved'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No low stock alerts found
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm">Total Alerts</h3>
                <p className="text-2xl font-bold">{lowStockAlerts.total_alerts || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm">Unresolved Alerts</h3>
                <p className="text-2xl font-bold">{lowStockAlerts.unresolved_alerts || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm">Average Stock Level</h3>
                <p className="text-2xl font-bold">{lowStockAlerts.avg_stock_level || 0}</p>
              </div>
            </div>
          </div>
        </>
      )}
      
      {activeTab === 'view' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: theme.colors.primary }}>Applied Discounts</h2>
            <button 
              onClick={async () => {
                try {
                  const discountsResult = await fetchAllDiscounts();
                  if (discountsResult.success) {
                    setDiscounts(discountsResult.data);
                  } else {
                    console.error('Failed to fetch discounts:', discountsResult.error);
                  }
                } catch (err) {
                  console.error('Error fetching discounts:', err);
                }
              }}
              className="bg-[#224229] text-white px-3 py-1 rounded-lg hover:bg-[#4b6250] transition-colors text-sm"
            >
              Refresh
            </button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="hidden md:grid grid-cols-12 bg-gray-100 p-3 font-medium">
              <div className="col-span-2">Discount Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Value</div>
              <div className="col-span-2">Plant/Category</div>
              <div className="col-span-2">Dates</div>
              <div className="col-span-2">Status</div>
            </div>
            {discounts.length > 0 ? (
              discounts.map(discount => (
                <div key={discount.discount_id} className="grid grid-cols-1 md:grid-cols-12 p-4 border-b gap-4 md:gap-0">
                  <div className="md:hidden space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Discount Name:</span>
                      <span>{discount.discount_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <span>{discount.discount_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Value:</span>
                      <span>{formatDiscountValue(discount.discount_value, discount.is_percentage)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Plant/Category:</span>
                      <span>
                        {discount.plant_name || discount.category_name || 'All Plants'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Dates:</span>
                      <span>{formatDate(discount.start_date)} - {formatDate(discount.end_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <span className={discount.is_active ? 'text-green-600' : 'text-red-600'}>
                        {discount.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:grid col-span-2 items-center">{discount.discount_name}</div>
                  <div className="hidden md:grid col-span-2 items-center">{discount.discount_type}</div>
                  <div className="hidden md:grid col-span-2 items-center">{formatDiscountValue(discount.discount_value, discount.is_percentage)}</div>
                  <div className="hidden md:grid col-span-2 items-center">
                    {discount.plant_name || discount.category_name || 'All Plants'}
                  </div>
                  <div className="hidden md:grid col-span-2 items-center">
                    {formatDate(discount.start_date)} - {formatDate(discount.end_date)}
                  </div>
                  <div className="hidden md:grid col-span-2 items-center">
                    <span className={discount.is_active ? 'text-green-600' : 'text-red-600'}>
                      {discount.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No discounts found
              </div>
            )}
          </div>
        </div>
      )}
      
      {showDiscountModal && activeTab === 'apply' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: theme.colors.primary }}>Apply Discount</h2>
              <button onClick={() => setShowDiscountModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleApplyDiscount}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Discount Type</label>
                {isLoadingDiscountTypes ? (
                  <div className="text-gray-500">Loading discount types...</div>
                ) : (
                  <select
                    name="discount_type"
                    value={discountData.discount_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Discount Type</option>
                    {discountTypes.map(type => (
                      <option key={type.discount_type_id} value={type.name}>{type.name}</option>
                    ))}
                  </select>
                )}
              </div>
              
              {discountData.discount_type === 'Category' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Category</label>
                  <select
                    name="category_id"
                    value={discountData.category_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.category_id} value={category.category_id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {discountData.discount_type === 'Plant-specific' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Plant</label>
                  <select
                    name="plant_id"
                    value={discountData.plant_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Plant</option>
                    {plants.map(plant => (
                      <option key={plant.plant_id} value={plant.plant_id}>{plant.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Discount Value</label>
                <div className="flex">
                  <input
                    type="number"
                    name="discount_value"
                    value={discountData.discount_value}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <div className="flex items-center bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_percentage"
                        checked={discountData.is_percentage}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-sm">%</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Start Date</label>
                <input
                  type="datetime-local"
                  name="start_date"
                  value={discountData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>End Date</label>
                <input
                  type="datetime-local"
                  name="end_date"
                  value={discountData.end_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoadingDiscountTypes}
                  className={`px-4 py-2 rounded-lg transition-colors order-1 sm:order-2 ${
                    isLoadingDiscountTypes 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#224229] text-white hover:bg-[#4b6250]'
                  }`}
                >
                  {isLoadingDiscountTypes ? 'Loading...' : 'Apply Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;