import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, cartAPI } from '../services/api';
import { customerOrdersAPI } from '../services/api'; // Add customerOrdersAPI import

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
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0); // Add pending orders count state

    useEffect(() => {
        // Check if user is logged in on app load
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        const userId = localStorage.getItem('userId');

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

    // Fetch cart items count
    const fetchCartItemsCount = async () => {
        if (user && user.role === 'customer') {
            try {
                const response = await cartAPI.getCart(user.user_id);
                if (response.data.cart_items) {
                    setCartItemsCount(response.data.cart_items.length);
                } else {
                    setCartItemsCount(0);
                }
            } catch (error) {
                console.error('Failed to fetch cart items count:', error);
                setCartItemsCount(0);
            }
        } else {
            setCartItemsCount(0);
        }
    };

    // Fetch pending orders count
    const fetchPendingOrdersCount = async () => {
        if (user && user.role === 'customer') {
            try {
                const response = await customerOrdersAPI.getPendingConfirmationOrders(user.user_id);
                if (response.data.orders) {
                    setPendingOrdersCount(response.data.orders.length);
                } else {
                    setPendingOrdersCount(0);
                }
            } catch (error) {
                console.error('Failed to fetch pending orders count:', error);
                setPendingOrdersCount(0);
            }
        } else {
            setPendingOrdersCount(0);
        }
    };

    // Fetch complete user profile
    const fetchUserProfile = async () => {
        if (!user) {
            throw new Error('No user logged in');
        }
        
        try {
            const response = await authAPI.getProfile(user.user_id);
            if (response.data.success) {
                const userProfile = response.data.user;
                // Update the user state with the complete profile data
                setUser(prevUser => ({
                    ...prevUser,
                    ...userProfile
                }));
                // Update localStorage with the complete profile data
                localStorage.setItem('userData', JSON.stringify({
                    ...user,
                    ...userProfile
                }));
                return { success: true, user: userProfile };
            } else {
                throw new Error(response.data.error || 'Failed to fetch profile');
            }
        } catch (error) {
            console.error('Profile fetch failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.response?.data?.error || error.message || 'Profile fetch failed'
            };
        }
    };

    // Update user profile
    const updateUser = async (updatedUserData) => {
        if (!user) {
            throw new Error('No user logged in');
        }
        
        try {
            // Create form data for the update
            const formData = new FormData();
            Object.keys(updatedUserData).forEach(key => {
                // Skip the profile_pic field if it's not being updated
                if (key !== 'profile_pic') {
                    formData.append(key, updatedUserData[key]);
                }
            });
            
            // Call the API to update the profile
            const response = await authAPI.updateProfile(user.user_id, user.user_id, formData);
            
            if (response.data.success) {
                // Update the user state with the new data
                const updatedUser = {
                    ...user,
                    ...updatedUserData
                };
                
                setUser(updatedUser);
                localStorage.setItem('userData', JSON.stringify(updatedUser));
                return { success: true, user: updatedUser };
            } else {
                throw new Error(response.data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.response?.data?.error || error.message || 'Profile update failed'
            };
        }
    };

    useEffect(() => {
        fetchCartItemsCount();
        fetchPendingOrdersCount();
    }, [user]);

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
            localStorage.setItem('userId', userData.user_id.toString());
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
            sessionStorage.removeItem('user');
            
            // Clear user state
            setUser(null);
            setCartItemsCount(0);
            setPendingOrdersCount(0);
            
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
        loading,
        cartItemsCount,
        pendingOrdersCount, // Expose pending orders count
        refreshCartItemsCount: fetchCartItemsCount,
        refreshPendingOrdersCount: fetchPendingOrdersCount, // Expose function to refresh pending orders count
        updateUser, // Add the updateUser function
        fetchUserProfile // Add the fetchUserProfile function
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};