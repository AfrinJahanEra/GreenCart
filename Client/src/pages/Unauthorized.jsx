import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { theme } from '../theme';

const Unauthorized = () => {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: theme.colors.primary }}>
            Unauthorized Access
          </h2>
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
          
          <div className="space-y-4">
            <Link
              to="/"
              className="block w-full py-2 px-4 rounded-md text-white"
              style={{ backgroundColor: theme.colors.primary }}
            >
              Go Home
            </Link>
            
            <Link
              to="/login"
              className="block w-full py-2 px-4 rounded-md border"
              style={{ 
                borderColor: theme.colors.primary,
                color: theme.colors.primary
              }}
            >
              Login with different account
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Unauthorized;