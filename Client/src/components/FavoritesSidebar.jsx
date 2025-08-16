import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme';
import Button from './Button';

const FavoritesSidebar = ({ showFavorites, setShowFavorites }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef();
  const [isClosing, setIsClosing] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState([
    {
      id: 1,
      name: 'Monstera Deliciosa',
      price: 45,
      image: 'https://images.unsplash.com/photo-1525947088131-b701cd0f6dc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      size: 'Medium',
    },
    {
      id: 2,
      name: 'Snake Plant',
      price: 35,
      image: 'https://images.unsplash.com/photo-1586220742613-b731f66f7743?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      size: 'Large',
    }
  ]);

  useEffect(() => {
    if (showFavorites) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showFavorites]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowFavorites(false);
      setIsClosing(false);
    }, 300);
  };

  const removeItem = (id) => {
    setFavoriteItems(favoriteItems.filter(item => item.id !== id));
  };

  if (!showFavorites) return null;

  return (
    <>
      <div className={`fixed top-0 right-0 w-full max-w-md h-full z-50 overflow-y-auto transform transition-transform duration-300 ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
        style={{
          boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
          backgroundColor: theme.colors.sidebarBg,
          backdropFilter: 'blur(10px)'
        }}
      ></div>
      
      <div 
        className={`fixed top-0 right-0 w-full max-w-md h-full bg-white z-50 overflow-y-auto transform transition-transform duration-300 ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
        style={{ boxShadow: '-5px 0 15px rgba(0,0,0,0.1)' }}
      >
        <div className="p-4 sm:p-6" ref={sidebarRef}>
          <div className="flex justify-between items-center mb-4 sm:mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.primary }}>Your Favorites</h2>
            <button 
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {favoriteItems.length === 0 ? (
            <div className="text-center py-8 sm:py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 sm:h-16 w-14 sm:w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-lg font-medium text-gray-700">Your favorites is empty</p>
              <p className="mt-2 text-gray-500">Start browsing to add plants to your favorites</p>
              <Button
                onClick={handleClose}
                type="secondary"
                className="mt-4"
              >
                Continue Browsing
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {favoriteItems.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg relative transition-all bg-gray-50"
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm sm:text-base text-gray-900">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Size: {item.size}</p>
                    <p className="font-medium text-sm sm:text-base" style={{ color: theme.colors.primary }}>${item.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      to={`/plant/${item.id}`}
                      type="secondary"
                      className="text-xs sm:text-sm"
                    >
                      View
                    </Button>
                    <button 
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      onClick={() => removeItem(item.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FavoritesSidebar;