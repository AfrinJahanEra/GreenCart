import { Link } from 'react-router-dom';
import { theme } from '../theme';
import Button from './Button';

const PlantCard = ({ plant }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
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