import Header from '../components/Header';
import Footer from '../components/Footer';
import PlantCard from '../components/PlantCard';
import Button from '../components/Button';
import Hero from '../components/Hero';
import { theme } from '../theme';
import { Link } from 'react-router-dom';
import lowLightImg from '../assets/ardella.jpeg';
import petFriendlyImg from '../assets/margent.jpeg';
import airPurifyingImg from '../assets/snake.jpeg';
import beginnerFriendlyImg from '../assets/Blosom.jpeg';

const Home = () => {
  const popularPlants = [
    {
      id: 1,
      name: 'Monstera Deliciosa',
      price: 45,
      ratingStars: '★★★★★',
      reviewCount: 520,
      image: airPurifyingImg
    },
    {
      id: 2,
      name: 'Snake Plant',
      price: 35,
      ratingStars: '★★★★☆',
      reviewCount: 428,
      image: lowLightImg
    },
    {
      id: 3,
      name: 'Fiddle Leaf Fig',
      price: 55,
      ratingStars: '★★★★★',
      reviewCount: 312,
      image: petFriendlyImg
    },
    {
      id: 4,
      name: 'Peace Lily',
      price: 25,
      ratingStars: '★★★★★',
      reviewCount: 210,
      image: beginnerFriendlyImg
    }
  ];

  const categories = [
    {
      id: 1,
      name: 'Low Light Plants',
      description: 'Thrives in low light conditions',
      image: lowLightImg,
      slug: 'low-light'
    },
    {
      id: 2,
      name: 'Pet Friendly',
      description: 'Safe for your furry friends',
      image: petFriendlyImg,
      slug: 'pet-friendly'
    },
    {
      id: 3,
      name: 'Air Purifying',
      description: 'Cleans the air naturally',
      image: airPurifyingImg,
      slug: 'air-purifying'
    },
    {
      id: 4,
      name: 'Beginner Friendly',
      description: 'Easy to care for',
      image: beginnerFriendlyImg,
      slug: 'beginner-friendly'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      quote: 'My plants arrived in perfect condition and have been thriving ever since!',
      image: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 2,
      name: 'Michael Chen',
      quote: 'Excellent customer service and beautiful, healthy plants.',
      image: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 3,
      name: 'Priya Patel',
      quote: 'The perfect gift for my plant-loving friend!',
      image: 'https://randomuser.me/api/portraits/women/68.jpg'
    }
  ];

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