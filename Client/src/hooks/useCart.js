import { useState, useEffect } from 'react';
import { cartAPI } from '../services/api';

export const useCart = (userId) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCartItems = async () => {
    if (!userId) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await cartAPI.getCart(userId);
      
      if (response.data.cart_items) {
        setCartItems(response.data.cart_items);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch cart items');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (cartData) => {
    try {
      const response = await cartAPI.addToCart(cartData);
      
      if (response.data.success) {
        await fetchCartItems(); // Refresh cart items
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Failed to add to cart');
      }
    } catch (error) {
      throw error;
    }
  };

  const toggleCartItem = async (cartId) => {
    try {
      const response = await cartAPI.toggleCartItem({
        cart_id: cartId,
        user_id: userId
      });
      
      if (response.data.success) {
        await fetchCartItems(); // Refresh cart items
      } else {
        throw new Error(response.data.error || 'Failed to toggle item');
      }
    } catch (error) {
      console.error('Toggle cart item error:', error);
      throw error;
    }
  };

  const updateQuantity = async (cartId, quantity) => {
    try {
      const response = await cartAPI.updateCartQuantity({
        cart_id: cartId,
        user_id: userId,
        quantity: quantity
      });
      
      if (response.data.success) {
        await fetchCartItems(); // Refresh cart items
      } else {
        throw new Error(response.data.error || 'Failed to update quantity');
      }
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      const response = await cartAPI.removeFromCart({
        cart_id: cartId,
        user_id: userId
      });
      
      if (response.data.success) {
        await fetchCartItems(); // Refresh cart items
      } else {
        throw new Error(response.data.error || 'Failed to remove item');
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [userId]);

  return {
    cartItems,
    loading,
    error,
    addToCart,
    toggleCartItem,
    updateQuantity,
    removeFromCart,
    refreshCart: fetchCartItems
  };
};