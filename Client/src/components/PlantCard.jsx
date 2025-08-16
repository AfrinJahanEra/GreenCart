import { Link } from 'react-router-dom'

const PlantCard = ({ plant }) => {
  return (
    <div className="bg-white shadow-md overflow-hidden">
      <Link to={`/plant/${plant.id}`}>
        <img 
          src={plant.image} 
          alt={plant.name} 
          className="w-full h-64 object-cover hover:opacity-90 transition-opacity"
        />
      </Link>
      <div className="p-4">
        <div className="flex justify-between items-center">
          <Link to={`/plant/${plant.id}`} className="font-semibold text-[#224229] hover:underline">
            {plant.name}
          </Link>
          <span className="font-bold text-[#224229]">${plant.price}</span>
        </div>
        <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
          <div className="text-yellow-500">{plant.ratingStars}</div>
          <div>({plant.reviewCount})</div>
        </div>
        <Link 
          to={`/plant/${plant.id}`}
          className="block mt-3 mx-auto w-max bg-[#224229] text-[#f7f0e1] px-4 py-2 rounded-full text-sm hover:bg-[#4b6250] transition-colors"
        >
          Shop Now
        </Link>
      </div>
    </div>
  )
}

export default PlantCard