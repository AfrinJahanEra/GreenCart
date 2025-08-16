// src/pages/delivery/Completed.jsx
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Completed = () => {
  const { deliveries } = useOutletContext();
  
  const completedDeliveries = deliveries.filter(
    delivery => delivery.deliveryStatus === 'Delivered'
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>
        Completed Deliveries
      </h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-100 p-3 font-medium">
          <div className="col-span-2">Order ID</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-2">Phone</div>
          <div className="col-span-3">Address</div>
          <div className="col-span-1">Amount</div>
          <div className="col-span-2">Date</div>
        </div>
        
        {completedDeliveries.length > 0 ? (
          completedDeliveries.map(delivery => (
            <div key={delivery.id} className="grid grid-cols-12 p-3 border-b items-center">
              <div className="col-span-2 font-medium">#{delivery.id}</div>
              <div className="col-span-2">{delivery.customerName}</div>
              <div className="col-span-2 text-sm">{delivery.customerPhone}</div>
              <div className="col-span-3 text-sm">{delivery.address}</div>
              <div className="col-span-1">${delivery.amount}</div>
              <div className="col-span-2 text-sm">{delivery.date}</div>
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