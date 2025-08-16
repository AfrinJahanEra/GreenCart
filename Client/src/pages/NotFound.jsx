import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const NotFound = () => {
  return (
    <div className="bg-white">
      <Header />
      
      <section className="min-h-[60vh] flex items-center justify-center bg-[#f7f0e1]">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[#224229] mb-6">404 - Page Not Found</h1>
          <p className="text-xl mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <Link 
            to="/" 
            className="inline-block bg-[#224229] text-white px-6 py-3 rounded-full hover:bg-[#4b6250]"
          >
            Return to Home
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}

export default NotFound