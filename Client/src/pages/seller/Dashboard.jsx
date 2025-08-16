// src/pages/seller/Dashboard.jsx
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme.js';

const Dashboard = () => {
  const { plants, sales, totalEarnings } = useOutletContext();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Seller Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Plants</h3>
          <p className="text-2xl font-bold">{plants.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Sales</h3>
          <p className="text-2xl font-bold">{sales.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Earnings</h3>
          <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4" style={{ color: theme.colors.primary }}>Recent Sales</h2>
          <div className="space-y-3">
            {sales.slice(0, 5).map(sale => (
              <div key={sale.id} className="border-b pb-2 last:border-b-0">
                <div className="flex justify-between">
                  <span className="font-medium">{sale.plantName}</span>
                  <span>${sale.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{sale.date}</span>
                  <span>Qty: {sale.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4" style={{ color: theme.colors.primary }}>Low Stock Plants</h2>
          <div className="space-y-3">
            {plants
              .filter(plant => plant.stock < 5)
              .slice(0, 5)
              .map(plant => (
                <div key={plant.id} className="border-b pb-2 last:border-b-0">
                  <div className="flex justify-between">
                    <span className="font-medium">{plant.name}</span>
                    <span className={plant.stock < 3 ? 'text-red-500' : 'text-yellow-500'}>
                      {plant.stock} left
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    ${plant.price.toFixed(2)}
                  </div>
                </div>
              ))}
            {plants.filter(plant => plant.stock < 5).length === 0 && (
              <p className="text-gray-500">All plants have sufficient stock</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;