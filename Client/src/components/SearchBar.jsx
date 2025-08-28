import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { plantCollectionAPI } from '../services/api';
import { theme } from '../theme';

const SearchBar = ({ className = '', placeholder = "Search plants..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await plantCollectionAPI.searchPlants(searchQuery);
        const results = response.data.plants.slice(0, 5).map(plant => ({
          id: plant.plant_id,
          name: plant.name || plant.plant_name,
          price: plant.price,
          image: plant.image_url || getFallbackImage(),
          slug: plant.slug || `plant-${plant.plant_id}`
        }));
        
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
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
      setShowResults(false);
    }
  };

  const handleResultClick = (plantId) => {
    navigate(`/plant/${plantId}`);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleInputFocus = () => {
    setShowResults(true);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
  };

  const getFallbackImage = () => {
    // You can add a default plant image in assets and import it
    return 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <input
            type="text"
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-green-600"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {showResults && (searchResults.length > 0 || isLoading) && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-xs text-gray-500 mt-1">Searching...</p>
              </div>
            ) : (
              <>
                {searchResults.map(plant => (
                  <div
                    key={plant.id}
                    className="p-2 sm:p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-2 sm:gap-3"
                    onClick={() => handleResultClick(plant.id)}
                  >
                    <img 
                      src={plant.image} 
                      alt={plant.name} 
                      className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded" 
                      onError={(e) => {
                        e.target.src = getFallbackImage();
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate" style={{ color: theme.colors.primary }}>
                        {plant.name}
                      </p>
                      <p className="text-xs text-gray-500">${plant.price}</p>
                    </div>
                    <div className="text-xs text-gray-400 hidden sm:block">
                      View details
                    </div>
                  </div>
                ))}
                {searchResults.length === 0 && searchQuery && (
                  <div className="p-3 text-center text-gray-500">
                    No plants found for "{searchQuery}"
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;