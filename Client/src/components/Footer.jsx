const Footer = () => {
  return (
    <footer className="bg-[#224229] text-[#f7f0e1] py-16 px-5">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <h3 className="text-xl font-semibold mb-5 pb-2 border-b-2 border-[#f7f0e1] inline-block">Shop</h3>
            <ul className="space-y-3">
              {['All Plants', 'New Arrivals', 'Pet Friendly', 'Low Light', 'Gifts'].map((item) => (
                <li key={item}><a href="#" className="hover:underline">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-5 pb-2 border-b-2 border-[#f7f0e1] inline-block">Learn</h3>
            <ul className="space-y-3">
              {['Plant Care', 'Plant Blog', 'Plant Finder', 'FAQ'].map((item) => (
                <li key={item}><a href="#" className="hover:underline">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-5 pb-2 border-b-2 border-[#f7f0e1] inline-block">Company</h3>
            <ul className="space-y-3">
              {['About Us', 'Sustainability', 'Press', 'Careers'].map((item) => (
                <li key={item}><a href="#" className="hover:underline">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-5 pb-2 border-b-2 border-[#f7f0e1] inline-block">Connect</h3>
            <ul className="space-y-3">
              {['Contact Us', 'Instagram', 'Facebook', 'Pinterest'].map((item) => (
                <li key={item}><a href="#" className="hover:underline">{item}</a></li>
              ))}
            </ul>
            <div className="flex gap-3 mt-3">
              {['facebook', 'instagram', 'pinterest'].map((social) => (
                <a key={social} href="#" className="text-lg hover:text-[#d0e6c5]">
                  <i className={`fab fa-${social}`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-center pt-5 border-t border-[#f7f0e1] opacity-80">
          <p>&copy; 2023 GreenCart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer