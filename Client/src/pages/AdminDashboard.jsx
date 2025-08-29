import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const {
    dashboardStats,
    customers,
    deliveryAgents,
    salesReps,
    orders,
    loading,
    error,
    lowStockAlerts,
    assignDeliveryAgent,
    applyDiscount,
  } = useAdminDashboard();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
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
              A
            </div>
            <div>
              <p className="font-medium">Admin Dashboard</p>
              <p className="text-xs text-green-200">Administrator</p>
            </div>
          </div>
          <nav>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleTabChange('dashboard')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                >
                  Dashboard Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('customers')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'customers' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                >
                  Customer Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('delivery')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'delivery' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                >
                  Delivery Personnel
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('sales')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'sales' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                >
                  Sales Team
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('orders')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                >
                  Order Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('reports')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'reports' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                >
                  Discount Assignment
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
          <Outlet context={{
            dashboardStats,
            customers,
            deliveryAgents,
            salesReps,
            orders,
            lowStockAlerts,
            loading,
            error,
            assignDeliveryAgent,
            applyDiscount,
          }} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;