import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CartSidebar from './CartSidebar';
import ProfileSidebar from './ProfileSidebar';
import SearchBar from './SearchBar';
import { theme } from '../theme';

const Header = () => {
  const { user, loading, logout, cartItemsCount, pendingOrdersCount } = useAuth(); // Get pendingOrdersCount from AuthContext
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  // Define dashboard link based on role
  const getDashboardLink = () => {
    if (!user || !user.role) return '/';
    
    switch (user.role.toLowerCase()) {
      case 'seller':
        return '/seller/dashboard';
      case 'delivery_agent':
        return '/delivery/assigned';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  // Get role display name
  const getRoleDisplayName = () => {
    if (!user || !user.role) return '';
    
    switch (user.role.toLowerCase()) {
      case 'seller':
        return 'Seller';
      case 'delivery_agent':
        return 'Delivery Agent';
      case 'admin':
        return 'Admin';
      default:
        return 'Customer';
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.primary }}>
              GreenCart
            </Link>

            {loading ? (
              <div>Loading...</div>
            ) : user ? (
              // Header content based on role
              user.role === 'customer' ? (
                <>
                  {/* Customer Header: Full functionality */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => setShowProfile(true)}
                      className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Profile"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowCart(true)}
                      className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                      aria-label="Shopping cart"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      {cartItemsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                          {cartItemsCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => navigate('/orders')}
                      className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                      aria-label="Orders"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      {pendingOrdersCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                          {pendingOrdersCount}
                        </span>
                      )}
                    </button>
                    {/* Logout Button for Customer */}
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Logout"
                      title="Logout"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Non-Customer Header: Dashboard Link and Logout */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Welcome, {user.first_name} ({getRoleDisplayName()})
                    </span>
                    <Link
                      to={getDashboardLink()}
                      className="text-sm sm:text-base font-medium hover:text-green-600 px-3 py-1 rounded border"
                      style={{ color: theme.colors.accent, borderColor: theme.colors.accent }}
                    >
                      Go to Dashboard
                    </Link>
                    {/* Logout Button for Non-Customer */}
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="text-sm sm:text-base font-medium hover:text-green-600 px-3 py-1 rounded border"
                      style={{ color: theme.colors.accent, borderColor: theme.colors.accent }}
                    >
                      Logout
                    </button>
                  </div>
                </>
              )
            ) : (
              <>
                {/* Non-Logged-In Header: Login/Signup Links */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    to="/login"
                    className="text-sm sm:text-base font-medium hover:text-green-600"
                    style={{ color: theme.colors.accent }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm sm:text-base font-medium hover:text-green-600"
                    style={{ color: theme.colors.accent }}
                  >
                    Signup
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Search Bar - Only for customers or non-logged-in users */}
          {(!user || user.role === 'customer') && (
            <div className="mt-3 md:mt-0 md:max-w-xl md:mx-auto">
              <SearchBar />
            </div>
          )}
        </div>
      </header>

      {/* Sidebars - Only for customers */}
      {user && user.role === 'customer' && (
        <>
          <CartSidebar showCart={showCart} setShowCart={setShowCart} />
          <ProfileSidebar 
            isOpen={showProfile} 
            onClose={() => setShowProfile(false)} 
          />
        </>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;