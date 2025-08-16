import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Assigned = () => {
  const { deliveries, onStatusChange } = useOutletContext();
  
  const assignedDeliveries = deliveries.filter(
    delivery => delivery.deliveryStatus === 'Pending'
  );

  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>
        Assigned Deliveries
      </h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header row - hidden on mobile */}
        <div className="hidden md:grid grid-cols-12 bg-gray-100 p-3 font-medium">
          <div className="col-span-2">Order ID</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-2">Phone</div>
          <div className="col-span-3">Address</div>
          <div className="col-span-1">Amount</div>
          <div className="col-span-2">Actions</div>
        </div>
        
        {assignedDeliveries.length > 0 ? (
          assignedDeliveries.map(delivery => (
            <div key={delivery.id} className="grid grid-cols-1 md:grid-cols-12 p-4 border-b gap-4 md:gap-0">
              {/* Mobile view */}
              <div className="md:hidden space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Order ID:</span>
                  <span>#{delivery.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Customer:</span>
                  <span>{delivery.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Phone:</span>
                  <span className="text-sm">{delivery.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Address:</span>
                  <span className="text-sm">{delivery.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span>${delivery.amount}</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => onStatusChange(delivery.id, 'Delivered')}
                    className="w-full bg-[#224229] text-white px-3 py-2 rounded hover:bg-[#4b6250] transition-colors text-sm"
                  >
                    Mark Delivered
                  </button>
                </div>
              </div>
              
              {/* Desktop view */}
              <div className="hidden md:grid col-span-2 font-medium items-center">#{delivery.id}</div>
              <div className="hidden md:grid col-span-2 items-center">{delivery.customerName}</div>
              <div className="hidden md:grid col-span-2 items-center text-sm">{delivery.customerPhone}</div>
              <div className="hidden md:grid col-span-3 items-center text-sm">{delivery.address}</div>
              <div className="hidden md:grid col-span-1 items-center">${delivery.amount}</div>
              <div className="hidden md:grid col-span-2 items-center">
                <button
                  onClick={() => onStatusChange(delivery.id, 'Delivered')}
                  className="bg-[#224229] text-white px-3 py-1 rounded hover:bg-[#4b6250] transition-colors text-sm"
                >
                  Mark Delivered
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