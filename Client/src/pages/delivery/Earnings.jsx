// src/pages/delivery/Earnings.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDeliveryAgent } from '../../hooks/useDeliveryAgent';
import { theme } from '../../theme';

const Earnings = () => {
  const { user } = useAuth();
  const { dashboardData, fetchMonthlyEarnings, loading, error } = useDeliveryAgent(user?.user_id);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(false);
  
  // Helper function to safely format price
  const formatPrice = (value) => {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
  };

  // Helper function to calculate delivery fee
  const getDeliveryFee = (order) => {
    if (order.delivery_fee || order.delivery_cost) {
      return formatPrice(order.delivery_fee || order.delivery_cost);
    }
    const totalAmount = parseFloat(order.total_amount);
    return isNaN(totalAmount) ? '0.00' : (totalAmount * 0.05).toFixed(2);
  };
  
  // Handle undefined data gracefully
  const completedDeliveries = dashboardData?.completed_assignments || [];
  const stats = dashboardData?.stats || {};
  const totalEarnings = stats?.total_earnings || 0;
  
  // Fetch monthly earnings data
  useEffect(() => {
    const loadMonthlyEarnings = async () => {
      if (user?.user_id && fetchMonthlyEarnings) {
        setIsLoadingEarnings(true);
        try {
          const earnings = await fetchMonthlyEarnings(selectedYear);
          console.log('Monthly earnings data:', earnings);
          setMonthlyEarnings(earnings || []);
        } catch (err) {
          console.error('Error loading monthly earnings:', err);
        } finally {
          setIsLoadingEarnings(false);
        }
      }
    };

    loadMonthlyEarnings();
  }, [user?.user_id, selectedYear, fetchMonthlyEarnings]);
  
  // Calculate monthly totals
  const monthlyTotals = monthlyEarnings.reduce((acc, earning) => {
    const month = earning.month || 'Unknown';
    if (!acc[month]) {
      acc[month] = {
        month,
        totalEarnings: 0,
        deliveryCount: 0,
        orders: []
      };
    }
    acc[month].totalEarnings += parseFloat(earning.delivery_fee || 0);
    acc[month].deliveryCount += 1;
    acc[month].orders.push(earning);
    return acc;
  }, {});
  
  const monthlyData = Object.values(monthlyTotals).sort((a, b) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(a.month) - months.indexOf(b.month);
  });

  if (loading.dashboard) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#224229]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
          My Earnings
        </h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#224229] focus:border-transparent"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={async () => {
              setIsLoadingEarnings(true);
              const earnings = await fetchMonthlyEarnings(selectedYear);
              setMonthlyEarnings(earnings || []);
              setIsLoadingEarnings(false);
            }}
            className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors text-sm"
            disabled={isLoadingEarnings}
          >
            {isLoadingEarnings ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {error.dashboard && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Error: {error.dashboard}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Deliveries</h3>
          <p className="text-2xl font-bold">{stats.total_deliveries || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Completed Deliveries</h3>
          <p className="text-2xl font-bold">{stats.completed_deliveries || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Deliveries</h3>
          <p className="text-2xl font-bold">{stats.pending_deliveries || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Earnings</h3>
          <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Avg. per Delivery</h3>
          <p className="text-2xl font-bold">
            ${stats.avg_earnings_per_delivery ? stats.avg_earnings_per_delivery.toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Completion Rate</h3>
          <p className="text-2xl font-bold">
            {stats.completion_rate ? `${stats.completion_rate}%` : '0%'}
          </p>
        </div>
      </div>
      
      {/* Monthly Earnings Breakdown */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <h2 className="p-4 border-b font-medium" style={{ color: theme.colors.primary }}>
          Monthly Earnings Breakdown ({selectedYear})
        </h2>
        
        {isLoadingEarnings ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#224229]"></div>
          </div>
        ) : monthlyData.length > 0 ? (
          <div className="divide-y">
            {monthlyData.map((monthData, index) => (
              <div key={index} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-lg">{monthData.month}</h3>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ${monthData.totalEarnings.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {monthData.deliveryCount} deliveries
                    </p>
                  </div>
                </div>
                
                {/* Monthly delivery details */}
                <div className="mt-3 space-y-2">
                  {monthData.orders.slice(0, 5).map((order, orderIndex) => (
                    <div key={orderIndex} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                      <span>Order #{order.order_number}</span>
                      <span className="font-medium">${formatPrice(order.delivery_fee)}</span>
                    </div>
                  ))}
                  {monthData.orders.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{monthData.orders.length - 5} more deliveries
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <p className="text-lg">No earnings data for {selectedYear}</p>
            <p className="text-sm">Start making deliveries to see your earnings here</p>
          </div>
        )}
      </div>
      
      {/* Recent Delivery History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="p-4 border-b font-medium" style={{ color: theme.colors.primary }}>
          Recent Delivery History
        </h2>
        
        {completedDeliveries.length > 0 ? (
          <div className="divide-y">
            {completedDeliveries.slice(0, 10).map(delivery => (
              <div key={delivery.order_id} className="grid grid-cols-1 md:grid-cols-12 p-4 gap-4 md:gap-0">
                {/* Mobile view */}
                <div className="md:hidden space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Order ID:</span>
                    <span>#{delivery.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Customer:</span>
                    <span>{delivery.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span className="text-sm">
                      {new Date(delivery.order_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span className="font-medium">${formatPrice(delivery.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Delivery Fee:</span>
                    <span className="font-medium text-green-600">
                      ${getDeliveryFee(delivery)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {delivery.order_status}
                    </span>
                  </div>
                </div>
                
                {/* Desktop view */}
                <div className="hidden md:grid col-span-2 font-medium items-center">#{delivery.order_number}</div>
                <div className="hidden md:grid col-span-2 items-center">{delivery.customer_name}</div>
                <div className="hidden md:grid col-span-2 items-center text-sm">
                  {new Date(delivery.order_date).toLocaleDateString()}
                </div>
                <div className="hidden md:grid col-span-2 items-center text-right">
                  ${formatPrice(delivery.total_amount)}
                </div>
                <div className="hidden md:grid col-span-2 items-center text-right font-medium text-green-600">
                  ${getDeliveryFee(delivery)}
                </div>
                <div className="hidden md:grid col-span-2 items-center text-right">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {delivery.order_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg">No delivery history yet</p>
            <p className="text-sm">Complete deliveries to see your history here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;