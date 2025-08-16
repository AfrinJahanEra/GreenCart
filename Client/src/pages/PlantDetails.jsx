// src/pages/PlantDetails.jsx
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { theme } from '../theme';

const PlantDetails = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const plant = {
    id: 1,
    name: 'Monstera Deliciosa',
    price: 45,
    ratingStars: '★★★★★',
    reviewCount: 520,
    description: 'The Monstera Deliciosa, also known as the Swiss Cheese Plant, is famous for its large, glossy leaves with natural holes. This tropical beauty is perfect for adding a lush, jungle-like feel to your space.',
    image: 'https://images.unsplash.com/photo-1525947088131-b701cd0f6dc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sizes: [
      { name: 'Small (4-6")', price: 35 },
      { name: 'Medium (6-8")', price: 45 },
      { name: 'Large (8-10")', price: 55 }
    ],
    features: [
      'Pet-friendly and non-toxic',
      'Low maintenance and easy to care for',
      'Helps purify indoor air',
      'Comes with care guide'
    ],
    careTips: [
      'Light: Bright, indirect sunlight',
      'Water: Once a week, allow soil to dry between waterings',
      'Humidity: Prefers higher humidity',
      'Temperature: 65-85°F (18-29°C)'
    ],
    reviews: [
      {
        id: 1,
        text: 'Absolutely love my Monstera! It arrived in perfect condition and has grown two new leaves already.',
        author: 'Emma R.',
        rating: 5,
        date: '2 weeks ago'
      },
      {
        id: 2,
        text: 'Beautiful plant, much bigger than I expected. Very happy with my purchase!',
        author: 'David L.',
        rating: 5,
        date: '1 month ago'
      }
    ]
  };

  const addToCart = () => {
    const item = {
      id: plant.id,
      name: plant.name,
      price: plant.sizes[selectedSize].price,
      image: plant.image,
      size: plant.sizes[selectedSize].name,
      quantity: quantity
    };
    console.log('Added to cart:', item);
    alert(`${quantity} ${plant.name} (${plant.sizes[selectedSize].name}) added to cart!`);
  };

  return (
    <div className="bg-white">
      <Header />
      
      <section className="py-16" style={{ backgroundColor: theme.colors.background.light }}>
        <div className="container mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <img 
                  src={plant.image} 
                  alt={plant.name} 
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              
              <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold" style={{ color: theme.colors.primary }}>{plant.name}</h1>
                <div className="flex items-center gap-2 mt-3">
                  <div className="text-yellow-500">{plant.ratingStars}</div>
                  <div className="text-gray-600">({plant.reviewCount} reviews)</div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold text-lg" style={{ color: theme.colors.primary }}>Description</h3>
                  <p className="mt-2 text-gray-700">{plant.description}</p>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold text-lg" style={{ color: theme.colors.primary }}>Features</h3>
                  <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                    {plant.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold text-lg" style={{ color: theme.colors.primary }}>Care Tips</h3>
                  <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                    {plant.careTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
              <h2 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>${plant.sizes[selectedSize].price}</h2>
              
              <div className="mt-6">
                <h3 className="font-semibold text-lg" style={{ color: theme.colors.primary }}>Select Size:</h3>
                <div className="space-y-3 mt-3">
                  {plant.sizes.map((size, index) => (
                    <div 
                      key={index}
                      onClick={() => setSelectedSize(index)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        index === selectedSize ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{size.name}</span>
                        <span className="font-bold" style={{ color: theme.colors.primary }}>${size.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>Quantity</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <Button
                onClick={addToCart}
                className="w-full mt-6 py-3 text-lg"
              >
                Add to Cart
              </Button>
              
              <p className="text-sm text-gray-600 mt-3 text-center">
                Free shipping on orders over $100. Delivery within 3–5 business days.
              </p>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-2xl font-semibold mb-6" style={{ color: theme.colors.primary }}>Customer Reviews</h2>
                {plant.reviews.map(review => (
                  <div key={review.id} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <div className="text-yellow-500">{'★'.repeat(review.rating)}</div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="mt-2 text-gray-700 italic">"{review.text}"</p>
                    <p className="text-right text-gray-600 mt-2">– {review.author}</p>
                  </div>
                ))}
                
                <Button
                  type="secondary"
                  className="w-full mt-4"
                >
                  Write a Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default PlantDetails;