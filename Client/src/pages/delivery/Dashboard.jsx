// src/pages/delivery/Dashboard.jsx
import { useAuth } from '../../contexts/AuthContext';
import { useDeliveryAgent } from '../../hooks/useDeliveryAgent';
import { theme } from '../../theme';

const Dashboard = () => {
  const { user } = useAuth();
  const { dashboardData, loading, error, refreshAllData } = useDeliveryAgent(user?.user_id);
  
  const stats = dashboardData?.stats || {};
  const pendingOrders = dashboardData?.pending_orders || [];
  const completedOrders = dashboardData?.completed_orders || [];

  if (loading.dashboard) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#224229]"></div>
      </div>
    );
  }

  // Function to get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {error.dashboard && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex justify-between items-center">
            <span>Error: {error.dashboard}</span>
            <button
              onClick={refreshAllData}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_assignments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending_assignments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed_assignments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${(stats.total_earnings || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Orders Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold" style={{ color: theme.colors.primary }}>Pending Deliveries</h2>
        </div>
        <div className="p-6">
          {pendingOrders.length > 0 ? (
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div key={order.order_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <h3 className="font-medium text-gray-900">Order #{order.order_number}</h3>
                          <p className="text-sm text-gray-500">{formatDate(order.order_date)}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Customer</p>
                          <p className="text-sm text-gray-900">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">{order.customer_phone}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                          <p className="text-sm text-gray-900">{order.delivery_address}</p>
                          {order.delivery_notes && (
                            <p className="text-sm text-gray-500">Notes: {order.delivery_notes}</p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700">Items</p>
                          <p className="text-sm text-gray-900">{order.order_items}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700">Amount</p>
                          <p className="text-sm text-gray-900">${order.total_amount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No pending deliveries at the moment
            </div>
          )}
        </div>
      </div>

      {/* Completed Orders Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold" style={{ color: theme.colors.primary }}>Completed Deliveries</h2>
        </div>
        <div className="p-6">
          {completedOrders.length > 0 ? (
            <div className="space-y-4">
              {completedOrders.map((order) => (
                <div key={order.order_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <h3 className="font-medium text-gray-900">Order #{order.order_number}</h3>
                          <p className="text-sm text-gray-500">{formatDate(order.order_date)}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Customer</p>
                          <p className="text-sm text-gray-900">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">{order.customer_phone}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                          <p className="text-sm text-gray-900">{order.delivery_address}</p>
                          {order.delivery_notes && (
                            <p className="text-sm text-gray-500">Notes: {order.delivery_notes}</p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700">Items</p>
                          <p className="text-sm text-gray-900">{order.order_items}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700">Amount</p>
                          <p className="text-sm text-gray-900">${order.total_amount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No completed deliveries yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;