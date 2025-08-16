import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { theme } from '../theme';

const Order = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef();
  const [order, setOrder] = useState({
    items: state?.items || [],
    deliveryMethod: null,
    customerInfo: {
      name: '',
      phone: '',
      address: '',
      notes: ''
    },
    deliveryAgent: {
      name: 'John Doe',
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

  const deliveryMethods = [
    { id: 1, name: 'Standard Delivery', price: 9.95, time: '3-5 business days' },
    { id: 2, name: 'Express Delivery', price: 19.95, time: '1-2 business days' },
    { id: 3, name: 'Store Pickup', price: 0, time: 'Ready in 1 hour' }
  ];

  useEffect(() => {
    if (!order.deliveryMethod) {
      setOrder(prev => ({
        ...prev,
        deliveryMethod: deliveryMethods[0],
        deliveryAgent: {
          ...prev.deliveryAgent,
          estimatedDelivery: calculateDeliveryDate(deliveryMethods[0].time)
        }
      }));
    }
  }, []);

  const calculateDeliveryDate = (deliveryTime) => {
    const days = deliveryTime.includes('3-5') ? 5 : 
                deliveryTime.includes('1-2') ? 2 : 0;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDeliveryChange = (method) => {
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

  const handleSubmitOrder = () => {
    if (!order.customerInfo.name || !order.customerInfo.phone || !order.customerInfo.address) {
      alert('Please fill in all required fields');
      return;
    }

    // In a real app, you would submit to backend here
    console.log('Order submitted:', order);
    alert('Order placed successfully!');
    navigate('/order-confirmation', { state: { order } });
  };

  const calculateTotal = () => {
    const subtotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const delivery = order.deliveryMethod?.price || 0;
    return (subtotal + delivery).toFixed(2);
  };

  return (
    <div className="bg-[#f7f0e1] min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Main Order Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-[#224229] mb-4 sm:mb-6">Complete Your Order</h1>
              
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-[#224229] mb-3 sm:mb-4">Delivery Method</h2>
                <div className="space-y-2 sm:space-y-3">
                  {deliveryMethods.map(method => (
                    <div 
                      key={method.id}
                      onClick={() => handleDeliveryChange(method)}
                      className={`p-3 sm:p-4 border rounded-lg cursor-pointer ${
                        order.deliveryMethod?.id === method.id 
                          ? 'border-[#224229] bg-[#f0f7f1]' 
                          : 'border-gray-300 hover:border-[#224229]'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-sm sm:text-base">{method.name}</span>
                        <span className="font-bold text-sm sm:text-base" style={{ color: theme.colors.primary }}>
                          {method.price > 0 ? `$${method.price}` : 'Free'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{method.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-[#224229] mb-3 sm:mb-4">Your Information</h2>
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
                  className="bg-[#224229] text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-bold hover:bg-[#4b6250] transition-colors text-sm sm:text-base"
                >
                  Confirm Order
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
                  {order.items.map(item => (
                    <div key={item.id} className="flex gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-[#e5e7eb]">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-medium text-sm sm:text-base text-[#224229]">{item.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">Size: {item.size}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="font-medium text-sm sm:text-base text-[#224229] mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">Seller: {item.seller}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Subtotal</span>
                    <span className="text-xs sm:text-sm">
                      ${order.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Delivery</span>
                    <span className="text-xs sm:text-sm">
                      {order.deliveryMethod?.price > 0 
                        ? `$${order.deliveryMethod.price}` 
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

              <div className="bg-[#f0f7f1] p-3 sm:p-4 rounded-lg">
                <h3 className="font-medium text-sm sm:text-base text-[#224229] mb-1 sm:mb-2">Customer Support</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Contact us for any questions about your order.</p>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#224229]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#224229]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>support@greencart.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Order;