import { useParams } from 'react-router-dom';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { theme } from '../theme';
import { usePlantDetail, usePlantReviews } from '../hooks/usePlantDetail';
import { plantDetailAPI, cartAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PlantDetails = () => {
  const { id } = useParams();
  const { user } = useAuth(); // Use AuthContext instead of localStorage
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [startImageIndex, setStartImageIndex] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { plant, loading: plantLoading, error: plantError } = usePlantDetail(id);
  const { reviews, loading: reviewsLoading, error: reviewsError, setReviews } = usePlantReviews(id);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Update global favorites state here
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      if (!user || !user.user_id) {
        alert('Please login to add a review');
        return;
      }
      
      const orderId = prompt('Please enter your order ID to add a review:');
      
      if (!orderId) {
        alert('Order ID is required to add a review');
        return;
      }
      
      const reviewData = {
        user_id: user.user_id,
        order_id: parseInt(orderId),
        rating: newReview.rating,
        review_text: newReview.text
      };
      
      const response = await plantDetailAPI.addReview(id, reviewData);
      
      if (response.data.success) {
        alert('Review added successfully!');
        // Refresh the page to get updated reviews
        window.location.reload();
      } else {
        throw new Error(response.data.error || 'Failed to add review');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      alert(error.response?.data?.error || 'Failed to add review. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    // This functionality is not implemented in the backend
    alert('Delete review functionality is not yet implemented.');
  };

  const addToCart = async () => {
    if (!plant) return;
    
    try {
      if (!user || !user.user_id) {
        alert('Please login to add items to cart');
        return;
      }

      const sizes = formatSizes();
      const selectedSizeData = sizes[selectedSize];
      
      if (!selectedSizeData) {
        alert('Please select a valid size');
        return;
      }
      
      // Note: Backend expects size as string, not size_id
      const cartData = {
        user_id: user.user_id,
        plant_id: plant.plant_id,
        size: selectedSizeData.name, // Backend uses size name, not ID
        quantity: quantity
      };

      const response = await cartAPI.addToCart(cartData);
      
      if (response.data.success) {
        alert(`${quantity} ${plant.name} (${selectedSizeData.name}) added to cart!`);
      } else {
        throw new Error(response.data.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.error || 'Failed to add to cart. Please try again.');
    }
  };

  const getVisibleImages = () => {
    if (window.innerWidth >= 1024) return 2.5; // lg screens
    if (window.innerWidth >= 640) return 2; // sm screens
    return 1; // mobile
  };

  const nextImages = () => {
    if (!plant) return;
    
    setStartImageIndex((prevIndex) => {
      const visibleImages = getVisibleImages();
      return prevIndex + 1 >= plant.image_urls.length - Math.floor(visibleImages) ? 0 : prevIndex + 1;
    });
  };

  const prevImages = () => {
    if (!plant) return;
    
    setStartImageIndex((prevIndex) => 
      prevIndex - 1 < 0 ? Math.max(0, plant.image_urls.length - Math.ceil(getVisibleImages())) : prevIndex - 1
    );
  };

  // Format sizes from API response
  const formatSizes = () => {
    if (!plant || !plant.sizes) return [];
    
    return plant.sizes.map(size => ({
      id: size.size_id,
      name: size.size_name,
      price: parseFloat(plant.base_price) + parseFloat(size.price_adjustment)
    }));
  };

  if (plantLoading) {
    return (
      <div className="bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-lg">Loading plant details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (plantError || !plant) {
    return (
      <div className="bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-lg text-red-600">Error: {plantError || 'Plant not found'}</div>
        </div>
        <Footer />
      </div>
    );
  }

  const sizes = formatSizes();
  const allImages = plant?.image_urls ? [plant.primary_image, ...plant.image_urls] : [plant?.primary_image].filter(Boolean);

  return (
    <div className="bg-white">
      <Header />
      
      <section className="py-6 sm:py-8 md:py-12 lg:py-16" style={{ backgroundColor: theme.colors.background.light }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="relative w-full">
                <div className="overflow-hidden w-full">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ 
                      transform: `translateX(-${startImageIndex * (100 / (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1))}%)`
                    }}
                  >
                    {allImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${plant.name} ${index + 1}`}
                        className="w-full sm:w-1/2 lg:w-1/3 h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded flex-shrink-0 px-1"
                      />
                    ))}
                  </div>
                </div>
                {allImages.length > getVisibleImages() && (
                  <>
                    <button
                      onClick={prevImages}
                      className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-1 sm:p-2 rounded-full hover:bg-opacity-75 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 sm:h-6 w-5 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImages}
                      className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-1 sm:p-2 rounded-full hover:bg-opacity-75 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 sm:h-6 w-5 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              <div className="flex flex-col gap-4 sm:gap-6">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: theme.colors.primary }}>{plant.name}</h1>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                    <div className="text-yellow-500 text-sm sm:text-base">{'★'.repeat(Math.round(plant.avg_rating))}</div>
                    <div className="text-xs sm:text-sm text-gray-600">({plant.review_count} reviews)</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-base sm:text-lg lg:text-xl" style={{ color: theme.colors.primary }}>Description</h3>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base text-gray-700">{plant.description}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-base sm:text-lg lg:text-xl" style={{ color: theme.colors.primary }}>Features</h3>
                  <ul className="list-disc pl-4 sm:pl-5 mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base text-gray-700 space-y-1">
                    {plant.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-base sm:text-lg lg:text-xl" style={{ color: theme.colors.primary }}>Care Tips</h3>
                  <ul className="list-disc pl-4 sm:pl-5 mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base text-gray-700 space-y-1">
                    {plant.care_tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 sm:gap-6 lg:sticky lg:top-4 bg-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: theme.colors.primary }}>
                  ${sizes.length > 0 ? sizes[selectedSize]?.price?.toFixed(2) : plant?.base_price?.toFixed(2)}
                </h2>
                <button 
                  onClick={toggleFavorite}
                  className="p-1 sm:p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 sm:h-6 w-5 sm:w-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                    viewBox="0 0 20 20" 
                    fill="none" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm sm:text-base lg:text-lg" style={{ color: theme.colors.primary }}>Select Size:</h3>
                <div className="space-y-2 sm:space-y-3 mt-2 sm:mt-3">
                  {sizes.map((size, index) => (
                    <div 
                      key={size.id || index}
                      onClick={() => setSelectedSize(index)}
                      className={`p-2 sm:p-3 border rounded cursor-pointer transition-colors ${
                        index === selectedSize ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-xs sm:text-sm lg:text-base">{size.name}</span>
                        <span className="font-bold text-xs sm:text-sm lg:text-base" style={{ color: theme.colors.primary }}>${size.price?.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm lg:text-base font-medium mb-1 sm:mb-2" style={{ color: theme.colors.primary }}>Quantity</label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-sm sm:text-base lg:text-lg font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <Button
                onClick={addToCart}
                className="w-full mt-4 sm:mt-6 py-2 sm:py-3 text-xs sm:text-sm lg:text-base"
              >
                Add to Cart
              </Button>
              
              <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 text-center">
                Free shipping on orders over $100. Delivery within 3–5 business days.
              </p>
              
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold" style={{ color: theme.colors.primary }}>Customer Reviews</h2>
                  <Button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-xs sm:text-sm"
                  >
                    {showReviewForm ? 'Cancel' : 'Add Review'}
                  </Button>
                </div>
                
                {showReviewForm && (
                  <form onSubmit={handleAddReview} className="mb-6 p-4 bg-gray-50 rounded">
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Rating</label>
                      <select 
                        value={newReview.rating}
                        onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                        className="w-full p-2 border rounded"
                      >
                        <option value={5}>5 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={3}>3 Stars</option>
                        <option value={2}>2 Stars</option>
                        <option value={1}>1 Star</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Review</label>
                      <textarea 
                        value={newReview.text}
                        onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                        className="w-full p-2 border rounded"
                        rows="3"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Submit Review</Button>
                  </form>
                )}
                
                {reviewsLoading ? (
                  <div>Loading reviews...</div>
                ) : reviewsError ? (
                  <div className="text-red-600">Error loading reviews: {reviewsError}</div>
                ) : (reviews.length === 0 ? (
                  <div className="text-gray-500 italic">No reviews yet. Be the first to review!</div>
                ) : (
                  reviews.map(review => (
                    <div key={review.review_id} className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="text-yellow-500 text-sm sm:text-base">{'★'.repeat(review.rating)}</div>
                        <span className="text-xs sm:text-sm text-gray-500">{review.review_date}</span>
                      </div>
                      <p className="mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base text-gray-700 italic">"{review.review_text}"</p>
                      <p className="text-right text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">– {review.author}</p>
                    </div>
                  )))
                )}
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