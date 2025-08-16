import { useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useState } from 'react'

const PlantDetails = () => {
  const { id } = useParams()
  const [selectedSize, setSelectedSize] = useState(0)
  const [quantity, setQuantity] = useState(1)
  
  // Sample data - in a real app, this would come from an API
  const plant = {
    id: 1,
    name: 'Bromeliad Pineapple',
    price: 54,
    ratingStars: '★★★★★',
    reviewCount: 142,
    description: 'The Bromeliad Pineapple is a fun and unique tropical plant that produces a mini pineapple fruit. With its spiky green leaves and playful shape, this houseplant brings a tropical flair to any space.',
    image: 'https://images.unsplash.com/photo-1591958911319-0fe5a7f04319?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    sizes: [
      { name: 'Small', price: 54 },
      { name: 'Medium', price: 74 },
      { name: 'Large', price: 94 }
    ],
    features: [
      'Healthy plant pre-potted in a recyclable pot',
      'Care instructions included',
      'Free access to plant care experts'
    ],
    reviews: [
      {
        id: 1,
        text: 'Absolutely love this plant! Arrived healthy and already thriving.',
        author: 'Sarah M.'
      },
      {
        id: 2,
        text: 'Very cute and easy to take care of. Gave my living room a tropical vibe!',
        author: 'Jonathan D.'
      },
      {
        id: 3,
        text: 'The mini pineapple is adorable. Great packaging and fast delivery.',
        author: 'Priya S.'
      }
    ]
  }

  const addToCart = () => {
    // In a real app, this would update a global cart state
    const item = {
      id: plant.id,
      name: plant.name,
      price: plant.sizes[selectedSize].price,
      image: plant.image,
      size: plant.sizes[selectedSize].name,
      quantity: quantity
    }
    console.log('Added to cart:', item)
    alert(`${quantity} ${plant.name} (${plant.sizes[selectedSize].name}) added to cart!`)
  }

  return (
    <div className="bg-white">
      <Header />
      
      <section className="py-16 bg-[#f7f0e1]">
        <div className="container mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <img 
                src={plant.image} 
                alt={plant.name} 
                className="w-full h-96 object-cover shadow-md"
              />
              
              <div className="mt-8 p-6 bg-[#f7f0e1]">
                <h1 className="text-3xl font-bold text-[#224229]">{plant.name}</h1>
                <div className="flex items-center gap-2 mt-3">
                  <div className="text-yellow-500">{plant.ratingStars}</div>
                  <div>({plant.reviewCount} reviews)</div>
                </div>
                <p className="text-xl font-bold text-[#224229] mt-3">${plant.sizes[selectedSize].price}</p>
                <p className="mt-4 text-[#224229]">{plant.description}</p>
                
                <div className="mt-6">
                  <h3 className="font-semibold text-[#224229]">What's Included</h3>
                  <ul className="list-disc pl-5 mt-2 text-[#224229]">
                    {plant.features.map((feature, index) => (
                      <li key={index} className="mt-1">{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 shadow-md">
              <h3 className="font-semibold text-[#224229] mb-4">Select Size:</h3>
              {plant.sizes.map((size, index) => (
                <div 
                  key={index}
                  onClick={() => setSelectedSize(index)}
                  className={`flex justify-between items-center p-3 border rounded mb-3 cursor-pointer ${
                    index === selectedSize ? 'border-[#224229] bg-[#f0f7f1]' : 'border-gray-300'
                  }`}
                >
                  <span>{size.name}</span>
                  <span className="font-bold">${size.price}</span>
                </div>
              ))}
              
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <button 
                onClick={addToCart}
                className="w-full bg-[#224229] text-white py-3 rounded mt-6 hover:bg-[#4b6250]"
              >
                Add to Cart
              </button>
              
              <p className="text-sm text-gray-600 mt-3">
                Free shipping on orders over $100. Delivery within 3–5 business days.
              </p>
              
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-semibold text-[#224229] mb-6">Customer Reviews</h2>
                {plant.reviews.map(review => (
                  <div key={review.id} className="mb-6 pb-6 border-b border-dashed border-gray-300">
                    <p className="text-[#224229] italic">"{review.text}"</p>
                    <p className="text-right text-gray-500 mt-2">– {review.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}

export default PlantDetails