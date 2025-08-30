// src/pages/delivery/Assigned.jsx
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Assigned = () => {
  const { dashboardData, onStatusChange, loading } = useOutletContext();
  
  // Handle undefined data
  const assignedDeliveries = dashboardData?.all_assignments || [];

  const handleMarkDelivered = async (orderId) => {
    const result = await onStatusChange(orderId, 'Delivered successfully');
    if (!result.success) {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>
        All Assigned Deliveries ({assignedDeliveries.length})
      </h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {assignedDeliveries.length > 0 ? (
          assignedDeliveries.map(delivery => (
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
                <div className="pt-2">
                  <button
                    onClick={() => handleMarkDelivered(delivery.order_id)}
                    disabled={loading}
                    className="w-full bg-[#224229] text-white px-3 py-2 rounded hover:bg-[#4b6250] disabled:bg-gray-400 transition-colors text-sm"
                  >
                    {loading ? 'Processing...' : 'Mark Delivered'}
                  </button>
                </div>
              </div>
              
              {/* Desktop view */}
              <div className="hidden md:grid col-span-2 font-medium items-center">#{delivery.order_number}</div>
              <div className="hidden md:grid col-span-2 items-center">{delivery.customer_name}</div>
              <div className="hidden md:grid col-span-2 items-center text-sm">{delivery.customer_phone}</div>
              <div className="hidden md:grid col-span-3 items-center text-sm">{delivery.delivery_address}</div>
              <div className="hidden md:grid col-span-1 items-center">${delivery.total_amount?.toFixed(2) || '0.00'}</div>
              <div className="hidden md:grid col-span-2 items-center">
                <button
                  onClick={() => handleMarkDelivered(delivery.order_id)}
                  disabled={loading}
                  className="bg-[#224229] text-white px-3 py-1 rounded hover:bg-[#4b6250] disabled:bg-gray-400 transition-colors text-sm"
                >
                  {loading ? 'Processing...' : 'Mark Delivered'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No assigned deliveries at the moment
          </div>
        )}
      </div>
    </div>
  );
};

export default Assigned;