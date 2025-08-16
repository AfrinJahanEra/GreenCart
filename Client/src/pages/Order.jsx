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
    <div className="bg-[#fbf7ed] min-h-screen font-sans">
      <Header />
      
      <section className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Order Form */}
          <div className="lg:w-2/3">
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">Complete Your Order</h1>
            
            <div className="mb-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Delivery Method</h2>
              <div className="space-y-4">
                {deliveryMethods.map(method => (
                  <div 
                    key={method.id}
                    onClick={() => handleDeliveryChange(method)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                      order.deliveryMethod?.id === method.id 
                        ? 'border-green-600 bg-green-50' 
                        : 'border-gray-200 hover:border-green-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-base">{method.name}</span>
                      <span className="font-semibold text-green-600">
                        {method.price > 0 ? `$${method.price.toFixed(2)}` : 'Free'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{method.time}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-medium text-gray-900 mb-4">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={order.customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={order.customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-base"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
                  <input 
                    type="text" 
                    name="address"
                    value={order.customerInfo.address}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-base"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={order.customerInfo.notes}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-base"
                    rows="4"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button 
                onClick={handleSubmitOrder}
                className="bg-green-600 text-white p-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-base"
              >
                Confirm Order
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div ref={sidebarRef} className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                <button 
                  onClick={handleDownloadPDF}
                  className="text-green-600 hover:text-green-700 transition-colors"
                  title="Download Order Summary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-base text-gray-900">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">Status: <span className="text-green-600 font-medium">{order.status}</span></p>
                  </div>
                  <p className="text-sm text-gray-600">{order.orderDate}</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  {order.items.map(item => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-base text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Size: {item.size}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="font-semibold text-base text-gray-900 mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">Seller: {item.seller}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>
                      ${order.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span>
                      {order.deliveryMethod?.price > 0 
                        ? `$${order.deliveryMethod.price.toFixed(2)}` 
                        : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-green-600">${calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-base text-gray-900 mb-2">Customer Information</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Name:</span> {order.customerInfo.name || 'Your Name'}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Phone:</span> {order.customerInfo.phone || 'Your Phone'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Address:</span> {order.customerInfo.address || 'Your Address'}
                </p>
              </div>

              {order.deliveryMethod && (
                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-base text-gray-900 mb-2">Delivery Information</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Method:</span> {order.deliveryMethod.name}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Estimated Delivery:</span> {order.deliveryAgent.estimatedDelivery}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Agent Contact:</span> {order.deliveryAgent.name} ({order.deliveryAgent.phone})
                  </p>
                </div>
              )}

            
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Order;