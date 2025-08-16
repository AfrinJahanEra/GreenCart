// src/pages/seller/Plants.jsx
import { useOutletContext } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';

const Plants = () => {
  const { plants } = useOutletContext();
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>My Plants</h1>
        <Link 
          to="/seller/add-plant" 
          className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors"
        >
          Add New Plant
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-100 p-3 font-medium">
          <div className="col-span-2">Image</div>
          <div className="col-span-4">Name</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Stock</div>
          <div className="col-span-2">Actions</div>
        </div>
        
        {plants.map(plant => (
          <div key={plant.id} className="grid grid-cols-12 p-3 border-b items-center">
            <div className="col-span-2">
              <img src={plant.image} alt={plant.name} className="w-12 h-12 object-cover rounded" />
            </div>
            <div className="col-span-4 font-medium">{plant.name}</div>
            <div className="col-span-2">${plant.price.toFixed(2)}</div>
            <div className="col-span-2">
              <span className={plant.stock < 3 ? 'text-red-500' : ''}>
                {plant.stock}
              </span>
            </div>
            <div className="col-span-2 flex gap-2">
              <button className="text-blue-500 hover:text-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button className="text-red-500 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plants;