// src/pages/seller/Dashboard.jsx
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme.js';

const Dashboard = () => {
  const { dashboardData, loading } = useOutletContext();
  
  // Helper function to safely format numbers
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };
  
  // Helper function to safely format total earnings
  const formatTotalEarnings = () => {
    const earnings = parseFloat(dashboardData.stats?.total_earnings || 0);
    return isNaN(earnings) ? '0.00' : earnings.toFixed(2);
  };
  
  if (loading.stats) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Seller Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Plants</h3>
          <p className="text-2xl sm:text-3xl font-bold">{dashboardData.stats?.total_plants || 0}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Sales</h3>
          <p className="text-2xl sm:text-3xl font-bold">{dashboardData.stats?.total_sold || 0}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Earnings</h3>
          <p className="text-2xl sm:text-3xl font-bold">${formatTotalEarnings()}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Low Stock Items</h3>
          <p className="text-2xl sm:text-3xl font-bold">
            {dashboardData.plants?.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length || 0}
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Out of Stock</h3>
          <p className="text-2xl sm:text-3xl font-bold">
            {dashboardData.plants?.filter(p => p.stock_quantity === 0).length || 0}
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Inventory Value</h3>
          <p className="text-2xl sm:text-3xl font-bold">
            ${
              dashboardData.plants
                ?.reduce((total, plant) => total + (parseFloat(plant.base_price || 0) * (plant.stock_quantity || 0)), 0)
                .toFixed(2) || '0.00'
            }
          </p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.primary }}>Recent Sales</h2>
        <div className="space-y-2 sm:space-y-3">
          {dashboardData.recentSales?.slice(0, 5).map(sale => (
            <div key={sale.order_id || sale.id} className="border-b pb-2 sm:pb-3 last:border-b-0">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="font-medium">{sale.plant_name || 'Unknown Plant'}</span>
                <span className="text-green-500">
                  Qty: {sale.quantity || 0}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                <span>{sale.order_date || 'N/A'}</span>
                <span>${formatPrice(sale.total_amount)}</span>
              </div>
            </div>
          )) || []}
          {(!dashboardData.recentSales || dashboardData.recentSales.length === 0) && (
            <div className="text-center text-gray-500">No recent sales found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;