// src/pages/delivery/Completed.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDeliveryAgent } from '../../hooks/useDeliveryAgent';
import { theme } from '../../theme';

const Completed = () => {
  const { user } = useAuth();
  const { fetchCompletedOrders, loading, error } = useDeliveryAgent(user?.user_id);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to safely format price
  const formatPrice = (value) => {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
  };

  // Helper function to calculate delivery fee
  const getDeliveryFee = (order) => {
    if (order.delivery_cost) {
      return formatPrice(order.delivery_cost);
    }
    const totalAmount = parseFloat(order.total_amount);
    return isNaN(totalAmount) ? '0.00' : (totalAmount * 0.05).toFixed(2);
  };

  // Fetch completed orders on component mount
  useEffect(() => {
    const loadCompletedOrders = async () => {
      if (user?.user_id) {
        setIsLoading(true);
        try {
          const orders = await fetchCompletedOrders();
          console.log('Fetched completed orders:', orders);
          setCompletedOrders(orders || []);
        } catch (err) {
          console.error('Error loading completed orders:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCompletedOrders();
  }, [user?.user_id, fetchCompletedOrders]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status, agentConfirmed, customerConfirmed) => {
    if (status === 'Delivered' && agentConfirmed && customerConfirmed) {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Fully Confirmed</span>;
    } else if (status === 'Delivered' && agentConfirmed && !customerConfirmed) {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending Customer Confirmation</span>;
    } else {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Delivered</span>;
    }
  };

  const getPerformanceBadge = (performance) => {
    return performance === 'On Time' ?
      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">On Time</span> :
      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Delayed</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#224229]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
          Completed Deliveries ({completedOrders.length})
        </h1>
        <button
          onClick={async () => {
            setIsLoading(true);
            const orders = await fetchCompletedOrders();
            setCompletedOrders(orders || []);
            setIsLoading(false);
          }}
          className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors text-sm"
        >
          Refresh
        </button>
      </div>
      
      {error.orders && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error.orders}
        </div>
      )}
      
      {completedOrders.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-lg text-gray-600">No completed deliveries</p>
          <p className="text-sm text-gray-500">Completed deliveries will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedOrders.map(order => (
            <div key={order.order_id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Order Header */}
              <div className="bg-green-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b gap-2">
                <div>
                  <h3 className="font-medium text-lg">Order #{order.order_number}</h3>
                  <p className="text-sm text-gray-500">
                    Delivered: {formatDate(order.actual_delivery_date)}
                  </p>
                  <div className="mt-1 flex gap-2">
                    {getStatusBadge(order.order_status, order.agent_confirmed, order.customer_confirmed)}
                    {order.delivery_performance && getPerformanceBadge(order.delivery_performance)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg">${formatPrice(order.total_amount)}</span>
                  <p className="text-sm text-green-600">Earned: ${getDeliveryFee(order)}</p>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center text-blue-700">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Customer Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {order.customer_name || 'N/A'}</div>
                      <div><strong>Email:</strong> 
                        <a href={`mailto:${order.customer_email}`} className="text-blue-600 hover:underline ml-1 break-all">
                          {order.customer_email || 'N/A'}
                        </a>
                      </div>
                      <div><strong>Phone:</strong> 
                        <a href={`tel:${order.customer_phone}`} className="text-blue-600 hover:underline ml-1">
                          {order.customer_phone || 'N/A'}
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delivery Timeline */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center text-green-700">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Delivery Timeline
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Address:</strong> {order.delivery_address || 'N/A'}</div>
                      <div><strong>Method:</strong> {order.delivery_method || 'Standard'}</div>
                      <div><strong>Assigned:</strong> {formatDate(order.assigned_at)}</div>
                      <div><strong>Completed:</strong> {formatDate(order.completed_at)}</div>
                      <div><strong>Actual Delivery:</strong> {formatDate(order.actual_delivery_date)}</div>
                      {order.confirmed_date && (
                        <div><strong>Confirmed:</strong> {formatDate(order.confirmed_date)}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Order Summary */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center text-orange-700">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Order Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded text-xs max-h-20 overflow-y-auto">
                        {order.items_summary || 'No items listed'}
                      </div>
                      <div><strong>Total:</strong> ${formatPrice(order.total_amount)}</div>
                      <div><strong>Your Earnings:</strong> 
                        <span className="text-green-600 font-medium ml-1">
                          ${getDeliveryFee(order)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        <strong>Performance:</strong> {order.delivery_performance || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Delivery Notes */}
                {order.notes && (
                  <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <strong className="text-blue-800">Delivery Notes:</strong>
                        <p className="text-blue-700 text-sm mt-1">{order.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Confirmation Status */}
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <svg className={`w-5 h-5 mr-2 ${order.agent_confirmed ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className={`text-sm ${order.agent_confirmed ? 'text-green-600' : 'text-gray-500'}`}>
                          Agent Confirmed
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg className={`w-5 h-5 mr-2 ${order.customer_confirmed ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className={`text-sm ${order.customer_confirmed ? 'text-green-600' : 'text-gray-500'}`}>
                          Customer Confirmed
                        </span>
                      </div>
                    </div>
                    {order.agent_confirmed && order.customer_confirmed && (
                      <span className="text-sm text-green-600 font-medium">✓ Delivery Complete</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Completed;