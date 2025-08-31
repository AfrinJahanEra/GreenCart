// src/pages/orderdashboard/PendingConfirmationOrders.jsx
import { Link } from 'react-router-dom';
import { theme } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomerOrders } from '../../hooks/useCustomerOrders';

const PendingOrders = () => {
  const { user } = useAuth();
  const { orders, loading, error, confirmDelivery } = useCustomerOrders(user?.user_id);
  
  // Add debug logging
  console.log('PendingOrders - User:', user);
  console.log('PendingOrders - Orders:', orders);
  console.log('PendingOrders - Loading:', loading);
  console.log('PendingOrders - Error:', error);
  
  // Add safety check for orders.pendingConfirmation
  const pendingOrders = orders?.pendingConfirmation || [];

  const handleConfirmDelivery = async (orderId) => {
    try {
      const result = await confirmDelivery(orderId);
      if (result.success) {
        alert('Delivery confirmed successfully!');
        // Refresh the orders after confirmation
        await fetchPendingConfirmationOrders();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      alert('Failed to confirm delivery. Please try again.');
    }
  };

  if (loading.pendingConfirmation) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Pending Confirmation</h1>
        <div className="space-y-6">
          {[1, 2].map((n) => (
            <div key={n} className="border rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error.pendingConfirmation) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Pending Confirmation</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error.pendingConfirmation}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>
        Pending Confirmation ({pendingOrders.length})
      </h1>
      
      {pendingOrders.length === 0 ? (
        <div className="text-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
          </svg>
          <p className="mt-4 text-lg text-gray-600">No orders pending confirmation</p>
          <p className="text-sm text-gray-500">All your deliveries have been confirmed</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingOrders.map(order => (
            <div key={order.order_id} className="border rounded-lg overflow-hidden">
              <div className="bg-orange-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-orange-200 gap-2">
                <div>
                  <h3 className="font-medium">Order #{order.order_number}</h3>
                  <p className="text-sm text-orange-600">
                    Out for Delivery - Agent has confirmed
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  Waiting for your confirmation
                </span>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-3">Items</h4>
                    <p className="text-sm text-gray-600">{order.items_summary}</p>
                  </div>
                  
                  {/* Delivery Information */}
                  <div>
                    <h4 className="font-medium mb-3">Delivery Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Agent:</span> {order.delivery_agent_name}</p>
                      <p><span className="text-gray-500">Phone:</span> {order.delivery_agent_phone}</p>
                      <p><span className="text-gray-500">Vehicle:</span> {order.vehicle_type}</p>
                    </div>
                  </div>
                  
                  {/* Delivery Address */}
                  <div>
                    <h4 className="font-medium mb-3">Delivery Address</h4>
                    <p className="text-sm text-gray-600">{order.delivery_address}</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <button
                    onClick={() => handleConfirmDelivery(order.order_id)}
                    disabled={loading.confirmDelivery}
                    className="bg-[#224229] text-white px-6 py-2 rounded-lg hover:bg-[#4b6250] disabled:bg-gray-400 transition-colors"
                  >
                    {loading.confirmDelivery ? 'Confirming...' : 'Confirm Delivery Received'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Please confirm only after you have physically received the order
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingOrders;