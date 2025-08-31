import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PlantCard from '../components/PlantCard';
import Button from '../components/Button';
import { theme } from '../theme';
import { usePlantsByCategory, useAllCategories } from '../hooks/usePlantCollection';
import LoadingSpinner from '../components/LoadingSpinner';

// Default fallback images
import petFriendlyImg from '../assets/margent.jpeg';
import airPurifyingImg from '../assets/snake.jpeg';
import beginnerFriendlyImg from '../assets/Blosom.jpeg';

const PlantCollection = () => {
  const { category } = useParams();
  const { plants: apiPlants, loading: plantsLoading, error: plantsError } = usePlantsByCategory(category);
  const { categories: apiCategories, loading: categoriesLoading, error: categoriesError } = useAllCategories();

  // Transform API categories data to match frontend structure
  const filters = [
    { id: '', name: 'All Plants' }, // Empty string for all plants
    ...apiCategories.map(cat => ({
      id: cat.slug || cat.category_slug,
      name: cat.name || cat.category_name
    }))
  ];

  // Transform API plants data to match frontend structure
  const transformedPlants = apiPlants.map(plant => ({
    id: plant.plant_id,
    name: plant.name || plant.plant_name,
    price: plant.price,
    ratingStars: generateRatingStars(plant.average_rating),
    reviewCount: plant.review_count || 0,
    image: plant.primary_image || plant.image_url || plant.image || getFallbackImage(),
    categories: plant.categories || [category || '']
  }));

  // Helper function to generate star rating
  function generateRatingStars(rating) {
    const fullStars = Math.floor(rating || 4);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
  }

  // Helper function to get fallback image based on category
  function getFallbackImage() {
    if (category === 'pet-friendly') return petFriendlyImg;
    if (category === 'air-purifying') return airPurifyingImg;
    if (category === 'beginner-friendly') return beginnerFriendlyImg;
    return airPurifyingImg; // default fallback
  }

  const getCategoryName = (slug) => {
    if (!slug) return 'All Plants';
    const filter = filters.find(f => f.id === slug);
    return filter ? filter.name : 'All Plants';
  };

  if (plantsLoading || categoriesLoading) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (plantsError || categoriesError) {
    return (
      <div className="bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl text-red-600 mb-4">Error Loading Data</h2>
          <p>Please try refreshing the page.</p>
          <Button
            to="/plants"
            type="primary"
            className="mt-4"
          >
            Back to All Plants
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Header />
      
      <section className="py-8 sm:py-12 md:py-16" style={{ backgroundColor: theme.colors.background.light }}>
        <div className="container mx-auto px-4 sm:px-5">
          <h2 className="text-2xl sm:text-3xl text-center mb-6 sm:mb-8 md:mb-10" style={{ color: theme.colors.primary }}>
            {getCategoryName(category)}
          </h2>
          
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 md:mb-10">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                to={`/plants/${filter.id}`}
                type={(!category && filter.id === '') || category === filter.id ? 'primary' : 'secondary'}
                className="px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm"
              >
                {filter.name}
              </Button>
            ))}
          </div>
          
          {transformedPlants.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {transformedPlants.map(plant => (
                  <PlantCard key={plant.id} plant={plant} />
                ))}
              </div>
              
              <div className="text-center mt-6 sm:mt-8 md:mt-10">
                <Button
                  to="/plants"
                  type="primary"
                  className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                >
                  Explore All Plants
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 sm:py-10">
              <p className="text-base sm:text-lg">No plants found in this category.</p>
              <Button
                to="/plants"
                type="primary"
                className="mt-3 sm:mt-4 text-sm sm:text-base"
              >
                View All Plants
              </Button>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default PlantCollection;