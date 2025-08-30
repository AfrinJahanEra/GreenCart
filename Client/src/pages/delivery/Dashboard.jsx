// src/pages/delivery/Dashboard.jsx
import { useAuth } from '../../contexts/AuthContext';
import { useDeliveryAgent } from '../../hooks/useDeliveryAgent';
import { theme } from '../../theme';

const Dashboard = () => {
  const { user } = useAuth();
  const { dashboardData, loading, error, refreshAllData } = useDeliveryAgent(user?.user_id);
  
  const stats = dashboardData?.stats || {};
  const agentInfo = dashboardData?.agent_info || {};
  const pendingDeliveries = dashboardData?.pending_assignments?.filter(delivery => 
    delivery.agent_id && delivery.order_status !== 'Delivered'
  ) || [];
  const completedDeliveries = dashboardData?.completed_assignments || [];
  const recentHistory = dashboardData?.history?.slice(0, 5) || [];

  // Use agent info from API if available, otherwise fall back to user info
  const displayName = agentInfo.first_name && agentInfo.last_name ? 
    `${agentInfo.first_name} ${agentInfo.last_name}` : 
    `${user?.first_name || ''} ${user?.last_name || ''}`;
  const displayEmail = agentInfo.email || user?.email || 'No email';
  const displayPhone = agentInfo.phone || user?.phone || 'No phone';
  const initials = agentInfo.first_name && agentInfo.last_name ? 
    `${agentInfo.first_name[0]}${agentInfo.last_name[0]}` : 
    `${user?.first_name?.[0] || 'D'}${user?.last_name?.[0] || 'A'}`;
  const vehicleInfo = agentInfo.vehicle_type ? 
    `Vehicle: ${agentInfo.vehicle_type}` : 'Vehicle: Not specified';

  if (loading.dashboard) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#224229]"></div>
      </div>
    );
  }

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
      {/* Personal Information Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#224229] flex items-center justify-center text-white text-2xl font-bold">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {displayName.trim() || 'Delivery Agent'}
            </h1>
            <p className="text-gray-600">Delivery Agent {agentInfo.agent_id ? `(ID: ${agentInfo.agent_id})` : ''}</p>
            <p className="text-sm text-gray-500">{displayEmail}</p>
            <p className="text-sm text-gray-500">{displayPhone}</p>
            <p className="text-sm text-gray-500">{vehicleInfo}</p>
            {agentInfo.license_number && (
              <p className="text-sm text-gray-500">License: {agentInfo.license_number}</p>
            )}
          </div>
        </div>
      </div>

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
              <p className="text-2xl font-bold text-gray-900">{stats.total_deliveries || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.pending_deliveries || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.completed_deliveries || 0}</p>
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

      {/* Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Deliveries Summary */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              My Pending Deliveries ({pendingDeliveries.length})
            </h3>
          </div>
          <div className="p-6">
            {pendingDeliveries.length > 0 ? (
              <div className="space-y-4">
                {pendingDeliveries.slice(0, 3).map(delivery => (
                  <div key={delivery.order_id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">#{delivery.order_number}</p>
                      <p className="text-sm text-gray-600">{delivery.customer_name}</p>
                      <p className="text-xs text-orange-600">{delivery.order_status}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${(delivery.total_amount || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        {delivery.estimated_delivery_date ? 
                          new Date(delivery.estimated_delivery_date).toLocaleDateString() : 
                          'No date set'}
                      </p>
                    </div>
                  </div>
                ))}
                {pendingDeliveries.length > 3 && (
                  <p className="text-center text-sm text-gray-500 pt-2">
                    +{pendingDeliveries.length - 3} more pending deliveries
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No pending deliveries</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Completed Deliveries */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Completed Deliveries ({completedDeliveries.length})
            </h3>
          </div>
          <div className="p-6">
            {completedDeliveries.length > 0 ? (
              <div className="space-y-4">
                {completedDeliveries.slice(0, 3).map(delivery => (
                  <div key={delivery.order_id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">#{delivery.order_number}</p>
                      <p className="text-sm text-gray-600">{delivery.customer_name}</p>
                      <p className="text-xs text-green-600">
                        {delivery.customer_confirmed && delivery.agent_confirmed ? 
                          'Fully Confirmed' : 'Awaiting Confirmation'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${(delivery.total_amount || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        {delivery.actual_delivery_date ? 
                          new Date(delivery.actual_delivery_date).toLocaleDateString() : 
                          'Recently completed'}
                      </p>
                    </div>
                  </div>
                ))}
                {completedDeliveries.length > 3 && (
                  <p className="text-center text-sm text-gray-500 pt-2">
                    +{completedDeliveries.length - 3} more completed deliveries
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No completed deliveries yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {stats.completion_rate !== undefined && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: theme.colors.primary }}>
                {stats.completion_rate || 0}%
              </p>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: theme.colors.primary }}>
                ${(stats.avg_earnings_per_delivery || 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Avg. Earnings per Delivery</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: theme.colors.primary }}>
                {recentHistory.length}
              </p>
              <p className="text-sm text-gray-600">Recent Activities (30 days)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;