import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Order Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h1 className="text-2xl font-bold text-[#224229] mb-6">Complete Your Order</h1>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#224229] mb-4">Delivery Method</h2>
                <div className="space-y-3">
                  {deliveryMethods.map(method => (
                    <div 
                      key={method.id}
                      onClick={() => handleDeliveryChange(method)}
                      className={`p-4 border rounded-lg cursor-pointer ${
                        order.deliveryMethod?.id === method.id 
                          ? 'border-[#224229] bg-[#f0f7f1]' 
                          : 'border-gray-300 hover:border-[#224229]'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{method.name}</span>
                        <span className="text-[#224229] font-bold">
                          {method.price > 0 ? `$${method.price}` : 'Free'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{method.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#224229] mb-4">Your Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#224229] mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      value={order.customerInfo.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg focus:ring-2 focus:ring-[#224229] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#224229] mb-2">Phone Number *</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={order.customerInfo.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg focus:ring-2 focus:ring-[#224229] focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#224229] mb-2">Delivery Address *</label>
                    <input 
                      type="text" 
                      name="address"
                      value={order.customerInfo.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg focus:ring-2 focus:ring-[#224229] focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#224229] mb-2">Delivery Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={order.customerInfo.notes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg focus:ring-2 focus:ring-[#224229] focus:border-transparent"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleSubmitOrder}
                  className="bg-[#224229] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#4b6250] transition-colors"
                >
                  Confirm Order
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div ref={sidebarRef} className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#e5e7eb]">
                <h2 className="text-xl font-semibold text-[#224229]">Order Details</h2>
                <button 
                  onClick={handleDownloadPDF}
                  className="text-[#224229] hover:text-[#4b6250]"
                  title="Download Order Summary"
                >
                  <i className="fas fa-download"></i>
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-[#224229]">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">Status: <span className="text-[#224229] font-medium">{order.status}</span></p>
                  </div>
                  <p className="text-sm text-gray-600">{order.orderDate}</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  {order.items.map(item => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-[#e5e7eb]">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-medium text-[#224229]">{item.name}</h4>
                        <p className="text-sm text-gray-600">Size: {item.size}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="font-medium text-[#224229] mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">Seller: {item.seller}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>
                      ${order.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span>
                      {order.deliveryMethod?.price > 0 
                        ? `$${order.deliveryMethod.price}` 
                        : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-[#e5e7eb] mt-3">
                    <span>Total</span>
                    <span className="text-[#224229]">${calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#f0f7f1] p-4 rounded-lg mb-6">
                <h3 className="font-medium text-[#224229] mb-2">Customer Information</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Name:</span> {order.customerInfo.name || '[Your Name]'}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Phone:</span> {order.customerInfo.phone || '[Your Phone]'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Address:</span> {order.customerInfo.address || '[Your Address]'}
                </p>
              </div>

              {order.deliveryMethod && (
                <div className="bg-[#f0f7f1] p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-[#224229] mb-2">Delivery Information</h3>
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

              <div className="bg-[#f0f7f1] p-4 rounded-lg">
                <h3 className="font-medium text-[#224229] mb-2">Customer Support</h3>
                <p className="text-sm text-gray-600 mb-3">Contact us for any questions about your order.</p>
                <div className="flex items-center gap-2 text-sm">
                  <i className="fas fa-phone text-[#224229]"></i>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <i className="fas fa-envelope text-[#224229]"></i>
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