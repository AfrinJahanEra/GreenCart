// src/pages/SellerDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [plants, setPlants] = useState([]);
  const [sales, setSales] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const navigate = useNavigate();

  // Sample data - in a real app, this would come from an API
  useEffect(() => {
    // Mock plant data
    const mockPlants = [
      {
        id: 1,
        name: 'Monstera Deliciosa',
        price: 45,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1525947088131-b701cd0f6dc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
      },
      {
        id: 2,
        name: 'Snake Plant',
        price: 35,
        stock: 8,
        image: 'https://images.unsplash.com/photo-1586220742613-b731f66f7743?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
      },
      {
        id: 3,
        name: 'Fiddle Leaf Fig',
        price: 55,
        stock: 5,
        image: 'https://images.unsplash.com/photo-1534710961216-75c88202f43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
      }
    ];

    // Mock sales data
    const mockSales = [
      {
        id: 1,
        plantId: 1,
        plantName: 'Monstera Deliciosa',
        quantity: 2,
        price: 90,
        date: '2023-06-15',
        customer: 'john@example.com'
      },
      {
        id: 2,
        plantId: 2,
        plantName: 'Snake Plant',
        quantity: 1,
        price: 35,
        date: '2023-06-14',
        customer: 'sarah@example.com'
      },
      {
        id: 3,
        plantId: 1,
        plantName: 'Monstera Deliciosa',
        quantity: 1,
        price: 45,
        date: '2023-06-12',
        customer: 'mike@example.com'
      }
    ];

    setPlants(mockPlants);
    setSales(mockSales);
    setTotalEarnings(mockSales.reduce((total, sale) => total + sale.price, 0));
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/seller/${tab}`);
  };

  const handleAddPlant = (newPlant) => {
    setPlants([...plants, newPlant]);
  };

  const handleNewSale = (sale) => {
    setSales([sale, ...sales]);
    setTotalEarnings(totalEarnings + sale.price);
    // Update stock
    setPlants(plants.map(plant => 
      plant.id === sale.plantId 
        ? { ...plant, stock: plant.stock - sale.quantity } 
        : plant
    ));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f0e1]">
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-[#224229] text-white p-4 hidden md:block">
          <div className="flex items-center gap-3 mb-8 p-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#224229] font-bold">
              S
            </div>
            <div>
              <p className="font-medium">Seller Dashboard</p>
              <p className="text-xs text-green-200">Sales Representative</p>
            </div>
          </div>
          
          <nav>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleTabChange('dashboard')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('plants')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'plants' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                >
                  My Plants
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('sales')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'sales' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                >
                  Sales Records
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('add-plant')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'add-plant' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                >
                  Add New Plant
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('record-sale')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'record-sale' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                >
                  Record Sale
                </button>
              </li>
            </ul>
          </nav>
          
          {/* Mobile menu button (hidden on desktop) */}
          <div className="mt-8 pt-4 border-t border-green-700">
            <Link 
              to="/" 
              className="block px-4 py-2 text-sm hover:bg-green-800 rounded-lg transition-colors"
            >
              Back to Store
            </Link>
          </div>
        </div>
        
        {/* Mobile sidebar toggle */}
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <button className="w-12 h-12 bg-[#224229] text-white rounded-full shadow-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-4 md:p-8">
          <Outlet context={{ 
            plants, 
            sales, 
            totalEarnings, 
            onAddPlant: handleAddPlant, 
            onNewSale: handleNewSale 
          }} />
          
          {/* Total earnings fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-[#224229] text-white p-3 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
              <span className="font-medium">Total Earnings:</span>
              <span className="text-xl font-bold">${totalEarnings.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;