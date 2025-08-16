import { useLocation, useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import Header from '../components/Header';
import Footer from '../components/Footer';

const OrderConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const receiptRef = useRef();
  const order = state?.order || {
    orderNumber: 'GC-000000',
    orderDate: new Date().toLocaleDateString(),
    items: [],
    deliveryMethod: { name: 'Standard Delivery', price: 9.95, time: '3-5 business days' },
    customerInfo: {},
    deliveryAgent: {}
  };

  const handleDownloadReceipt = () => {
    const element = receiptRef.current;
    const opt = {
      margin: 10,
      filename: `order-receipt-${order.orderNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  const handleContinueShopping = () => {
    navigate('/'); // Navigates to home page
  };

  const calculateTotal = () => {
    const subtotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const delivery = order.deliveryMethod?.price || 0;
    return (subtotal + delivery).toFixed(2);
  };

  return (
    <div className="bg-[#f7f0e1] min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div ref={receiptRef} className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          {/* Order Confirmation Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#224229] mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">Thank you for your purchase</p>
            <p className="text-sm text-gray-500 mt-4">Order #{order.orderNumber} • {order.orderDate}</p>
          </div>

          {/* Order Summary */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#224229] mb-4 pb-2 border-b border-[#e5e7eb]">
              Order Summary
            </h2>
            
            <div className="space-y-4 mb-6">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-[#e5e7eb]">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-[#224229]">{item.name}</h3>
                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="font-medium text-[#224229]">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Seller contact: plantshop@example.com</p>
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

          {/* Delivery Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#224229] mb-4 pb-2 border-b border-[#e5e7eb]">
              Delivery Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-[#224229] mb-2">Shipping To</h3>
                <p className="text-gray-600">{order.customerInfo.name}</p>
                <p className="text-gray-600">{order.customerInfo.address}</p>
                <p className="text-gray-600">{order.customerInfo.phone}</p>
                {order.customerInfo.notes && (
                  <p className="text-gray-600 mt-2">
                    <span className="font-medium">Notes:</span> {order.customerInfo.notes}
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-[#224229] mb-2">Delivery Method</h3>
                <p className="text-gray-600">{order.deliveryMethod?.name}</p>
                <p className="text-gray-600">Estimated delivery: {order.deliveryAgent?.estimatedDelivery}</p>
                
                <div className="mt-4">
                  <h3 className="font-medium text-[#224229] mb-2">Delivery Agent</h3>
                  <p className="text-gray-600">{order.deliveryAgent?.name}</p>
                  <p className="text-gray-600">{order.deliveryAgent?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-[#f0f7f1] p-4 rounded-lg mb-8">
            <h3 className="font-medium text-[#224229] mb-2">What's Next?</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Your delivery agent will contact you to confirm the delivery time</li>
              <li>You'll receive an email with your order details</li>
              <li>Prepare payment for when your items arrive</li>
            </ul>
          </div>

          {/* Support Information */}
          <div className="border-t border-[#e5e7eb] pt-6">
            <h3 className="font-medium text-[#224229] mb-3">Need Help?</h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#224229] text-white rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer Support</p>
                  <p className="font-medium text-[#224229]">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#224229] text-white rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Support</p>
                  <p className="font-medium text-[#224229]">support@greencart.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={handleDownloadReceipt}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#224229] text-[#224229] py-3 px-6 rounded-lg font-medium hover:bg-[#f0f7f1] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Download Receipt
            </button>
            <button
              onClick={handleContinueShopping}
              className="flex-1 bg-[#224229] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#4b6250] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;