import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { authAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import { theme } from '../theme';

const ProfileSidebar = ({ showProfile, setShowProfile }) => {
  const { user, logout } = useAuth();
  const [isClosing, setIsClosing] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    profile_image: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [file, setFile] = useState(null);

  // Fetch user profile on mount
  useEffect(() => {
    if (user && showProfile) {
      fetchUserProfile();
    }
  }, [user, showProfile]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.getProfile(user.user_id);
      
      if (response.data.success) {
        setProfile({
          first_name: response.data.profile.first_name || '',
          last_name: response.data.profile.last_name || '',
          email: response.data.profile.email || '',
          phone: response.data.profile.phone || '',
          address: response.data.profile.address || '',
          profile_image: response.data.profile.profile_image || 'https://randomuser.me/api/portraits/men/1.jpg'
        });
      } else {
        setError('Failed to fetch profile');
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowProfile(false);
      setIsClosing(false);
      setIsEditing(false);
      setError(null);
      setSuccess(null);
      setFile(null);
    }, 300);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type and size
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Prepare form data for profile update
      const formData = new FormData();
      formData.append('first_name', profile.first_name);
      formData.append('last_name', profile.last_name);
      formData.append('email', profile.email);
      formData.append('phone', profile.phone);
      formData.append('address', profile.address);
      
      if (file) {
        formData.append('profile_image', file);
      }

      // Update profile - user can only update their own profile
      const response = await authAPI.updateProfile(user.user_id, user.user_id, formData);

      if (response.data.success) {
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        setFile(null);
        
        // Refresh profile data
        await fetchUserProfile();
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFile(null);
    setError(null);
    setSuccess(null);
    // Reset profile data from server
    fetchUserProfile();
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        setSaving(true);
        const response = await authAPI.deleteAccount(user.user_id, user.user_id);
        
        if (response.data.success) {
          setSuccess('Account deleted successfully');
          setTimeout(() => {
            logout();
            handleClose();
          }, 2000);
        } else {
          setError('Failed to delete account');
        }
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setSaving(false);
      }
    }
  };

  if (!showProfile) return null;

  const fullName = `${profile.first_name} ${profile.last_name}`.trim();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 w-full max-w-md h-full z-50 overflow-y-auto transform transition-transform duration-300 ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
        style={{
          boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
          backgroundColor: theme.colors.sidebarBg,
        }}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>Your Profile</h2>
            <button
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-800 transition-colors p-2"
              disabled={saving}
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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {!loading && (
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col items-center mb-6">
                <img
                  src={file ? URL.createObjectURL(file) : profile.profile_image}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-white shadow-lg"
                  onError={(e) => {
                    e.target.src = 'https://randomuser.me/api/portraits/men/1.jpg';
                  }}
                />
                {isEditing && (
                  <div className="mb-4 w-full max-w-xs">
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
                      disabled={saving}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.first_name}
                        onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={saving}
                      />
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg min-h-10">{profile.first_name || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.last_name}
                        onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={saving}
                      />
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg min-h-10">{profile.last_name || 'Not provided'}</p>
                    )}
                  </div>
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
                      disabled={saving}
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg min-h-10">{profile.phone || 'Not provided'}</p>
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
                      disabled={saving}
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg min-h-20 whitespace-pre-wrap">{profile.address || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    className="flex-1"
                    disabled={saving}
                    loading={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    type="secondary"
                    className="flex-1"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex-1"
                    disabled={loading}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    type="danger"
                    className="flex-1"
                    disabled={loading || saving}
                    loading={saving}
                  >
                    Delete Account
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar;