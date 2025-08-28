import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { authAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import { theme } from '../theme';

const ProfileSidebar = ({ showProfile, setShowProfile }) => {
  const { user } = useAuth();
  const [isClosing, setIsClosing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    image: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [file, setFile] = useState(null);

  // Fetch user profile on mount
  useEffect(() => {
    if (user && showProfile) {
      const fetchProfile = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await authAPI.getProfile(user.id);
          setProfile({
            name: response.data.name,
            email: response.data.email,
            phone: response.data.phone || '',
            address: response.data.address || '',
            image: response.data.profile_image || 'https://randomuser.me/api/portraits/men/1.jpg'
          });
        } catch (err) {
          setError(handleApiError(err));
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user, showProfile]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowProfile(false);
      setIsClosing(false);
    }, 300);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Prepare form data for profile update
      const formData = new FormData();
      formData.append('username', user.username); // Assuming username doesn't change
      formData.append('email', profile.email);
      formData.append('first_name', profile.name.split(' ')[0] || '');
      formData.append('last_name', profile.name.split(' ').slice(1).join(' ') || '');
      formData.append('phone', profile.phone);
      formData.append('address', profile.address);
      if (file) {
        formData.append('profile_image', file);
      }

      // Update profile
      await authAPI.updateProfile(user.id, user.id, formData);

      setSuccess('Profile updated successfully');
      setIsEditing(false);

      // Refresh profile data
      const response = await authAPI.getProfile(user.id);
      setProfile({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone || '',
        address: response.data.address || '',
        image: response.data.profile_image || 'https://randomuser.me/api/portraits/men/1.jpg'
      });
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFile(null);
    setError(null);
    setSuccess(null);
  };

  if (!showProfile) return null;

  return (
    <>
      <div 
        className={`fixed top-0 right-0 w-full max-w-md h-full z-50 overflow-y-auto transform transition-transform duration-300 ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
        style={{
          boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
          backgroundColor: theme.colors.sidebarBg,
          backdropFilter: 'blur(10px)'
        }}
      >
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

          {loading && (
            <div className="flex justify-center items-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          {!loading && (
            <div className="flex flex-col items-center mb-6">
              <img
                src={file ? URL.createObjectURL(file) : profile.image}
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
                    accept="image/*"
                    onChange={handleFileChange}
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
          )}

          {!loading && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>Email</label>
                <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>Address</label>
                {isEditing ? (
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="3"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.address || 'Not provided'}</p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      type="secondary"
                      className="flex-1"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full"
                    disabled={loading}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar;