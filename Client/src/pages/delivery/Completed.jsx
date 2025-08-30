// src/pages/delivery/Completed.jsx
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Completed = () => {
  const { dashboardData } = useOutletContext();
  
  // Handle undefined data
  const completedDeliveries = dashboardData?.completed_assignments || [];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfirmationStatus = (delivery) => {
    if (delivery.customer_confirmed && delivery.agent_confirmed) {
      return {
        text: 'Fully Confirmed',
        className: 'bg-green-100 text-green-800',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      };
    } else if (delivery.agent_confirmed && !delivery.customer_confirmed) {
      return {
        text: 'Awaiting Customer',
        className: 'bg-yellow-100 text-yellow-800',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      };
    } else {
      return {
        text: 'Agent Completed',
        className: 'bg-blue-100 text-blue-800',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
          </svg>
        )
      };
    }
  };

  // Calculate total earnings from completed deliveries
  const totalEarnings = completedDeliveries.reduce((sum, delivery) => {
    return sum + (delivery.delivery_fee || 0);
  }, 0);

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
          Completed Deliveries ({completedDeliveries.length})
        </h1>
        
        {completedDeliveries.length > 0 && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            <div className="text-sm">Total Earnings</div>
            <div className="text-xl font-bold">${totalEarnings.toFixed(2)}</div>
          </div>
        )}
      </div>
      
      {completedDeliveries.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-lg text-gray-600">No completed deliveries yet</p>
          <p className="text-sm text-gray-500">Completed deliveries will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {completedDeliveries.map(delivery => {
            const confirmationStatus = getConfirmationStatus(delivery);
            
            return (
              <div key={delivery.order_id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Order Header */}
                <div className="bg-green-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b gap-2">
                  <div>
                    <h3 className="font-medium text-lg">Order #{delivery.order_number}</h3>
                    <p className="text-sm text-gray-500">
                      Ordered: {delivery.order_date ? new Date(delivery.order_date).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Delivered: {formatDate(delivery.actual_delivery_date || delivery.completed_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end mb-1">
                      <span className={`${confirmationStatus.className} px-2 py-1 rounded-full text-xs font-medium inline-flex items-center`}>
                        {confirmationStatus.icon}
                        {confirmationStatus.text}
                      </span>
                    </div>
                    <span className="font-bold text-lg">${(delivery.total_amount || 0).toFixed(2)}</span>
                    <p className="text-sm text-green-600 font-medium">
                      Earned: ${(delivery.delivery_fee || 0).toFixed(2)}
                    </p>
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
                        <div><strong>Completed:</strong> {formatDate(delivery.completed_at)}</div>
                        {delivery.confirmed_date && (
                          <div><strong>Confirmed:</strong> {formatDate(delivery.confirmed_date)}</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Order Summary */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center text-orange-700">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Order & Earnings
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded text-xs max-h-20 overflow-y-auto">
                          <strong>Items ({delivery.total_items_count || 0}):</strong>
                          <div className="mt-1">
                            {delivery.order_items || 'No items listed'}
                          </div>
                        </div>
                        <div><strong>Order Total:</strong> ${(delivery.total_amount || 0).toFixed(2)}</div>
                        <div><strong>Delivery Fee:</strong> 
                          <span className="text-green-600 font-medium ml-1">${(delivery.delivery_fee || 0).toFixed(2)}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className={`text-xs p-2 rounded ${confirmationStatus.className}`}>
                            <strong>Status:</strong> {delivery.completion_status || confirmationStatus.text}
                          </div>
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Completed;