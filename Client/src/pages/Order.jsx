import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProfileSidebar from '../components/ProfileSidebar';
import { theme } from '../theme';
import { customerOrdersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Order = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef();
  const { user } = useAuth(); // Use AuthContext
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [order, setOrder] = useState({
    items: state?.items || [],
    cartItems: state?.cartItems || [],
    deliveryMethod: null,
    customerInfo: {
      name: '',
      phone: '',
      address: '',
      notes: ''
    },
    deliveryAgent: {
      name: 'Delivery Agent',
      phone: '+1 (555) 987-6543',
      estimatedDelivery: ''
    },
    orderDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    orderNumber: `GC-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'Processing'
  });

  // Pre-fill user information from AuthContext
  useEffect(() => {
    if (user) {
      setOrder(prev => ({
        ...prev,
        customerInfo: {
          name: user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : prev.customerInfo.name,
          phone: user.phone || prev.customerInfo.phone,
          address: user.address || prev.customerInfo.address,
          notes: prev.customerInfo.notes
        }
      }));
    }
  }, [user]);

  // Fetch delivery methods on component mount
  useEffect(() => {
    const fetchDeliveryMethods = async () => {
      try {
        setLoading(true);
        const response = await customerOrdersAPI.getDeliveryMethods();
        
        console.log('Delivery methods response:', response.data); // Debug log
        
        if (response.data.success) {
          const methods = response.data.methods || [];
          console.log('DEBUG: Received delivery methods:', methods); // Debug log
          setDeliveryMethods(methods);
          
          // Set default delivery method
          if (methods.length > 0) {
            const defaultMethod = methods[0];
            console.log('DEBUG: Setting default delivery method:', defaultMethod); // Debug log
            setOrder(prev => ({
              ...prev,
              deliveryMethod: defaultMethod,
              deliveryAgent: {
                ...prev.deliveryAgent,
                estimatedDelivery: calculateDeliveryDate(defaultMethod.time)
              }
            }));
          } else {
            console.warn('DEBUG: No delivery methods found in response');
          }
        } else {
          console.error('Failed to fetch delivery methods:', response.data.error);
          alert('Failed to load delivery methods: ' + (response.data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error fetching delivery methods:', error);
        alert('Failed to load delivery methods: ' + (error.response?.data?.error || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryMethods();
  }, []);

  const calculateDeliveryDate = (deliveryTime) => {
    // Add null/undefined check to prevent 'includes' error
    if (!deliveryTime || typeof deliveryTime !== 'string') {
      return 'TBD';
    }
    
    // Extract first number from string like "3-5 days" or "1-2 days"
    const match = deliveryTime.match(/\d+/);
    const days = match ? parseInt(match[0]) : 3; // Default to 3 days if no match
    
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDeliveryChange = (method) => {
    console.log('DEBUG: Delivery method selected:', method); // Debug log
    setOrder(prev => ({
      ...prev,
      deliveryMethod: method,
      deliveryAgent: {
        ...prev.deliveryAgent,
        estimatedDelivery: calculateDeliveryDate(method.time)
      }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrder(prev => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        [name]: value
      }
    }));
  };

  const handleProfileUpdate = (updatedInfo) => {
    setOrder(prev => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        ...updatedInfo
      }
    }));
  };

  const handleDownloadPDF = () => {
    const element = sidebarRef.current;
    const opt = {
      margin: 10,
      filename: `order-${order.orderNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  const handleSubmitOrder = async () => {
    console.log('DEBUG: handleSubmitOrder called');
    console.log('DEBUG: Current order state:', order);
    console.log('DEBUG: Delivery method:', order.deliveryMethod);
    
    if (!order.customerInfo.name || !order.customerInfo.phone || !order.customerInfo.address) {
      alert('Please fill in all required fields');
      return;
    }

    if (!order.deliveryMethod) {
      alert('Please select a delivery method');
      return;
    }

    const userId = user?.user_id;
    if (!userId) {
      alert('Please login to place an order');
      return;
    }

    try {
      setLoading(true);
      
      // Create cart IDs string for backend
      const cartIds = order.cartItems.map(item => item.cart_id).join(',');
      console.log('DEBUG: Cart IDs:', cartIds);
      
      const orderData = {
        user_id: userId,
        delivery_method_id: order.deliveryMethod.id,
        delivery_address: order.customerInfo.address,
        delivery_notes: order.customerInfo.notes,
        cart_ids: cartIds
      };
      
      console.log('DEBUG: Sending order data:', orderData);

      const response = await customerOrdersAPI.createOrder(orderData);
      
      if (response.data.success) {
        const completedOrder = {
          ...order,
          orderId: response.data.order_id,
          orderNumber: response.data.order_number || order.orderNumber,
          totalAmount: response.data.total_amount
        };
        
        alert('Order placed successfully!');
        navigate('/order-confirmation', { state: { order: completedOrder } });
      } else {
        throw new Error(response.data.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    // Ensure all values are numbers and handle edge cases
    const subtotal = order.items.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
    
    const delivery = parseFloat(order.deliveryMethod?.price) || 0;
    const total = subtotal + delivery;
    
    // Ensure total is a valid number before calling toFixed
    return isNaN(total) ? '0.00' : total.toFixed(2);
  };

  return (
    <div className="bg-[#fbf7ed] min-h-screen">
      <Header />
      
      <div className="container mx-auto px-2 py-8 sm:py-12 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Main Order Form */}
          <div className="lg:w-2/3">
            <div className="bg-[#fbf7ed] rounded-lg shadow-sm p-2 sm:p-6 mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-[#224229] mb-4 sm:mb-6">Complete Your Order</h1>
              
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-[#224229] mb-3 sm:mb-4">Delivery Method</h2>
                {loading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Loading delivery methods...</p>
                  </div>
                ) : deliveryMethods.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-red-600">No delivery methods available</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {deliveryMethods.map(method => (
                      <div 
                        key={method.id}
                        onClick={() => handleDeliveryChange(method)}
                        className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                          order.deliveryMethod?.id === method.id 
                            ? 'border-[#224229] bg-[#f0f7f1]' 
                            : 'border-gray-300 hover:border-[#224229]'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium text-sm sm:text-base">{method.name}</span>
                          <span className="font-bold text-sm sm:text-base" style={{ color: theme.colors.primary }}>
                            {method.price && parseFloat(method.price) > 0 ? `$${parseFloat(method.price).toFixed(2)}` : 'Free'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {method.time || 'Delivery time not specified'}
                        </p>
                        {method.description && (
                          <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-[#224229]">Your Information</h2>
                  <button
                    type="button"
                    onClick={() => setShowProfileSidebar(true)}
                    className="text-sm text-[#224229] hover:text-[#4b6250] font-medium underline"
                  >
                    Edit Profile
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2" style={{ color: theme.colors.primary }}>Full Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      value={order.customerInfo.name}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#d1d5db] rounded-lg focus:ring-2 focus:ring-[#224229] focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2" style={{ color: theme.colors.primary }}>Phone Number *</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={order.customerInfo.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#d1d5db] rounded-lg focus:ring-2 focus:ring-[#224229] focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2" style={{ color: theme.colors.primary }}>Delivery Address *</label>
                    <input 
                      type="text" 
                      name="address"
                      value={order.customerInfo.address}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#d1d5db] rounded-lg focus:ring-2 focus:ring-[#224229] focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2" style={{ color: theme.colors.primary }}>Delivery Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={order.customerInfo.notes}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#d1d5db] rounded-lg focus:ring-2 focus:ring-[#224229] focus:border-transparent text-sm sm:text-base"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleSubmitOrder}
                  disabled={loading}
                  className={`px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-colors ${
                    loading 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-[#224229] text-white hover:bg-[#4b6250]'
                  }`}
                >
                  {loading ? 'Processing...' : 'Confirm Order'}
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div ref={sidebarRef} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[#e5e7eb]">
                <h2 className="text-lg sm:text-xl font-semibold text-[#224229]">Order Details</h2>
                <button 
                  onClick={handleDownloadPDF}
                  className="text-[#224229] hover:text-[#4b6250]"
                  title="Download Order Summary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div>
                    <h3 className="font-medium text-sm sm:text-base text-[#224229]">Order #{order.orderNumber}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Status: <span className="text-[#224229] font-medium">{order.status}</span></p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">{order.orderDate}</p>
                </div>
                
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  {order.items.map((item, index) => (
                    <div key={item.cart_id || item.id || index} className="flex gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-[#e5e7eb]">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-medium text-sm sm:text-base text-[#224229]">{item.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">Size: {item.size}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="font-medium text-sm sm:text-base text-[#224229] mt-1">
                          ${((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Seller: {item.seller}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Subtotal</span>
                    <span className="text-xs sm:text-sm">
                      ${order.items.reduce((total, item) => {
                        const price = parseFloat(item.price) || 0;
                        const quantity = parseInt(item.quantity) || 0;
                        return total + (price * quantity);
                      }, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Delivery</span>
                    <span className="text-xs sm:text-sm">
                      {order.deliveryMethod?.price && parseFloat(order.deliveryMethod.price) > 0
                        ? `$${parseFloat(order.deliveryMethod.price).toFixed(2)}` 
                        : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base sm:text-lg pt-2 sm:pt-3 border-t border-[#e5e7eb] mt-2 sm:mt-3">
                    <span>Total</span>
                    <span className="text-[#224229]">${calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#f0f7f1] p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                <h3 className="font-medium text-sm sm:text-base text-[#224229] mb-1 sm:mb-2">Customer Information</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  <span className="font-medium">Name:</span> {order.customerInfo.name || '[Your Name]'}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  <span className="font-medium">Phone:</span> {order.customerInfo.phone || '[Your Phone]'}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">Address:</span> {order.customerInfo.address || '[Your Address]'}
                </p>
              </div>

              {order.deliveryMethod && (
                <div className="bg-[#f0f7f1] p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                  <h3 className="font-medium text-sm sm:text-base text-[#224229] mb-1 sm:mb-2">Delivery Information</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    <span className="font-medium">Method:</span> {order.deliveryMethod.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    <span className="font-medium">Estimated Delivery:</span> {order.deliveryAgent.estimatedDelivery}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="font-medium">Agent Contact:</span> {order.deliveryAgent.name} ({order.deliveryAgent.phone})
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      {/* Profile Sidebar */}
      <ProfileSidebar 
        isOpen={showProfileSidebar}
        onClose={() => setShowProfileSidebar(false)}
        onUpdateInfo={handleProfileUpdate}
      />
    </div>
  );
};

export default Order;