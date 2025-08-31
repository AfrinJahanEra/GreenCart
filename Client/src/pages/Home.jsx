import Header from '../components/Header';
import Footer from '../components/Footer';
import PlantCard from '../components/PlantCard';
import Button from '../components/Button';
import Hero from '../components/Hero';
import { theme } from '../theme';
import { Link } from 'react-router-dom';
import { useTopCategories, useTopPlants, useTopSellers } from '../hooks/useHomeData';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const { categories: apiCategories, loading: categoriesLoading, error: categoriesError } = useTopCategories();
  const { plants: apiPlants, loading: plantsLoading, error: plantsError } = useTopPlants();
  const { sellers: apiSellers, loading: sellersLoading, error: sellersError } = useTopSellers();

  // Use 4 dummy URLs for category images as requested
  const dummyCategoryImages = [
    'https://plus.unsplash.com/premium_photo-1681807326608-ff8af57d796a?q=80&w=725&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1589420847301-caf51d62a5d1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDEwfHx8ZW58MHx8fHx8',
    'https://images.unsplash.com/photo-1721908374704-d84eb561c4db?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDI3fHx8ZW58MHx8fHx8',
    'https://plus.unsplash.com/premium_photo-1681807326535-621ae5ef9da3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDQ4fHx8ZW58MHx8fHx8'
  ];

  // Transform API categories data to match frontend structure with dummy images
  const categories = apiCategories.map((category, index) => ({
    id: category.category_id,
    name: category.name,
    description: `${category.plant_count} plants available`,
    image: dummyCategoryImages[index % dummyCategoryImages.length], // Use dummy images in rotation
    slug: category.slug
  }));

  // Transform API plants data to match frontend structure with actual ratings
  const popularPlants = apiPlants.map(plant => {
    // Calculate star rating based on average rating
    const avgRating = plant.avg_rating || 0;
    const fullStars = Math.floor(avgRating);
    const hasHalfStar = avgRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    const ratingStars = '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
    
    return {
      id: plant.plant_id,
      name: plant.name,
      price: plant.base_price || plant.price,
      ratingStars: ratingStars,
      reviewCount: plant.review_count || 0,
      image: plant.primary_image || plant.image_url || plant.image || 'https://via.placeholder.com/300x300.png?text=Plant+Image'
    };
  });

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