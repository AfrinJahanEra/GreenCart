// src/pages/orderdashboard/OrderDashboard.jsx
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomerOrders } from '../../hooks/useCustomerOrders';

const OrderDashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { stats, loading } = useCustomerOrders(user?.user_id);

  // Set active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/orders/all')) setActiveTab('all');
    else if (path.includes('/orders/pending')) setActiveTab('pending');
    else if (path.includes('/orders/delivered')) setActiveTab('delivered');
  }, [location]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/orders/${tab}`);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f0e1]">
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:relative inset-0 z-40 w-64 bg-[#224229] text-white p-4`}>
          <div className="flex items-center gap-3 mb-8 p-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#224229] font-bold">
              {user?.first_name?.[0] || 'U'}
            </div>
            <div>
              <p className="font-medium">{user?.first_name || 'User'}</p>
              <p className="text-xs text-green-200">Customer</p>
            </div>
          </div>

          <nav>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleTabChange('all')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'all' ? 'bg-green-700' : 'hover:bg-green-800'
                  }`}
                >
                  All Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('pending')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'pending' ? 'bg-green-700' : 'hover:bg-green-800'
                  }`}
                >
                  Pending Confirmation
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('delivered')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'delivered' ? 'bg-green-700' : 'hover:bg-green-800'
                  }`}
                >
                  Delivered Orders
                </button>
              </li>
            </ul>
          </nav>

          {/* Order Statistics */}
          <div className="mt-6 p-4 bg-green-800 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Order Summary</h3>
            {loading.stats ? (
              <div className="space-y-2">
                <div className="h-4 bg-green-700 rounded animate-pulse"></div>
                <div className="h-4 bg-green-700 rounded animate-pulse"></div>
                <div className="h-4 bg-green-700 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Total Orders:</span>
                  <span className="font-medium">{stats.total_orders}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className="font-medium">{stats.pending_orders}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivered:</span>
                  <span className="font-medium">{stats.delivered_orders}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-700">
                  <span>Total Spent:</span>
                  <span className="font-medium">${stats.total_spent?.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-green-700">
            <Link
              to="/plants"
              className="block px-4 py-2 text-sm hover:bg-green-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Continue Shopping
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
        <div className="md:hidden fixed bottom-4 right-4 z-50">
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
        <div className="flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OrderDashboard;