import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import CartSidebar from './CartSidebar';
import ProfileSidebar from './ProfileSidebar';
import { theme } from '../theme';

const Header = () => {
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // In your Header component or a parent component
  const [orders, setOrders] = useState([
    // Sample orders data
    {
      id: 'GC-1001',
      status: 'Delivered'
    },
    {
      id: 'GC-1002',
      status: 'Shipped'
    }
  ]);

  const allPlants = [
    { id: 1, name: 'Snake Plant', slug: 'snake-plant', image: 'https://images.unsplash.com/photo-1586220742613-b731f66f7743?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    { id: 2, name: 'Fiddle Leaf Fig', slug: 'fiddle-leaf-fig', image: 'https://images.unsplash.com/photo-1534710961216-75c88202f43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    { id: 3, name: 'Monstera Deliciosa', slug: 'monstera-deliciosa', image: 'https://images.unsplash.com/photo-1525947088131-b701cd0f6dc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    { id: 4, name: 'Spider Plant', slug: 'spider-plant', image: 'https://images.unsplash.com/photo-1598880940080-ff9a29891b80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    { id: 5, name: 'ZZ Plant', slug: 'zz-plant', image: 'https://images.unsplash.com/photo-1598880940080-ff9a29891b80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    { id: 6, name: 'Peace Lily', slug: 'peace-lily', image: 'https://images.unsplash.com/photo-1598880940080-ff9a29891b80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' }
  ];

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = allPlants
      .filter(plant =>
        plant.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);

    setSearchResults(results);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && searchResults.length > 0) {
      navigate(`/plant/${searchResults[0].id}`);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleResultClick = (plantId) => {
    navigate(`/plant/${plantId}`);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/" className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.primary }}>
              GreenCart
            </Link>

            <div className="w-full md:max-w-xl mx-0 md:mx-4 relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search plants..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {showResults && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
                    {searchResults.map(plant => (
                      <div
                        key={plant.id}
                        className="p-2 sm:p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-2 sm:gap-3"
                        onClick={() => handleResultClick(plant.id)}
                      >
                        <img src={plant.image} alt={plant.name} className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded" />
                        <div>
                          <p className="font-medium text-sm sm:text-base" style={{ color: theme.colors.primary }}>{plant.name}</p>
                          <p className="text-xs text-gray-500">View details</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setShowProfile(true)}
                className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {allPlants.length}
                </span>
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {orders.length} {/* You'll need to get this from your state */}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartSidebar showCart={showCart} setShowCart={setShowCart} />
      <ProfileSidebar showProfile={showProfile} setShowProfile={setShowProfile} />
    </>
  );
};

export default Header;