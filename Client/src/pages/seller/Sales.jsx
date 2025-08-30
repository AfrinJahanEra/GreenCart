// src/pages/seller/Sales.jsx
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme.js';

const Sales = () => {
  const { dashboardData, loading } = useOutletContext();
  
  // Handle loading state
  if (loading.salesRecords) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading sales records...</div>
      </div>
    );
  }

  // Handle empty state
  if (!dashboardData.salesRecords || dashboardData.salesRecords.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Sales Records</h1>
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sales records yet</h3>
          <p className="text-gray-500">Your sales records will appear here once you make your first sale.</p>
        </div>
      </div>
    );
  }

  // Format date for better display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate total sales and earnings
  const totalSales = dashboardData.salesRecords.reduce((total, sale) => total + sale.quantity, 0);
  const totalEarnings = dashboardData.salesRecords.reduce((total, sale) => total + (sale.seller_earnings || sale.total_amount * 0.9), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Sales Records</h1>
      
      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-2xl font-bold">{dashboardData.salesRecords.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Items Sold</h3>
          <p className="text-2xl font-bold">{totalSales}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Earnings</h3>
          <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-100 p-3 font-medium">
          <div className="col-span-2">Order #</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-3">Plant</div>
          <div className="col-span-1">Qty</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Earnings</div>
        </div>
        
        {dashboardData.salesRecords.map(sale => (
          <div key={sale.order_id || sale.order_item_id} className="grid grid-cols-12 p-3 border-b hover:bg-gray-50">
            <div className="col-span-2 text-sm font-mono">
              {sale.order_number || `#${sale.order_id}`}
            </div>
            <div className="col-span-2 text-sm">
              {formatDate(sale.order_date)}
            </div>
            <div className="col-span-3">
              <div className="font-medium">{sale.plant_name}</div>
              {sale.order_status && (
                <div className="text-xs text-gray-500 capitalize">
                  {sale.order_status.toLowerCase()}
                </div>
              )}
            </div>
            <div className="col-span-1">{sale.quantity}</div>
            <div className="col-span-2 font-medium">
              ${sale.total_amount?.toFixed(2)}
            </div>
            <div className="col-span-2 font-medium text-green-600">
              ${(sale.seller_earnings || sale.total_amount * 0.9).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly summary (optional) */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.primary }}>
          Monthly Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {new Date().toLocaleString('default', { month: 'long' })}
            </div>
            <div className="text-sm text-gray-500">Current Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {dashboardData.salesRecords.filter(sale => {
                const saleDate = new Date(sale.order_date);
                const now = new Date();
                return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <div className="text-sm text-gray-500">Orders This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              $
              {dashboardData.salesRecords
                .filter(sale => {
                  const saleDate = new Date(sale.order_date);
                  const now = new Date();
                  return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
                })
                .reduce((total, sale) => total + (sale.seller_earnings || sale.total_amount * 0.9), 0)
                .toFixed(2)
              }
            </div>
            <div className="text-sm text-gray-500">Earnings This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {dashboardData.salesRecords.filter(sale => {
                const saleDate = new Date(sale.order_date);
                const now = new Date();
                return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
              }).reduce((total, sale) => total + sale.quantity, 0)}
            </div>
            <div className="text-sm text-gray-500">Items Sold This Month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;