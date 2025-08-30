// src/pages/delivery/Assigned.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDeliveryAgent } from '../../hooks/useDeliveryAgent';
import { theme } from '../../theme';

const Assigned = () => {
  const { user } = useAuth();
  const { fetchOrders, updateDeliveryStatus, loading, error } = useDeliveryAgent(user?.user_id);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState({});

  // Fetch assigned orders on component mount
  useEffect(() => {
    const loadAssignedOrders = async () => {
      if (user?.user_id) {
        setIsLoading(true);
        try {
          // Fetch all orders for this agent
          const orders = await fetchOrders();
          console.log('Fetched assigned orders:', orders);
          setAssignedOrders(orders || []);
        } catch (err) {
          console.error('Error loading assigned orders:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadAssignedOrders();
  }, [user?.user_id, fetchOrders]);

  const handleUpdateStatus = async (orderId, status) => {
    setStatusUpdating(prev => ({ ...prev, [orderId]: true }));
    
    try {
      const result = await updateDeliveryStatus(orderId, status, `Status updated to ${status}`);
      
      if (result.success) {
        // Refresh the orders list
        const updatedOrders = await fetchOrders();
        setAssignedOrders(updatedOrders || []);
        alert(result.message || 'Status updated successfully!');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    } finally {
      setStatusUpdating(prev => ({ ...prev, [orderId]: false }));
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

  const getStatusBadge = (status) => {
    const statusColors = {
      'Processing': 'bg-orange-100 text-orange-800',
      'Shipped': 'bg-blue-100 text-blue-800',
      'Out for Delivery': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800'
    };
    
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
    return <span className={`${colorClass} px-2 py-1 rounded-full text-xs font-medium`}>{status}</span>;
  };

  const getActionButton = (order) => {
    const orderId = order.order_id;
    const status = order.order_status;
    const isUpdating = statusUpdating[orderId];

    if (status === 'Processing') {
      return (
        <button
          onClick={() => handleUpdateStatus(orderId, 'PICKED_UP')}
          disabled={isUpdating}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
        >
          {isUpdating ? 'Updating...' : 'Mark Picked Up'}
        </button>
      );
    } else if (status === 'Shipped') {
      return (
        <button
          onClick={() => handleUpdateStatus(orderId, 'OUT_FOR_DELIVERY')}
          disabled={isUpdating}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors text-sm"
        >
          {isUpdating ? 'Updating...' : 'Start Delivery'}
        </button>
      );
    } else if (status === 'Out for Delivery') {
      return (
        <button
          onClick={() => handleUpdateStatus(orderId, 'DELIVERED')}
          disabled={isUpdating}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm"
        >
          {isUpdating ? 'Updating...' : 'Mark Delivered'}
        </button>
      );
    } else {
      return (
        <span className="text-green-600 text-sm font-medium">Completed</span>
      );
    }
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
          All Assigned Deliveries ({assignedOrders.length})
        </h1>
        <button
          onClick={async () => {
            setIsLoading(true);
            const orders = await fetchOrders();
            setAssignedOrders(orders || []);
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
      
      {assignedOrders.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-4 text-lg text-gray-600">No deliveries assigned</p>
          <p className="text-sm text-gray-500">You currently have no assigned deliveries</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignedOrders.map(order => (
            <div key={order.order_id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Order Header */}
              <div className="bg-blue-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b gap-2">
                <div>
                  <h3 className="font-medium text-lg">Order #{order.order_number}</h3>
                  <p className="text-sm text-gray-500">
                    Ordered: {formatDate(order.order_date)}
                  </p>
                  <div className="mt-1">
                    {getStatusBadge(order.order_status)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg">${(order.total_amount || 0).toFixed(2)}</span>
                  <p className="text-sm text-gray-500">Delivery Fee: ${(order.delivery_cost || order.total_amount * 0.05).toFixed(2)}</p>
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
                      <div><strong>Address:</strong> {order.delivery_address || 'No address provided'}</div>
                      <div><strong>Method:</strong> {order.delivery_method || 'Standard'}</div>
                      <div><strong>Est. Time:</strong> {order.estimated_days || 'N/A'}</div>
                      <div><strong>Assigned:</strong> {formatDate(order.assigned_at)}</div>
                      {order.estimated_delivery_date && (
                        <div><strong>Est. Delivery:</strong> {formatDate(order.estimated_delivery_date)}</div>
                      )}
                      {order.tracking_number && (
                        <div><strong>Tracking:</strong> {order.tracking_number}</div>
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
                      <div><strong>Total:</strong> ${(order.total_amount || 0).toFixed(2)}</div>
                      <div><strong>Your Fee:</strong> 
                        <span className="text-green-600 font-medium ml-1">
                          ${(order.delivery_cost || order.total_amount * 0.05).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Delivery Notes */}
                {order.delivery_notes && (
                  <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <strong className="text-yellow-800">Delivery Notes:</strong>
                        <p className="text-yellow-700 text-sm mt-1">{order.delivery_notes}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Action Button */}
                <div className="mt-6 pt-4 border-t flex justify-end">
                  {getActionButton(order)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assigned;