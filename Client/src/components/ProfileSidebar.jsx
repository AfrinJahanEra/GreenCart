// src/components/ProfileSidebar.jsx
import { useState } from 'react';
import Button from './Button';
import { theme } from '../theme';

const ProfileSidebar = ({ showProfile, setShowProfile }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Plant St, Greenville',
    image: 'https://randomuser.me/api/portraits/men/1.jpg'
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleClose = () => {
    setShowProfile(false);
  };

  if (!showProfile) return null;

  return (
    <>
      <div className={`fixed top-0 right-0 w-full max-w-md h-full z-50 overflow-y-auto transform transition-transform duration-300 ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
        style={{
          boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
          backgroundColor: theme.colors.sidebarBg,
          backdropFilter: 'blur(10px)'
        }}
      ></div>

      <div className="fixed top-0 right-0 w-full md:w-96 h-full bg-white z-50 overflow-y-auto transform transition-transform duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>Your Profile</h2>
            <button
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <img
              src={user.image}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
            {isEditing && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-center" style={{ color: theme.colors.primary }}>
                  Change Profile Picture
                </label>
                <input
                  type="file"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>Email</label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>Address</label>
              {isEditing ? (
                <textarea
                  value={user.address}
                  onChange={(e) => setUser({ ...user, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.address}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {isEditing ? (
                <>
                  <Button
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    type="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar;