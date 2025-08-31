// src/pages/delivery/Earnings.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDeliveryAgent } from '../../hooks/useDeliveryAgent';
import { theme } from '../../theme';

const Earnings = () => {
  const { user } = useAuth();
  const { dashboardData, loading, error } = useDeliveryAgent(user?.user_id);
  
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
      </div>
      
      {error.dashboard && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Error: {error.dashboard}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Deliveries</h3>
          <p className="text-2xl font-bold">{stats.total_deliveries || stats.total_assignments || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Completed Deliveries</h3>
          <p className="text-2xl font-bold">{stats.completed_deliveries || stats.completed_assignments || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Deliveries</h3>
          <p className="text-2xl font-bold">{stats.pending_deliveries || stats.pending_assignments || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Earnings</h3>
          <p className="text-2xl font-bold">${formatPrice(totalEarnings)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Avg. per Delivery</h3>
          <p className="text-2xl font-bold">
            ${stats.avg_earnings_per_delivery ? formatPrice(stats.avg_earnings_per_delivery) : '0.00'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Completion Rate</h3>
          <p className="text-2xl font-bold">
            {stats.completion_rate ? `${stats.completion_rate}%` : '0%'}
          </p>
        </div>
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