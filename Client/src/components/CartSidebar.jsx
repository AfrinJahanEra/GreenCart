import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { theme } from '../theme';
import Button from './Button';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';

const CartSidebar = ({ showCart, setShowCart }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef();
  const [isClosing, setIsClosing] = useState(false);
  
  // Get user from AuthContext
  const { user } = useAuth();
  const userId = user?.user_id;
  
  // Use the cart hook
  const {
    cartItems,
    loading,
    error,
    toggleCartItem,
    updateQuantity,
    removeFromCart
  } = useCart(userId);

  useEffect(() => {
    if (showCart) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showCart]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowCart(false);
      setIsClosing(false);
    }, 300);
  };

  const toggleSelection = async (cartId) => {
    try {
      await toggleCartItem(cartId);
    } catch (error) {
      console.error('Error toggling cart item:', error);
      alert('Failed to update item selection');
    }
  };

  const removeItem = async (cartId) => {
    try {
      await removeFromCart(cartId);
    } catch (error) {
      console.error('Error removing cart item:', error);
      alert('Failed to remove item from cart');
    }
  };

  const updateItemQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(cartId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update item quantity');
    }
  };

  const handleDownloadPDF = () => {
    const element = sidebarRef.current;
    const opt = {
      margin: 10,
      filename: 'cart-summary.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  const handleProceedToOrder = () => {
    const selectedItems = cartItems.filter(item => item.is_selected);
    if (selectedItems.length === 0) {
      alert('Please select at least one item to proceed');
      return;
    }
    
    // Transform cart items to order format
    const orderItems = selectedItems.map(item => ({
      cart_id: item.cart_id,
      plant_id: item.plant_id,
      name: item.plant_name,
      price: parseFloat(item.unit_price),
      image: item.image_url,
      size: item.size_name || 'Standard',
      quantity: item.quantity,
      seller: item.seller_email
    }));
    
    handleClose();
    navigate('/order', { state: { items: orderItems, cartItems: selectedItems } });
  };

  if (!showCart) return null;

  return (
    <>
      <div className={`fixed top-0 right-0 w-full max-w-md h-full z-50 overflow-y-auto transform transition-transform duration-300 ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
        style={{
          boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
          backgroundColor: theme.colors.sidebarBg,
          backdropFilter: 'blur(10px)'
        }}
      ></div>

      <div
        className={`fixed top-0 right-0 w-full max-w-md h-full bg-white z-50 overflow-y-auto transform transition-transform duration-300 ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
        style={{ boxShadow: '-5px 0 15px rgba(0,0,0,0.1)' }}
      >
        <div className="p-4 sm:p-6" ref={sidebarRef}>
          <div className="flex justify-between items-center mb-4 sm:mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.primary }}>Your Cart</h2>
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={handleDownloadPDF}
                className="text-gray-600 hover:text-gray-800 transition-colors"
                title="Download Cart Summary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={handleClose}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 sm:py-10">
              <p className="text-lg font-medium text-gray-700">Loading cart...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-10">
              <p className="text-lg font-medium text-red-600">Error: {error}</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-8 sm:py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 sm:h-16 w-14 sm:w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg font-medium text-gray-700">Your cart is empty</p>
              <p className="mt-2 text-gray-500">Start shopping to add items to your cart</p>
              <Button
                onClick={handleClose}
                type="secondary"
                className="mt-4"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {cartItems.map(item => (
                <div
                  key={item.cart_id}
                  className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg relative transition-all ${item.is_selected ? 'bg-gray-50' : 'bg-gray-100 opacity-70'}`}
                >
                  <button
                    onClick={() => toggleSelection(item.cart_id)}
                    className={`w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded border mt-1 ${item.is_selected ? 'bg-green-600 border-green-600' : 'border-gray-400'}`}
                  >
                    {item.is_selected && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 sm:h-3 sm:w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <img
                    src={item.image_url || '/placeholder-plant.jpg'}
                    alt={item.plant_name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm sm:text-base text-gray-900">{item.plant_name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Size: {item.size_name || 'Standard'}</p>
                    <p className="text-xs text-gray-500 mb-2">Seller: {item.seller_email}</p>
                    <p className="font-medium text-sm sm:text-base" style={{ color: theme.colors.primary }}>${parseFloat(item.unit_price).toFixed(2)}</p>
                    <div className="flex items-center gap-2 sm:gap-3 mt-2">
                      <button
                        className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition-colors text-xs sm:text-sm"
                        onClick={() => updateItemQuantity(item.cart_id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="w-4 text-center text-sm">{item.quantity}</span>
                      <button
                        className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition-colors text-xs sm:text-sm"
                        onClick={() => updateItemQuantity(item.cart_id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-red-500 transition-colors"
                    onClick={() => removeItem(item.cart_id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}

              <div className="mt-4 sm:mt-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2 text-sm sm:text-base text-gray-700">
                  <span>Subtotal:</span>
                  <span>
                    ${cartItems
                      .filter(item => item.is_selected)
                      .reduce((total, item) => total + (parseFloat(item.unit_price) * item.quantity), 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-2 text-sm sm:text-base text-gray-700">
                  <span>Shipping:</span>
                  <span>$9.95</span>
                </div>
                <div className="flex justify-between font-bold text-base sm:text-lg mt-3 sm:mt-4 pt-3 border-t border-gray-200">
                  <span>Total:</span>
                  <span style={{ color: theme.colors.primary }}>
                    ${(cartItems
                      .filter(item => item.is_selected)
                      .reduce((total, item) => total + (parseFloat(item.unit_price) * item.quantity), 0) + 9.95)
                      .toFixed(2)}
                  </span>
                </div>
                <Button
                  onClick={handleProceedToOrder}
                  className="w-full mt-4 sm:mt-6"
                >
                  Proceed to Order
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;