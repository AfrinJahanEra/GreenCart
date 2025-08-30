// src/pages/delivery/Pending.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDeliveryAgent } from '../../hooks/useDeliveryAgent';
import { theme } from '../../theme';

const Pending = () => {
  const { user } = useAuth();
  const { fetchPendingOrders, markDeliveryCompleted, loading, error } = useDeliveryAgent(user?.user_id);
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch pending deliveries on component mount
  useEffect(() => {
    const loadPendingDeliveries = async () => {
      if (user?.user_id) {
        setIsLoading(true);
        try {
          const orders = await fetchPendingOrders();
          console.log('Fetched pending deliveries:', orders);
          setPendingDeliveries(orders || []);
        } catch (err) {
          console.error('Error loading pending deliveries:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPendingDeliveries();
  }, [user?.user_id, fetchPendingOrders]);

  const handleMarkDelivered = async (orderId) => {
    const result = await markDeliveryCompleted(orderId, 'Delivery completed by agent');
    if (!result.success) {
      alert(`Error: ${result.error}`);
    } else {
      alert('Delivery marked as completed! Waiting for customer confirmation.');
      // Refresh the pending deliveries list
      const updatedOrders = await fetchPendingOrders();
      setPendingDeliveries(updatedOrders || []);
    }
  };

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

  const getPriorityBadge = (delivery) => {
    const assignedDate = new Date(delivery.assigned_at);
    const now = new Date();
    const hoursDiff = (now - assignedDate) / (1000 * 60 * 60);
    
    if (hoursDiff > 48) {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Urgent</span>;
    } else if (hoursDiff > 24) {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">High Priority</span>;
    } else {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Normal</span>;
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Processing': 'bg-orange-100 text-orange-800',
      'Shipped': 'bg-blue-100 text-blue-800',
      'Out for Delivery': 'bg-purple-100 text-purple-800'
    };
    
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
    return <span className={`${colorClass} px-2 py-1 rounded-full text-xs font-medium`}>{status}</span>;
  };

  const canMarkDelivered = (delivery) => {
    return delivery.order_status !== 'Delivered' && !delivery.agent_confirmed;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#224229]"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
          Pending Deliveries ({pendingDeliveries.length})
        </h1>
        <button
          onClick={async () => {
            setIsLoading(true);
            const orders = await fetchPendingOrders();
            setPendingDeliveries(orders || []);
            setIsLoading(false);
          }}
          className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors text-sm"
        >
          Refresh
        </button>
      </div>
      
      {error.orders && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Error: {error.orders}
        </div>
      )}
      
      {pendingDeliveries.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-lg text-gray-600">No pending deliveries</p>
          <p className="text-sm text-gray-500">All your assigned deliveries are completed</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingDeliveries.map(delivery => (
            <div key={delivery.order_id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Order Header */}
              <div className="bg-orange-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b gap-2">
                <div>
                  <h3 className="font-medium text-lg">Order #{delivery.order_number}</h3>
                  <p className="text-sm text-gray-500">
                    {delivery.order_date ? new Date(delivery.order_date).toLocaleDateString() : 'N/A'}
                  </p>
                  <div className="mt-1 flex gap-2">
                    {getStatusBadge(delivery.order_status)}
                    {getPriorityBadge(delivery)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg">${(delivery.total_amount || 0).toFixed(2)}</span>
                  <p className="text-sm text-gray-500">Your fee: ${(delivery.delivery_fee || 0).toFixed(2)}</p>
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
                      <div><strong>Name:</strong> {delivery.customer_name || 'N/A'}</div>
                      <div><strong>Email:</strong> 
                        <a href={`mailto:${delivery.customer_email}`} className="text-blue-600 hover:underline ml-1 break-all">
                          {delivery.customer_email || 'N/A'}
                        </a>
                      </div>
                      <div><strong>Phone:</strong> 
                        <a href={`tel:${delivery.customer_phone}`} className="text-blue-600 hover:underline ml-1">
                          {delivery.customer_phone || 'N/A'}
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delivery Information */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center text-green-700">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Delivery Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Address:</strong> {delivery.delivery_address || 'No address provided'}</div>
                      <div><strong>Method:</strong> {delivery.delivery_method || 'Standard'}</div>
                      <div><strong>Est. Time:</strong> {delivery.delivery_time || 'N/A'} days</div>
                      <div><strong>Assigned:</strong> {formatDate(delivery.assigned_at)}</div>
                      {delivery.estimated_delivery_date && (
                        <div><strong>Est. Delivery:</strong> {formatDate(delivery.estimated_delivery_date)}</div>
                      )}
                      {delivery.delivery_method_description && (
                        <div><strong>Notes:</strong> {delivery.delivery_method_description}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Order Summary */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center text-orange-700">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Order Items ({delivery.total_items_count || 0})
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded text-xs max-h-20 overflow-y-auto">
                        {delivery.order_items || 'No items listed'}
                      </div>
                      <div><strong>Total Amount:</strong> ${(delivery.total_amount || 0).toFixed(2)}</div>
                      <div><strong>Your Earnings:</strong> 
                        <span className="text-green-600 font-medium ml-1">${(delivery.delivery_fee || 0).toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-2 p-2 bg-blue-50 rounded">
                        <strong>Action Required:</strong> {delivery.action_required || 'Ready for delivery'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Delivery Notes */}
                {delivery.delivery_notes && (
                  <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <strong className="text-yellow-800">Delivery Notes:</strong>
                        <p className="text-yellow-700 text-sm mt-1">{delivery.delivery_notes}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Action Button */}
                <div className="mt-6 pt-4 border-t flex justify-end">
                  {canMarkDelivered(delivery) ? (
                    <button
                      onClick={() => handleMarkDelivered(delivery.order_id)}
                      disabled={loading.markDelivery}
                      className="bg-[#224229] text-white px-6 py-2 rounded-lg hover:bg-[#4b6250] disabled:bg-gray-400 transition-colors font-medium"
                    >
                      {loading.markDelivery ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        'Mark as Delivered'
                      )}
                    </button>
                  ) : (
                    <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {delivery.agent_confirmed ? 'Agent Confirmed' : 'Completed'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pending;