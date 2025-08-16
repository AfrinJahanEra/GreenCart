import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div className="bg-white">
      <Header />
      
      <section className="min-h-[60vh] flex items-center justify-center bg-[#f7f0e1]">
        <div className="text-center px-4 py-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#224229] mb-4 sm:mb-6">404 - Page Not Found</h1>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <Link 
            to="/" 
            className="inline-block bg-[#224229] text-white px-6 py-2 sm:px-8 sm:py-3 rounded-full hover:bg-[#4b6250] text-sm sm:text-base"
          >
            Return to Home
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default NotFound;