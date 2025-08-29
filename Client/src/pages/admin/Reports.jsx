import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Reports = () => {
  const { lowStockAlerts, applyDiscount, fetchLowStockAlerts, loading, error } = useOutletContext();
  const [discountData, setDiscountData] = useState({
    plant_id: '',
    discount_percentage: '',
    start_date: '',
    end_date: '',
  });
  const [filterResolved, setFilterResolved] = useState(0); // 0 for unresolved, 1 for all
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDiscountData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    try {
      await applyDiscount({
        plant_id: parseInt(discountData.plant_id),
        discount_percentage: parseFloat(discountData.discount_percentage),
        start_date: discountData.start_date,
        end_date: discountData.end_date,
      });
      setShowDiscountModal(false);
      setDiscountData({ plant_id: '', discount_percentage: '', start_date: '', end_date: '' });
      alert('Discount applied successfully!');
    } catch (err) {
      alert('Failed to apply discount: ' + err.message);
    }
  };

  const handleFilterChange = (resolved) => {
    setFilterResolved(resolved);
    fetchLowStockAlerts(resolved);
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>Discount Assignment</h1>
        <button
          onClick={() => setShowDiscountModal(true)}
          className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors w-full md:w-auto"
        >
          Apply New Discount
        </button>
      </div>
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
      {showDiscountModal && (
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
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Plant ID</label>
                <input
                  type="number"
                  name="plant_id"
                  value={discountData.plant_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Discount Percentage (%)</label>
                <input
                  type="number"
                  name="discount_percentage"
                  value={discountData.discount_percentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Start Date</label>
                <input
                  type="date"
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
                  type="date"
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
                  className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors order-1 sm:order-2"
                >
                  Apply Discount
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