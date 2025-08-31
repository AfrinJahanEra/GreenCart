import { Link } from 'react-router-dom';
import Button from './Button';

const Hero = () => {
  const heroImageUrl = 'https://images.pexels.com/photos/1006293/pexels-photo-1006293.jpeg?auto=compress&cs=tinysrgb&w=1500';
  console.log('HeroImageUrl:', heroImageUrl);

  return (
    <section className="relative h-[70vh] text-center text-white flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImageUrl}
          alt="Plant background"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Failed to load Hero image, using fallback');
            e.target.onerror = null;
            e.target.src = 'https://plus.unsplash.com/premium_photo-1661779742306-ff4959e610fb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDcyfHx8ZW58MHx8fHx8';
          }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}></div>
      </div>
      <div className="container mx-auto px-5 relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-5 drop-shadow-lg">
          Plants Make People Happy
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 drop-shadow-md">
          We've curated the perfect plants for your busy life. Delivered to your door, ready to enjoy.
        </p>
        <Button
          to="/plants"
          type="primary"
          className="text-lg px-8 py-3 inline-block hover:scale-105 transition-transform"
        >
          Shop Plants
        </Button>
      </div>
    </section>
  );
};

export default Hero;