import Header from '../components/Header'
import Footer from '../components/Footer'
import CategoryCard from '../components/CategoryCard'
import PlantCard from '../components/PlantCard'
import TestimonialCard from '../components/TestimonialCard'
import { Link } from 'react-router-dom'

const Home = () => {
  // Sample data - in a real app, this would come from an API
  const categories = [
    {
      id: 1,
      name: 'Low Light Plants',
      description: 'Thrives in low light conditions, perfect for offices and darker rooms.',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      slug: 'low-light'
    },
    {
      id: 2,
      name: 'Pet Friendly Plants',
      description: 'Safe for pets. Add greenery without worry for your furry friends.',
      image: 'https://images.unsplash.com/photo-1591958911319-0fe5a7f04319?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      slug: 'pet-friendly'
    },
    {
      id: 3,
      name: 'Easy Care Plants',
      description: 'Perfect for beginners or those with busy schedules.',
      image: 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      slug: 'easy-care'
    },
    {
      id: 4,
      name: 'Easy Care Plants',
      description: 'Perfect for beginners or those with busy schedules.',
      image: 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      slug: 'easy-care'
    }
  ]

  const popularPlants = [
    {
      id: 1,
      name: 'Fiddle Leaf Fig',
      price: 25,
      ratingStars: '★★★★★',
      reviewCount: 240,
      image: 'https://images.unsplash.com/photo-1591958911319-0fe5a7f04319?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 2,
      name: 'Snake Plant',
      price: 35,
      ratingStars: '★★★★☆',
      reviewCount: 180,
      image: 'https://images.unsplash.com/photo-1591958911319-0fe5a7f04319?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 3,
      name: 'Monstera Deliciosa',
      price: 45,
      ratingStars: '★★★★★',
      reviewCount: 320,
      image: 'https://images.unsplash.com/photo-1591958911319-0fe5a7f04319?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 4,
      name: 'Monstera Deliciosa',
      price: 45,
      ratingStars: '★★★★★',
      reviewCount: 320,
      image: 'https://images.unsplash.com/photo-1591958911319-0fe5a7f04319?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    }
  ]

  const testimonials = [
    {
      id: 1,
      name: 'Ridika Naznin',
      quote: 'My plants arrived in perfect condition and have been thriving ever since. The care instructions were so helpful!',
      image: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 2,
      name: 'Ramisa Anan',
      quote: "I've never been able to keep plants alive before, but GreenScape's easy-care plants are perfect for me.",
      image: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
      id: 3,
      name: 'Afrin Jahan',
      quote: 'Beautiful packaging and fast delivery. The perfect gift for my plant-loving friend!',
      image: 'https://randomuser.me/api/portraits/women/32.jpg'
    },
    {
      id: 4,
      name: 'Afrin Jahan',
      quote: 'Beautiful packaging and fast delivery. The perfect gift for my plant-loving friend!',
      image: 'https://randomuser.me/api/portraits/women/32.jpg'
    }
  ]

  return (
    <div className="bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 text-center text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center filter saturate-80 contrast-70 -z-10"></div>
        <div className="container mx-auto px-5">
          <h1 className="text-4xl md:text-5xl font-bold mb-5">Plants Make People Happy</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            We've curated the perfect plants for your busy life. Delivered to your door, ready to enjoy.
          </p>
          <Link 
            to="/plants" 
            className="inline-block bg-white text-[#224229] px-8 py-3 rounded-full text-lg hover:bg-[#d7c9a9]"
          >
            Shop Plants
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-[#f7f0e1]">
        <div className="container mx-auto px-5">
          <h2 className="text-3xl text-[#224229] text-center mb-10">Find Your Perfect Plant</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link 
              to="/plants" 
              className="text-[#224229] text-xl underline hover:text-[#4b6250]"
            >
              Explore All
            </Link>
          </div>
        </div>
      </section>
      
      {/* Popular Plants Section */}
      <section className="py-16 bg-[#f7f0e1]">
        <div className="container mx-auto px-5">
          <h2 className="text-3xl text-[#224229] text-center mb-10">Our Most Popular Plants</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {popularPlants.map(plant => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link 
              to="/plants" 
              className="text-[#224229] text-xl underline hover:text-[#4b6250]"
            >
              Explore All Plants
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-[#f7f0e1]">
        <div className="container mx-auto px-5">
          <h2 className="text-3xl text-[#224229] text-center mb-10">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {testimonials.map(testimonial => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}

export default Home