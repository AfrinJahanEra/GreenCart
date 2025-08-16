// src/pages/DeliveryDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const DeliveryDashboard = () => {
  const [activeTab, setActiveTab] = useState('assigned');
  const [deliveries, setDeliveries] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const navigate = useNavigate();

  // Sample data - in a real app, this would come from an API
  useEffect(() => {
    // Mock delivery data
    const mockDeliveries = [
      {
        id: 'ORD1023',
        customerName: 'Ridika Naznin',
        customerPhone: '+8801712345678',
        plantName: 'Monstera Deliciosa',
        address: '25 Green Lane, Dhaka',
        paymentStatus: 'Paid',
        deliveryStatus: 'Pending',
        amount: 45,
        date: '2023-06-15'
      },
      {
        id: 'ORD1025',
        customerName: 'Sumaiya Tasnim',
        customerPhone: '+8801812345678',
        plantName: 'Succulent Set',
        address: '88 Rose Avenue, Chattogram',
        paymentStatus: 'Paid',
        deliveryStatus: 'Delivered',
        amount: 35,
        date: '2023-06-14'
      },
      {
        id: 'ORD1027',
        customerName: 'John Smith',
        customerPhone: '+8801912345678',
        plantName: 'Snake Plant',
        address: '12 Garden Road, Sylhet',
        paymentStatus: 'Paid',
        deliveryStatus: 'Pending',
        amount: 55,
        date: '2023-06-12'
      },
      {
        id: 'ORD1028',
        customerName: 'Sarah Johnson',
        customerPhone: '+8801612345678',
        plantName: 'Fiddle Leaf Fig',
        address: '45 Park Street, Khulna',
        paymentStatus: 'Paid',
        deliveryStatus: 'Delivered',
        amount: 65,
        date: '2023-06-10'
      }
    ];

    setDeliveries(mockDeliveries);
    setTotalEarnings(
      mockDeliveries
        .filter(d => d.deliveryStatus === 'Delivered')
        .reduce((total, delivery) => total + delivery.amount, 0)
    );
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/delivery/${tab}`);
  };

  const handleDeliveryStatusChange = (orderId, newStatus) => {
    setDeliveries(deliveries.map(delivery => 
      delivery.id === orderId 
        ? { ...delivery, deliveryStatus: newStatus } 
        : delivery
    ));
    
    if (newStatus === 'Delivered') {
      const deliveredOrder = deliveries.find(d => d.id === orderId);
      if (deliveredOrder) {
        setTotalEarnings(totalEarnings + deliveredOrder.amount);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f0e1]">
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-[#224229] text-white p-4 hidden md:block">
          <div className="flex items-center gap-3 mb-8 p-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#224229] font-bold">
              D
            </div>
            <div>
              <p className="font-medium">Delivery Dashboard</p>
              <p className="text-xs text-green-200">Delivery Agent</p>
            </div>
          </div>
          
          <nav>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleTabChange('assigned')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'assigned' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                >
                  Assigned Deliveries
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('pending')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'pending' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                >
                  Pending Deliveries
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('completed')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'completed' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                >
                  Completed Deliveries
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('earnings')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'earnings' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                >
                  My Earnings
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
            deliveries, 
            totalEarnings, 
            onStatusChange: handleDeliveryStatusChange 
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

export default DeliveryDashboard;