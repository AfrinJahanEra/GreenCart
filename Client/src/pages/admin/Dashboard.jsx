import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Dashboard = () => {
  const { dashboardStats, orders, loading, error } = useOutletContext();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Admin Dashboard</h1>
      {loading.stats && <div className="text-center">Loading stats...</div>}
      {error.stats && <div className="text-red-500 mb-4">{error.stats}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Customers</h3>
          <p className="text-2xl sm:text-3xl font-bold">{dashboardStats.total_customers}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Active Delivery Agents</h3>
          <p className="text-2xl sm:text-3xl font-bold">{dashboardStats.total_delivery_agents}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Sales Team Members</h3>
          <p className="text-2xl sm:text-3xl font-bold">{dashboardStats.total_sellers}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-2xl sm:text-3xl font-bold">{dashboardStats.pending_orders}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Monthly Revenue</h3>
          <p className="text-2xl sm:text-3xl font-bold">${dashboardStats.total_revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Low Stock Alerts</h3>
          <p className="text-2xl sm:text-3xl font-bold">{dashboardStats.low_stock_alerts}</p>
        </div>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.primary }}>Recent Orders</h2>
        {loading.orders && <div className="text-center">Loading orders...</div>}
        {error.orders && <div className="text-red-500 mb-4">{error.orders}</div>}
        <div className="space-y-2 sm:space-y-3">
          {orders.slice(0, 5).map(order => (
            <div key={order.order_id} className="border-b pb-2 sm:pb-3 last:border-b-0">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="font-medium">Order #{order.order_number}</span>
                <span className={
                  order.order_status === 'Delivered' ? 'text-green-500' :
                  order.order_status === 'Shipped' ? 'text-blue-500' :
                  order.order_status === 'Assigned' ? 'text-purple-500' :
                  'text-yellow-500'
                }>
                  {order.order_status}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                <span>{order.customer_name}</span>
                <span>${order.total_amount?.toFixed(2) || 'N/A'}</span>
              </div>
            </div>
          ))}
          {orders.length === 0 && !loading.orders && (
            <div className="text-center text-gray-500">No recent orders</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;