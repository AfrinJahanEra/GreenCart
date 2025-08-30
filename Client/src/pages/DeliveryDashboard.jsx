// src/pages/DeliveryDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useDeliveryAgent } from '../hooks/useDeliveryAgent';

const DeliveryDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use the delivery agent hook
  const { 
    dashboardData, 
    loading, 
    error, 
    markDeliveryCompleted,
    refreshAllData 
  } = useDeliveryAgent(user?.user_id);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/delivery/${tab}`);
    setMobileMenuOpen(false);
  };

  const handleDeliveryStatusChange = async (orderId, notes = '') => {
    const result = await markDeliveryCompleted(orderId, notes);
    if (result.success) {
      // Refresh data after successful delivery
      await refreshAllData();
    }
    return result;
  };

  // Calculate total earnings from stats
  const totalEarnings = dashboardData.stats?.total_earnings || 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f0e1]">
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:relative inset-0 z-40 w-64 bg-[#224229] text-white p-4`}>
          <div className="flex items-center gap-3 mb-8 p-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#224229] font-bold">
              {user?.first_name?.[0] || 'D'}
            </div>
            <div>
              <p className="font-medium">{user?.first_name || 'Delivery Agent'}</p>
              <p className="text-xs text-green-200">Delivery Agent</p>
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
          
          <div className="mt-8 pt-4 border-t border-green-700">
            <Link 
              to="/" 
              className="block px-4 py-2 text-sm hover:bg-green-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Back to Store
            </Link>
          </div>

          <button 
            className="md:hidden absolute top-4 right-4 text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Mobile sidebar toggle */}
        <div className="md:hidden fixed bottom-16 right-4 z-50">
          <button 
            className="w-12 h-12 bg-[#224229] text-white rounded-full shadow-lg flex items-center justify-center"
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-4 md:p-8 pb-16 md:pb-8">
          {loading.dashboard ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#224229]"></div>
            </div>
          ) : error.dashboard ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>Error: {error.dashboard}</p>
              <button 
                onClick={refreshAllData}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <Outlet context={{ 
              dashboardData, 
              totalEarnings, 
              onStatusChange: handleDeliveryStatusChange,
              loading: loading.markDelivery
            }} />
          )}
        </div>

        {/* Total earnings fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-[#224229] text-white p-3 shadow-lg z-30">
          <div className="container mx-auto flex justify-between items-center">
            <span className="font-medium">Total Earnings:</span>
            <span className="text-xl font-bold">${totalEarnings.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;