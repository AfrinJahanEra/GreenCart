import Header from '../components/Header';
import Footer from '../components/Footer';
import PlantCard from '../components/PlantCard';
import Button from '../components/Button';
import Hero from '../components/Hero';
import { theme } from '../theme';
import { Link } from 'react-router-dom';
import { useTopCategories, useTopPlants, useTopSellers } from '../hooks/useHomeData';
import LoadingSpinner from '../components/LoadingSpinner';

// Default images (fallback if API doesn't provide images)
import lowLightImg from '../assets/ardella.jpeg';
import petFriendlyImg from '../assets/margent.jpeg';
import airPurifyingImg from '../assets/snake.jpeg';
import beginnerFriendlyImg from '../assets/Blosom.jpeg';

const defaultImages = {
  'low-light': lowLightImg,
  'pet-friendly': petFriendlyImg,
  'air-purifying': airPurifyingImg,
  'beginner-friendly': beginnerFriendlyImg
};

const Home = () => {
  const { categories: apiCategories, loading: categoriesLoading, error: categoriesError } = useTopCategories();
  const { plants: apiPlants, loading: plantsLoading, error: plantsError } = useTopPlants();
  const { sellers: apiSellers, loading: sellersLoading, error: sellersError } = useTopSellers();

  // Transform API categories data to match frontend structure
  const categories = apiCategories.map(category => ({
    id: category.category_id,
    name: category.name,
    description: `${category.plant_count} plants available`,
    image: defaultImages[category.slug] || lowLightImg, // Fallback image
    slug: category.slug
  }));

  // Transform API plants data to match frontend structure
  const popularPlants = apiPlants.map(plant => ({
    id: plant.plant_id,
    name: plant.name,
    price: plant.price,
    ratingStars: '★★★★★', // You might need to calculate this from ratings data
    reviewCount: plant.review_count || 0,
    image: plant.image_url || airPurifyingImg // Fallback image
  }));

  // Transform API sellers data to testimonials
  const testimonials = apiSellers.map(seller => ({
    id: seller.seller_id,
    name: seller.seller_name,
    quote: seller.testimonial || `Top-rated seller with ${seller.plant_count} plants`,
    image: seller.image_url || 'https://randomuser.me/api/portraits/lego/1.jpg'
  }));

  if (categoriesLoading || plantsLoading || sellersLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (categoriesError || plantsError || sellersError) {
    return (
      <div className="bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl text-red-600 mb-4">Error Loading Data</h2>
          <p>Please try refreshing the page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Header />
      <Hero />
      
      <section className="py-12 sm:py-16" style={{ backgroundColor: theme.colors.background.light }}>
        <div className="container mx-auto px-4 sm:px-5">
          <h2 className="text-2xl sm:text-3xl text-center mb-8 sm:mb-10" style={{ color: theme.colors.primary }}>
            Find Your Perfect Plant
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {categories.map(category => (
              <div key={category.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                <Link to={`/plants/${category.slug}`}>
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="p-4 text-center">
                  <h3 className="font-medium text-base sm:text-lg" style={{ color: theme.colors.primary }}>
                    {category.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 italic">
                    {category.description}
                  </p>
                  <Button
                    to={`/plants/${category.slug}`}
                    type="text"
                    className="mt-3 sm:mt-4 text-xs sm:text-sm"
                  >
                    View Collection
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-12 sm:py-16" style={{ backgroundColor: theme.colors.background.light }}>
        <div className="container mx-auto px-4 sm:px-5">
          <h2 className="text-2xl sm:text-3xl text-center mb-8 sm:mb-10" style={{ color: theme.colors.primary }}>
            Our Most Popular Plants
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {popularPlants.map(plant => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-12 sm:py-16" style={{ backgroundColor: theme.colors.background.light }}>
        <div className="container mx-auto px-4 sm:px-5">
          <h2 className="text-2xl sm:text-3xl text-center mb-8 sm:mb-10" style={{ color: theme.colors.primary }}>
            What our customers say
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-5 object-cover"
                />
                <h3 className="text-base sm:text-lg font-semibold text-center" style={{ color: theme.colors.primary }}>
                  {testimonial.name}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 text-center italic mt-2">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Home;