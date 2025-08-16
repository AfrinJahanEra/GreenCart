import { Link } from 'react-router-dom'

const CategoryCard = ({ category }) => {
  return (
    <div className="bg-white shadow-md overflow-hidden">
      <Link to={`/plants/${category.slug}`}>
        <img 
          src={category.image} 
          alt={category.name} 
          className="w-full h-64 object-cover"
        />
      </Link>
      <div className="p-4 text-center">
        <h4 className="text-lg text-[#224229] mb-2">{category.name}</h4>
        <p className="text-sm text-[#224229] italic">{category.description}</p>
        <Link 
          to={`/plants/${category.slug}`}
          className="inline-block mt-4 text-[#224229] underline hover:text-[#4b6250]"
        >
          View Collection
        </Link>
      </div>
    </div>
  )
}

export default CategoryCard