// src/pages/delivery/Pending.jsx
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Pending = () => {
  const { dashboardData } = useOutletContext();
  
  // Handle undefined data
  const pendingDeliveries = dashboardData?.pending_assignments || [];

  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>
        Pending Deliveries ({pendingDeliveries.length})
      </h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {pendingDeliveries.length > 0 ? (
          pendingDeliveries.map(delivery => (
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
                  <span className="font-medium">Status:</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    {delivery.order_status}
                  </span>
                </div>
                {delivery.order_items && (
                  <div className="pt-2 border-t">
                    <span className="font-medium">Items:</span>
                    <p className="text-sm text-gray-600">{delivery.order_items}</p>
                  </div>
                )}
              </div>
              
              {/* Desktop view */}
              <div className="hidden md:grid col-span-2 font-medium items-center">#{delivery.order_number}</div>
              <div className="hidden md:grid col-span-2 items-center">{delivery.customer_name}</div>
              <div className="hidden md:grid col-span-2 items-center text-sm">{delivery.customer_phone}</div>
              <div className="hidden md:grid col-span-3 items-center text-sm">{delivery.delivery_address}</div>
              <div className="hidden md:grid col-span-1 items-center">${delivery.total_amount?.toFixed(2) || '0.00'}</div>
              <div className="hidden md:grid col-span-2 items-center">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  {delivery.order_status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No pending deliveries
          </div>
        )}
      </div>
    </div>
  );
};

export default Pending;