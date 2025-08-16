// src/pages/delivery/Earnings.jsx
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Earnings = () => {
  const { deliveries, totalEarnings } = useOutletContext();
  
  const completedDeliveries = deliveries.filter(
    delivery => delivery.deliveryStatus === 'Delivered'
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>
        My Earnings
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Deliveries</h3>
          <p className="text-2xl font-bold">{completedDeliveries.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Earnings</h3>
          <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Avg. per Delivery</h3>
          <p className="text-2xl font-bold">
            ${completedDeliveries.length > 0 
              ? (totalEarnings / completedDeliveries.length).toFixed(2) 
              : '0.00'}
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="p-4 border-b font-medium" style={{ color: theme.colors.primary }}>
          Delivery History
        </h2>
        
        {completedDeliveries.length > 0 ? (
          <div className="divide-y">
            {completedDeliveries.map(delivery => (
              <div key={delivery.id} className="grid grid-cols-12 p-4 items-center">
                <div className="col-span-2 font-medium">#{delivery.id}</div>
                <div className="col-span-3">{delivery.customerName}</div>
                <div className="col-span-3 text-sm">{delivery.plantName}</div>
                <div className="col-span-2 text-sm">{delivery.date}</div>
                <div className="col-span-2 text-right font-medium">
                  ${delivery.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No delivery history yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;