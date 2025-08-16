import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PlantCard from '../components/PlantCard'

const PlantCollection = () => {
  const { category } = useParams()
  
  // Sample data - in a real app, this would come from an API
  const allPlants = [
    {
      id: 1,
      name: 'Snake Plant',
      price: 65,
      ratingStars: '★★★★★',
      reviewCount: 428,
      image: 'https://images.unsplash.com/photo-1591958911319-0fe5a7f04319?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      categories: ['low-light']
    },
    {
      id: 2,
      name: 'Fiddle Leaf Fig',
      price: 45,
      ratingStars: '★★★★☆',
      reviewCount: 312,
      image: 'https://images.unsplash.com/photo-1591958911319-0fe5a7f04319?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      categories: ['easy-care']
    },
    {
      id: 3,
      name: 'Monstera Deliciosa',
      price: 55,
      ratingStars: '★★★★★',
      reviewCount: 520,
      image: 'https://images.unsplash.com/photo-1591958911319-0fe5a7f04319?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      categories: ['easy-care', 'low-light']
    },
    {
      id: 4,
      name: 'Spider Plant',
      price: 25,
      ratingStars: '★★★★★',
      reviewCount: 210,
      image: 'https://images.unsplash.com/photo-1591958911319-0fe5a7f04319?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      categories: ['pet-friendly', 'easy-care']
    },
    {
      id: 5,
      name: 'ZZ Plant',
      price: 35,
      ratingStars: '★★★★☆',
      reviewCount: 180,
      image: 'https://images.unsplash.com/photo-1591958911319-0fe5a7f04319?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      categories: ['low-light']
    },
    {
      id: 6,
      name: 'Peace Lily',
      price: 40,
      ratingStars: '★★★★★',
      reviewCount: 350,
      image: 'https://images.unsplash.com/photo-1591958911319-0fe5a7f04319?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      categories: ['pet-friendly']
    }
  ]

  const filters = [
    { id: 'all', name: 'All Plants' },
    { id: 'pet-friendly', name: 'Pet Friendly' },
    { id: 'low-light', name: 'Low Light' },
    { id: 'air-purifying', name: 'Air Purifying' },
    { id: 'beginner-friendly', name: 'Beginner Friendly' },
    { id: 'large', name: 'Large Plants' },
    { id: 'small', name: 'Small Plants' }
  ]

  // Get category name for display
  const getCategoryName = (slug) => {
    const filter = filters.find(f => f.id === slug)
    return filter ? filter.name : 'All Plants'
  }

  // Filter plants by category if one is selected
  const filteredPlants = category 
    ? allPlants.filter(plant => plant.categories.includes(category))
    : allPlants

  return (
    <div className="bg-white">
      <Header />
      
      <section className="py-16 bg-[#f7f0e1]">
        <div className="container mx-auto px-5">
          <h2 className="text-3xl text-[#224229] text-center mb-10">
            {category ? getCategoryName(category) : 'Our Plant Collection'}
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {filters.map((filter) => (
              <Link
                key={filter.id}
                to={`/plants/${filter.id === 'all' ? '' : filter.id}`}
                className={`px-4 py-2 rounded-full border ${
                  (category === filter.id) || (!category && filter.id === 'all') 
                    ? 'bg-[#224229] text-white border-[#224229]' 
                    : 'bg-white border-gray-300 hover:bg-gray-100'
                }`}
              >
                {filter.name}
              </Link>
            ))}
          </div>
          
          {filteredPlants.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {filteredPlants.map(plant => (
                  <PlantCard key={plant.id} plant={plant} />
                ))}
              </div>
              
              <div className="text-center mt-10">
                <Link 
                  to="/plants" 
                  className="inline-block bg-[#224229] text-white px-6 py-3 rounded-full hover:bg-[#4b6250]"
                >
                  Explore All Plants
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-lg">No plants found in this category.</p>
              <Link 
                to="/plants" 
                className="inline-block mt-4 bg-[#224229] text-white px-6 py-3 rounded-full hover:bg-[#4b6250]"
              >
                View All Plants
              </Link>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  )
}

export default PlantCollection