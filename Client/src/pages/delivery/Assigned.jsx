// src/pages/delivery/Assigned.jsx
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Assigned = () => {
  const { dashboardData, onStatusChange, loading } = useOutletContext();
  
  // Handle undefined data
  const assignedDeliveries = dashboardData?.all_assignments || [];

  const handleMarkDelivered = async (orderId) => {
    const result = await onStatusChange(orderId, 'Delivered successfully by agent');
    if (!result.success) {
      alert(`Error: ${result.error}`);
    } else {
      alert('Delivery marked as completed! Waiting for customer confirmation.');
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

  const getStatusBadge = (delivery) => {
    const { order_status, agent_confirmed, customer_confirmed } = delivery;
    
    if (order_status === 'Delivered' && agent_confirmed && customer_confirmed) {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Delivered</span>;
    } else if (order_status === 'Out for Delivery' && agent_confirmed && !customer_confirmed) {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Awaiting Customer Confirmation</span>;
    } else if (order_status === 'Shipped') {
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Ready for Delivery</span>;
    } else if (order_status === 'Processing') {
      return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">Processing</span>;
    }
    return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">{order_status}</span>;
  };

  const canMarkDelivered = (delivery) => {
    return delivery.order_status !== 'Delivered' && !delivery.agent_confirmed;
  };

  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>
        All Assigned Deliveries ({assignedDeliveries.length})
      </h1>
      
      {assignedDeliveries.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-4 text-lg text-gray-600">No deliveries assigned yet</p>
          <p className="text-sm text-gray-500">Deliveries will appear here once assigned by admin</p>
        </div>
      ) : (
        <div className="space-y-6">
          {assignedDeliveries.map(delivery => (
            <div key={delivery.order_id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b gap-2">
                <div>
                  <h3 className="font-medium text-lg">Order #{delivery.order_number}</h3>
                  <p className="text-sm text-gray-500">
                    {delivery.order_date ? new Date(delivery.order_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  {getStatusBadge(delivery)}
                  <span className="font-bold text-lg">${(delivery.total_amount || 0).toFixed(2)}</span>
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
                        <a href={`mailto:${delivery.customer_email}`} className="text-blue-600 hover:underline ml-1">
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
                      Delivery Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Address:</strong> {delivery.delivery_address || 'No address provided'}</div>
                      <div><strong>Method:</strong> {delivery.delivery_method || 'Standard'}</div>
                      <div><strong>Est. Time:</strong> {delivery.delivery_time || 'N/A'} days</div>
                      <div><strong>Assigned:</strong> {formatDate(delivery.assigned_at)}</div>
                      {delivery.estimated_delivery_date && (
                        <div><strong>Est. Delivery:</strong> {formatDate(delivery.estimated_delivery_date)}</div>
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
                      <div><strong>Delivery Fee:</strong> 
                        <span className="text-green-600 font-medium ml-1">${(delivery.delivery_fee || 0).toFixed(2)}</span>
                      </div>
                      {delivery.order_status === 'Out for Delivery' && (
                        <div className="text-sm text-orange-600">
                          {delivery.agent_confirmed ? 'Agent confirmed - Waiting for customer' : 'Waiting for agent confirmation'}
                        </div>
                      )}
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
                      disabled={loading}
                      className="bg-[#224229] text-white px-6 py-2 rounded-lg hover:bg-[#4b6250] disabled:bg-gray-400 transition-colors font-medium"
                    >
                      {loading ? (
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

export default Assigned;