import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CartSidebar from './CartSidebar';
import ProfileSidebar from './ProfileSidebar';
import SearchBar from './SearchBar';
import { theme } from '../theme';

const Header = () => {
  const { user, loading } = useAuth();
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  // Placeholder for orders count (replace with actual API call later)
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Fetch orders for customer role (mock for now)
    if (user && user.role === 'customer') {
      setOrders([
        { id: 'GC-1001', status: 'Delivered' },
        { id: 'GC-1002', status: 'Shipped' },
      ]);
    }
  }, [user]);

  // Cart items count (mock for now)
  const cartItemsCount = 2;

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
                      <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        {cartItemsCount}
                      </span>
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
                      <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        {orders.length}
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Non-Customer Header: Dashboard Link Only */}
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
          <ProfileSidebar showProfile={showProfile} setShowProfile={setShowProfile} />
        </>
      )}
    </>
  );
};

export default Header;