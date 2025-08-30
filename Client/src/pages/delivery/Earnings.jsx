// src/pages/delivery/Earnings.jsx
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Earnings = () => {
  const { dashboardData, totalEarnings } = useOutletContext();
  
  // Handle undefined data gracefully
  const completedDeliveries = dashboardData?.completed_assignments || [];
  const stats = dashboardData?.stats || {};
  const history = dashboardData?.history || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>
        My Earnings
      </h1>
      
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
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="p-4 border-b font-medium" style={{ color: theme.colors.primary }}>
          Delivery History (Last 30 Days)
        </h2>
        
        {history.length > 0 ? (
          <div className="divide-y">
            {history.map(delivery => (
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
                    <span className="font-medium">${delivery.total_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Delivery Fee:</span>
                    <span className="font-medium text-green-600">
                      ${delivery.delivery_fee?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
                
                {/* Desktop view */}
                <div className="hidden md:grid col-span-2 font-medium items-center">#{delivery.order_number}</div>
                <div className="hidden md:grid col-span-3 items-center">{delivery.customer_name}</div>
                <div className="hidden md:grid col-span-2 items-center text-sm">
                  {new Date(delivery.order_date).toLocaleDateString()}
                </div>
                <div className="hidden md:grid col-span-2 items-center text-right">
                  ${delivery.total_amount?.toFixed(2) || '0.00'}
                </div>
                <div className="hidden md:grid col-span-3 items-center text-right font-medium text-green-600">
                  ${delivery.delivery_fee?.toFixed(2) || '0.00'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No delivery history yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;