// src/pages/seller/Sales.jsx
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme.js';

const Sales = () => {
  const { sales } = useOutletContext();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Sales Records</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-100 p-3 font-medium">
          <div className="col-span-3">Date</div>
          <div className="col-span-4">Plant</div>
          <div className="col-span-2">Qty</div>
          <div className="col-span-3">Amount</div>
        </div>
        
        {sales.map(sale => (
          <div key={sale.id} className="grid grid-cols-12 p-3 border-b">
            <div className="col-span-3">{sale.date}</div>
            <div className="col-span-4 font-medium">{sale.plantName}</div>
            <div className="col-span-2">{sale.quantity}</div>
            <div className="col-span-3">${sale.price.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sales;