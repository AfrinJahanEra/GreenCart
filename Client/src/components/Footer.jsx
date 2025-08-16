// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { theme } from '../theme';

const Footer = () => {
  return (
    <footer className="py-16 px-5" style={{ backgroundColor: theme.colors.primary, color: theme.colors.text.light }}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <h3 className="text-xl font-semibold mb-5 pb-2 border-b-2 inline-block" style={{ borderColor: theme.colors.text.light }}>Shop</h3>
            <ul className="space-y-3">
              {['All Plants', 'New Arrivals', 'Pet Friendly', 'Low Light', 'Gifts'].map((item) => (
                <li key={item}>
                  <Link to="#" className="hover:underline transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-5 pb-2 border-b-2 inline-block" style={{ borderColor: theme.colors.text.light }}>Learn</h3>
            <ul className="space-y-3">
              {['Plant Care', 'Plant Blog', 'Plant Finder', 'FAQ'].map((item) => (
                <li key={item}>
                  <Link to="#" className="hover:underline transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-5 pb-2 border-b-2 inline-block" style={{ borderColor: theme.colors.text.light }}>Company</h3>
            <ul className="space-y-3">
              {['About Us', 'Sustainability', 'Press', 'Careers'].map((item) => (
                <li key={item}>
                  <Link to="#" className="hover:underline transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-5 pb-2 border-b-2 inline-block" style={{ borderColor: theme.colors.text.light }}>Connect</h3>
            <ul className="space-y-3">
              {['Contact Us', 'Instagram', 'Facebook', 'Pinterest'].map((item) => (
                <li key={item}>
                  <Link to="#" className="hover:underline transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex gap-4 mt-4">
              {['facebook', 'instagram', 'pinterest'].map((social) => (
                <Link key={social} to="#" className="text-xl hover:opacity-80 transition-opacity">
                  <i className={`fab fa-${social}`}></i>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-center pt-5 border-t" style={{ borderColor: 'rgba(247, 240, 225, 0.2)' }}>
          <p>&copy; {new Date().getFullYear()} GreenCart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;