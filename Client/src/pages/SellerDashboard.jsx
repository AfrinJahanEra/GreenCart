// src/pages/seller/SellerDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useSellerDashboard } from '../hooks/useSellerDashboard';

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use the custom hook
  const { dashboardData, loading, refreshAllData } = useSellerDashboard(user?.user_id);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/seller/${tab}`);
    setMobileMenuOpen(false);
  };

  // Calculate total earnings from sales records
  const totalEarnings = dashboardData.salesRecords?.reduce((total, sale) => {
    return total + (sale.seller_earnings || sale.total_amount * 0.9);
  }, 0) || 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f0e1]">
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:relative inset-0 z-40 w-64 bg-[#224229] text-white p-4`}>
          <div className="flex items-center gap-3 mb-8 p-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#224229] font-bold">
              {user?.first_name?.[0] || 'S'}
            </div>
            <div>
              <p className="font-medium">Seller Dashboard</p>
              <p className="text-xs text-green-200">{user?.email}</p>
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
            </ul>
          </nav>
          
          <div className="mt-8 pt-4 border-t border-green-700">
            <button
              onClick={refreshAllData}
              className="w-full text-left px-4 py-2 text-sm hover:bg-green-800 rounded-lg transition-colors mb-2"
            >
              Refresh Data
            </button>
            <Link 
              to="/" 
              className="block px-4 py-2 text-sm hover:bg-green-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Back to Store
            </Link>
          </div>

          {/* Close button for mobile */}
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
          <Outlet context={{ 
            dashboardData, 
            loading, 
            refreshAllData,
            totalEarnings 
          }} />
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

export default SellerDashboard;