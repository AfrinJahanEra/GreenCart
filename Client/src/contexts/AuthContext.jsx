import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on app load
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        const userId = localStorage.getItem('userId'); // Also check for userId

        console.log('AuthContext - Checking localStorage:');
        console.log('Token:', token ? 'exists' : 'missing');
        console.log('UserData:', userData ? 'exists' : 'missing');
        console.log('UserId:', userId || 'missing');

        if (token && userData) {
            const user = JSON.parse(userData);
            console.log('Setting user from localStorage:', user);
            setUser(user);
            
            // Ensure userId is also set for backward compatibility
            if (user.user_id && !userId) {
                localStorage.setItem('userId', user.user_id.toString());
                console.log('Set userId in localStorage:', user.user_id);
            }
        } else {
            console.log('No valid auth data found in localStorage');
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            const userData = response.data.user;
            const token = response.data.token || `auth_token_${userData.user_id}_${userData.role}`;

            console.log('Login successful, storing data:');
            console.log('User data:', userData);
            console.log('Token:', token ? 'received' : 'missing');

            localStorage.setItem('authToken', token);
            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('userId', userData.user_id.toString()); // Store userId separately for compatibility
            setUser(userData);

            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.response?.data?.error || 'Login failed'
            };
        }
    };

    const signup = async (userData) => {
        try {
            const response = await authAPI.signup(userData);
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.response?.data?.error || 'Signup failed'
            };
        }
    };

      const logout = async () => {
    try {
      // Clear all user data from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userId');
      sessionStorage.removeItem('user'); // Clear any session storage too
      
      // Clear user state
      setUser(null);
      
      // Optional: Call logout API endpoint if you have one
      // await axios.post('/api/logout/');
      
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

    const value = {
        user,
        login,
        signup,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};