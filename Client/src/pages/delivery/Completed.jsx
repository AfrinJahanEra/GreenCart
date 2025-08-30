// src/pages/delivery/Completed.jsx
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Completed = () => {
  const { dashboardData } = useOutletContext();
  
  // Handle undefined data
  const completedDeliveries = dashboardData?.completed_assignments || [];

  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>
        Completed Deliveries ({completedDeliveries.length})
      </h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {completedDeliveries.length > 0 ? (
          completedDeliveries.map(delivery => (
            <div key={delivery.order_id} className="grid grid-cols-1 md:grid-cols-12 p-4 border-b gap-4 md:gap-0">
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
                  <span className="font-medium">Phone:</span>
                  <span className="text-sm">{delivery.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Address:</span>
                  <span className="text-sm">{delivery.delivery_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span>${delivery.total_amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Delivered:</span>
                  <span className="text-sm">
                    {delivery.actual_delivery_date ? 
                      new Date(delivery.actual_delivery_date).toLocaleDateString() : 
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Confirmed:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    delivery.customer_confirmed && delivery.agent_confirmed ?
                    'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {delivery.customer_confirmed && delivery.agent_confirmed ? 
                      'Both Confirmed' : 'Pending Confirmation'}
                  </span>
                </div>
              </div>
              
              {/* Desktop view */}
              <div className="hidden md:grid col-span-2 font-medium items-center">#{delivery.order_number}</div>
              <div className="hidden md:grid col-span-2 items-center">{delivery.customer_name}</div>
              <div className="hidden md:grid col-span-2 items-center text-sm">{delivery.customer_phone}</div>
              <div className="hidden md:grid col-span-2 items-center text-sm">{delivery.delivery_address}</div>
              <div className="hidden md:grid col-span-1 items-center">${delivery.total_amount?.toFixed(2) || '0.00'}</div>
              <div className="hidden md:grid col-span-2 items-center text-sm">
                {delivery.actual_delivery_date ? 
                  new Date(delivery.actual_delivery_date).toLocaleDateString() : 
                  'N/A'}
              </div>
              <div className="hidden md:grid col-span-1 items-center">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  delivery.customer_confirmed && delivery.agent_confirmed ?
                  'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {delivery.customer_confirmed && delivery.agent_confirmed ? 
                    '✓' : 'Pending'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No completed deliveries yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Completed;