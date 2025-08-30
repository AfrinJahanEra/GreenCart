// src/pages/seller/Sales.jsx
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme.js';

const Sales = () => {
  const { dashboardData, loading } = useOutletContext();
  
  // Helper function to safely format prices
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };
  
  // Helper function to safely get quantities
  const getQuantity = (quantity) => {
    const numQuantity = parseInt(quantity);
    return isNaN(numQuantity) ? 0 : numQuantity;
  };
  
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

  // Format date for better display with error handling
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // Handle different date formats that might come from the database
      let date;
      
      // If it's already a Date object
      if (dateString instanceof Date) {
        date = dateString;
      }
      // If it's a string in YYYY-MM-DD format (from TO_CHAR)
      else if (typeof dateString === 'string') {
        // Remove any time portion and clean the string
        const cleanDateString = dateString.split(' ')[0].split('T')[0];
        date = new Date(cleanDateString + 'T00:00:00');
      }
      else {
        date = new Date(dateString);
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date received:', dateString);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      return 'Invalid Date';
    }
  };

  // Calculate total sales and earnings with safe parsing
  const totalSales = dashboardData.salesRecords?.reduce((total, sale) => {
    return total + getQuantity(sale.quantity);
  }, 0) || 0;
  
  const totalEarnings = dashboardData.salesRecords?.reduce((total, sale) => {
    const earnings = parseFloat(sale.seller_earnings) || (parseFloat(sale.total_amount) * 0.9) || 0;
    return total + earnings;
  }, 0) || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Sales Records</h1>
      
      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
          <strong>Debug:</strong> Sales Records Count: {dashboardData.salesRecords?.length || 0}
          {dashboardData.salesRecords?.length > 0 && (
            <div>Sample Date: {JSON.stringify(dashboardData.salesRecords[0].order_date)}</div>
          )}
        </div>
      )}
      
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
          <p className="text-2xl font-bold">${formatPrice(totalEarnings)}</p>
        </div>
      </div>
      
      {/* Monthly summary */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
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
              {formatPrice(
                dashboardData.salesRecords
                  ?.filter(sale => {
                    const saleDate = new Date(sale.order_date);
                    const now = new Date();
                    return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
                  })
                  .reduce((total, sale) => {
                    const earnings = parseFloat(sale.seller_earnings) || (parseFloat(sale.total_amount) * 0.9) || 0;
                    return total + earnings;
                  }, 0) || 0
              )}
            </div>
            <div className="text-sm text-gray-500">Earnings This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {dashboardData.salesRecords
                ?.filter(sale => {
                  const saleDate = new Date(sale.order_date);
                  const now = new Date();
                  return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
                })
                .reduce((total, sale) => total + getQuantity(sale.quantity), 0) || 0
              }
            </div>
            <div className="text-sm text-gray-500">Items Sold This Month</div>
          </div>
        </div>
      </div>

      {/* Daily Orders Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.primary }}>Daily Orders Chart</h2>
        
        {/* Chart with X and Y Axes */}
        <div className="space-y-4">
          {(() => {
            // Process sales data to group by date
            const dailyOrders = {};
            
            if (dashboardData.salesRecords) {
              dashboardData.salesRecords.forEach(sale => {
                const formattedDate = formatDate(sale.order_date);
                if (formattedDate !== 'Invalid Date' && formattedDate !== 'N/A') {
                  dailyOrders[formattedDate] = (dailyOrders[formattedDate] || 0) + 1;
                }
              });
            }
            
            // Convert to array and sort by date
            const chartData = Object.entries(dailyOrders)
              .map(([date, count]) => ({ date, count }))
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(-10); // Show last 10 days
            
            const maxCount = Math.max(...chartData.map(d => d.count), 1);
            
            return chartData.length > 0 ? (
              <div className="relative">
                {/* Y-Axis Label */}
                <div className="absolute left-0 top-0 -rotate-90 origin-left text-sm text-gray-600 font-medium" style={{transform: 'rotate(-90deg) translateX(-50%) translateY(-20px)'}}>
                  Number of Orders
                </div>
                
                {/* Chart Area with Y-Axis */}
                <div className="ml-16 mr-4">
                  {/* Y-Axis Scale */}
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col justify-between h-40 text-xs text-gray-500 pr-2">
                      <span>{maxCount}</span>
                      <span>{Math.ceil(maxCount * 0.75)}</span>
                      <span>{Math.ceil(maxCount * 0.5)}</span>
                      <span>{Math.ceil(maxCount * 0.25)}</span>
                      <span>0</span>
                    </div>
                    
                    {/* Chart Bars */}
                    <div className="flex-1 space-y-3">
                      {chartData.map((item, index) => (
                        <div key={index} className="flex items-end space-x-2">
                          <div className="w-16 text-xs text-gray-600 text-right">
                            {item.date}
                          </div>
                          <div className="flex-1 flex items-center">
                            <div 
                              className="bg-green-500 h-8 rounded flex items-center justify-end pr-2 text-white text-sm font-medium min-w-12 transition-all duration-300"
                              style={{ width: `${(item.count / maxCount) * 100}%`, minWidth: '48px' }}
                              title={`${item.date}: ${item.count} orders`}
                            >
                              {item.count}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* X-Axis Line */}
                  <div className="border-t-2 border-gray-300 mt-2 mb-2"></div>
                  
                  {/* X-Axis Label */}
                  <div className="text-center text-sm text-gray-600 font-medium mt-2">
                    Date
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No order data available for chart
              </div>
            );
          })()}
        </div>
        
        {/* Chart Legend */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>📊 Daily Orders Overview (Last 10 days)</span>
            <span>Total Orders: {dashboardData.salesRecords?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;