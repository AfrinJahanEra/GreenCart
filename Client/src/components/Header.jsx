import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import CartSidebar from './CartSidebar'
import ProfileSidebar from './ProfileSidebar'

const Header = () => {
  const [showCart, setShowCart] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()

  // Sample plant data for search
  const allPlants = [
    { id: 1, name: 'Snake Plant', slug: 'snake-plant' },
    { id: 2, name: 'Fiddle Leaf Fig', slug: 'fiddle-leaf-fig' },
    { id: 3, name: 'Monstera Deliciosa', slug: 'monstera-deliciosa' },
    { id: 4, name: 'Spider Plant', slug: 'spider-plant' },
    { id: 5, name: 'ZZ Plant', slug: 'zz-plant' },
    { id: 6, name: 'Peace Lily', slug: 'peace-lily' }
  ]

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([])
      return
    }

    const results = allPlants
      .filter(plant => 
        plant.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 3) // Show max 3 results
    
    setSearchResults(results)
  }, [searchQuery])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim() && searchResults.length > 0) {
      navigate(`/plant/${searchResults[0].id}`)
      setSearchQuery('')
      setSearchResults([])
    }
  }

  const handleResultClick = (plantId) => {
    navigate(`/plant/${plantId}`)
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
  }

  return (
    <>
      <header className="bg-[#f7f0e1] shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-5 py-4">
          <div className="flex flex-wrap justify-between items-center gap-5">
            <Link to="/" className="text-2xl font-bold text-[#224229] flex-1">
              GreenCart
            </Link>
            
            <div className="flex justify-center flex-2 relative">
              <form onSubmit={handleSearchSubmit} className="w-full max-w-md">
                <div className="flex relative">
                  <input 
                    type="text" 
                    placeholder="Search plants..." 
                    className="w-full bg-[#f7f0e1] h-10 px-4 border border-gray-300 rounded-l-full outline-none focus:ring-2 focus:ring-[#224229] focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowResults(true)
                    }}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    onFocus={() => setShowResults(true)}
                  />
                  <button 
                    type="submit"
                    className="px-6 bg-[#224229] text-white rounded-r-full hover:bg-[#4b6250] transition-colors"
                  >
                    <i className="fas fa-search"></i>
                  </button>
                </div>

                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                    {searchResults.map(plant => (
                      <div
                        key={plant.id}
                        className="p-3 hover:bg-[#f7f0e1] cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleResultClick(plant.id)}
                      >
                        <div className="flex items-center gap-3">
                          <i className="fas fa-search text-gray-400"></i>
                          <span className="text-[#224229]">{plant.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>
            
            <div className="flex items-center justify-end gap-6 flex-1">
              <button 
                onClick={() => setShowProfile(true)} 
                className="relative group p-2 rounded-full hover:bg-white hover:bg-opacity-30 transition-colors"
              >
                <i className="fas fa-user text-xl text-[#224229]"></i>
                <span className="absolute inset-0 rounded-full group-hover:bg-white group-hover:bg-opacity-20 -z-10"></span>
              </button>
              <button 
                onClick={() => setShowCart(true)} 
                className="relative group p-2 rounded-full hover:bg-white hover:bg-opacity-30 transition-colors"
              >
                <i className="fas fa-shopping-cart text-xl text-[#224229]"></i>
                <span className="absolute -top-1 -right-1 bg-[#224229] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center group-hover:bg-[#4b6250] transition-colors">
                  0
                </span>
                <span className="absolute inset-0 rounded-full group-hover:bg-white group-hover:bg-opacity-20 -z-10"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartSidebar showCart={showCart} setShowCart={setShowCart} />
      <ProfileSidebar showProfile={showProfile} setShowProfile={setShowProfile} />
    </>
  )
}

export default Header