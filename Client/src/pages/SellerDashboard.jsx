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
  
  // Use the enhanced custom hook
  const { 
    dashboardData, 
    loading, 
    error,
    fetchCompleteDashboard,
    refreshAllData,
    refreshPlants,
    refreshStats 
  } = useSellerDashboard(user?.user_id);

  console.log('SellerDashboard - User:', user);
  console.log('SellerDashboard - Dashboard Data:', dashboardData);
  console.log('SellerDashboard - Loading:', loading);
  console.log('SellerDashboard - Error:', error);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/seller/${tab}`);
    setMobileMenuOpen(false);
  };

  // Calculate total earnings from sales records
  const totalEarnings = dashboardData.salesRecords?.reduce((total, sale) => {
    return total + (sale.seller_earnings || sale.total_amount * 0.9);
  }, 0) || dashboardData.stats?.total_earnings || 0;

  // Debug seller information
  const debugSellerInfo = () => {
    return {
      sellerId: user?.user_id,
      sellerName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
      sellerEmail: user?.email,
      totalPlants: dashboardData.stats?.total_plants || 0,
      totalSold: dashboardData.stats?.total_sold || 0,
      totalEarnings: totalEarnings,
      plantsCount: dashboardData.plants?.length || 0,
      salesRecordsCount: dashboardData.salesRecords?.length || 0
    };
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f0e1]">
      <Header />
      
      <div className="flex flex-1">
        {/* Enhanced Sidebar with Seller Info */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:relative inset-0 z-40 w-64 bg-[#224229] text-white p-4`}>
          {/* Seller Profile Section */}
          <div className="bg-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-[#224229] font-bold text-lg">
                {user?.first_name?.[0] || user?.email?.[0] || 'S'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-lg">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user?.first_name || user?.username || 'Seller'
                  }
                </p>
                <p className="text-xs text-green-200 truncate">{user?.email}</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-700 rounded p-2 text-center">
                <div className="font-bold text-lg">{dashboardData.stats?.total_plants || 0}</div>
                <div className="text-green-200">Plants</div>
              </div>
              <div className="bg-green-700 rounded p-2 text-center">
                <div className="font-bold text-lg">${(totalEarnings || 0).toFixed(0)}</div>
                <div className="text-green-200">Earned</div>
              </div>
            </div>
          </div>
          {/* Navigation */}
          <nav className="mb-6">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleTabChange('dashboard')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    activeTab === 'dashboard' ? 'bg-green-700' : 'hover:bg-green-800'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('plants')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    activeTab === 'plants' ? 'bg-green-700' : 'hover:bg-green-800'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 113 0v1m0 0V11m0-5.5a1.5 1.5 0 113 0v3m0 0V11" />
                  </svg>
                  My Plants
                  <span className="ml-auto bg-green-600 text-xs px-2 py-1 rounded-full">
                    {dashboardData.plants?.length || 0}
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('sales')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    activeTab === 'sales' ? 'bg-green-700' : 'hover:bg-green-800'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Sales Records
                  <span className="ml-auto bg-green-600 text-xs px-2 py-1 rounded-full">
                    {dashboardData.salesRecords?.length || 0}
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('add-plant')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    activeTab === 'add-plant' ? 'bg-green-700' : 'hover:bg-green-800'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Plant
                </button>
              </li>
            </ul>
          </nav>
          
          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-green-700">
            <button
              onClick={refreshAllData}
              className="w-full text-left px-4 py-2 text-sm hover:bg-green-800 rounded-lg transition-colors flex items-center gap-2"
              disabled={loading.dashboard}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading.dashboard ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <Link 
              to="/" 
              className="block px-4 py-2 text-sm hover:bg-green-800 rounded-lg transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
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
        <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <Outlet context={{ 
            dashboardData, 
            loading, 
            error,
            refreshAllData,
            refreshPlants,
            refreshStats,
            fetchCompleteDashboard,
            totalEarnings,
            sellerInfo: debugSellerInfo()
          }} />
        </div>

        {/* Enhanced Total earnings footer with debug info */}
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-[#224229] text-white shadow-lg z-30">
          <div className="container mx-auto p-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm opacity-75">Total Earnings:</span>
                <span className="text-xl font-bold ml-2">${totalEarnings.toFixed(2)}</span>
              </div>
              
              {/* Loading indicator */}
              {(loading.dashboard || loading.plants || loading.stats) && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </div>
              )}
              
              {/* Error indicator */}
              {(error.dashboard || error.plants || error.stats) && (
                <div className="text-red-300 text-sm">
                  ⚠ Error loading data
                </div>
              )}
              
              {/* Success indicator */}
              {!loading.dashboard && !loading.plants && !loading.stats && 
               !error.dashboard && !error.plants && !error.stats && (
                <div className="text-green-300 text-sm">
                  ✓ Data loaded
                </div>
              )}
            </div>
            
            {/* Debug info toggle */}
            <div className="text-xs opacity-50 mt-1">
              Seller ID: {user?.user_id} | Plants: {dashboardData.plants?.length || 0} | 
              Sales: {dashboardData.salesRecords?.length || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;