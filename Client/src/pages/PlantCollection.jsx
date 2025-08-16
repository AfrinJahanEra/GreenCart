// src/pages/PlantCollection.jsx
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PlantCard from '../components/PlantCard';
import Button from '../components/Button';
import { theme } from '../theme';
import petFriendlyImg from '../assets/margent.jpeg';
import airPurifyingImg from '../assets/snake.jpeg';
import beginnerFriendlyImg from '../assets/Blosom.jpeg';

const PlantCollection = () => {
  const { category } = useParams();
  
  const allPlants = [
    {
      id: 1,
      name: 'Monstera Deliciosa',
      price: 45,
      ratingStars: '★★★★★',
      reviewCount: 520,
      image: 'https://images.unsplash.com/photo-1525947088131-b701cd0f6dc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      categories: ['low-light', 'air-purifying']
    },
    {
      id: 2,
      name: 'Snake Plant',
      price: 35,
      ratingStars: '★★★★☆',
      reviewCount: 428,
      image: 'https://images.unsplash.com/photo-1586220742613-b731f66f7743?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      categories: ['low-light', 'pet-friendly', 'beginner-friendly']
    },
    {
      id: 3,
      name: 'Fiddle Leaf Fig',
      price: 55,
      ratingStars: '★★★★★',
      reviewCount: 312,
      image: 'https://images.unsplash.com/photo-1534710961216-75c88202f43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      categories: ['air-purifying']
    },
    {
      id: 4,
      name: 'Peace Lily',
      price: 25,
      ratingStars: '★★★★★',
      reviewCount: 210,
      image: petFriendlyImg,
      categories: ['pet-friendly', 'air-purifying', 'beginner-friendly']
    },
    {
      id: 5,
      name: 'ZZ Plant',
      price: 30,
      ratingStars: '★★★★☆',
      reviewCount: 180,
      image: beginnerFriendlyImg,
      categories: ['low-light', 'beginner-friendly']
    },
    {
      id: 6,
      name: 'Spider Plant',
      price: 20,
      ratingStars: '★★★★★',
      reviewCount: 350,
      image: airPurifyingImg,
      categories: ['pet-friendly', 'air-purifying']
    }
  ];

  const filters = [
    { id: 'all', name: 'All Plants' },
    { id: 'pet-friendly', name: 'Pet Friendly' },
    { id: 'low-light', name: 'Low Light' },
    { id: 'air-purifying', name: 'Air Purifying' },
    { id: 'beginner-friendly', name: 'Beginner Friendly' }
  ];

  const getCategoryName = (slug) => {
    const filter = filters.find(f => f.id === slug);
    return filter ? filter.name : 'All Plants';
  };

  const filteredPlants = category 
    ? allPlants.filter(plant => plant.categories.includes(category))
    : allPlants;

  return (
    <div className="bg-white">
      <Header />
      
      <section className="py-16" style={{ backgroundColor: theme.colors.background.light }}>
        <div className="container mx-auto px-5">
          <h2 className="text-3xl text-center mb-10" style={{ color: theme.colors.primary }}>
            {category ? getCategoryName(category) : 'Our Plant Collection'}
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                to={`/plants/${filter.id === 'all' ? '' : filter.id}`}
                type={(!category && filter.id === 'all') || category === filter.id ? 'primary' : 'secondary'}
                className="px-4 py-2 rounded-full"
              >
                {filter.name}
              </Button>
            ))}
          </div>
          
          {filteredPlants.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredPlants.map(plant => (
                  <PlantCard key={plant.id} plant={plant} />
                ))}
              </div>
              
              <div className="text-center mt-10">
                <Button
                  to="/plants"
                  type="primary"
                  className="px-6 py-3"
                >
                  Explore All Plants
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-lg">No plants found in this category.</p>
              <Button
                to="/plants"
                type="primary"
                className="mt-4"
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