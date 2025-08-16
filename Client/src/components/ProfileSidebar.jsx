import { useState } from 'react'

const ProfileSidebar = ({ showProfile, setShowProfile }) => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Plant St, Greenville',
    image: 'https://randomuser.me/api/portraits/men/1.jpg'
  })
  const [isEditing, setIsEditing] = useState(false)

  if (!showProfile) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={() => setShowProfile(false)}
      ></div>
      
      <div className="fixed top-0 right-0 w-full md:w-1/2 lg:w-1/3 h-full bg-[#e9f1e1] text-[#224229] z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Profile</h2>
            <button 
              onClick={() => setShowProfile(false)}
              className="text-2xl"
            >
              &times;
            </button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <img 
              src={user.image} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
            {isEditing ? (
              <input 
                type="file" 
                className="mb-4"
              />
            ) : null}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={user.name}
                  onChange={(e) => setUser({...user, name: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="p-2 bg-white rounded">{user.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <p className="p-2 bg-white rounded">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={user.phone}
                  onChange={(e) => setUser({...user, phone: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="p-2 bg-white rounded">{user.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              {isEditing ? (
                <textarea 
                  value={user.address}
                  onChange={(e) => setUser({...user, address: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="p-2 bg-white rounded">{user.address}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-[#224229] text-white py-2 rounded"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-300 py-2 rounded"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-[#224229] text-white py-2 rounded"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfileSidebar