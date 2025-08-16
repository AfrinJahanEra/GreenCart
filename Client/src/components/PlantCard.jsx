import { Link } from 'react-router-dom';
import { theme } from '../theme';
import Button from './Button';
import { useState } from 'react';

const PlantCard = ({ plant }) => {

  
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would also update your global favorites state
  };
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <button 
        onClick={toggleFavorite}
        className="absolute top-2 right-2 z-10 p-1 bg-white bg-opacity-80 rounded-full"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
          viewBox="0 0 20 20" 
          fill="none" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      <Link to={`/plant/${plant.id}`} className="block overflow-hidden">
        <img 
          src={plant.image} 
          alt={plant.name} 
          className="w-full h-48 sm:h-56 md:h-64 object-cover transform hover:scale-105 transition-transform duration-500"
        />
      </Link>
      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start">
          <Link to={`/plant/${plant.id}`} className="font-medium text-sm sm:text-base" style={{ color: theme.colors.primary }}>
            {plant.name}
          </Link>
          <span className="font-bold text-sm sm:text-base" style={{ color: theme.colors.primary }}>${plant.price}</span>
        </div>
        <div className="flex items-center gap-1 mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
          <div className="text-yellow-500">{plant.ratingStars}</div>
          <div>({plant.reviewCount})</div>
        </div>
        <div className="mt-3 sm:mt-4">
          <Button 
            to={`/plant/${plant.id}`}
            type="primary"
            className="w-full text-sm sm:text-base"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;