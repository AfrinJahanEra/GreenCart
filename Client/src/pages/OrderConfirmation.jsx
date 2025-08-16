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
    navigate('/');
  };

  const calculateTotal = () => {
    const subtotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const delivery = order.deliveryMethod?.price || 0;
    return (subtotal + delivery).toFixed(2);
  };

  return (
    <div className="bg-[#f7f0e1] min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        <div ref={receiptRef} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
          {/* Order Confirmation Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#224229] mb-2">Order Confirmed!</h1>
            <p className="text-sm sm:text-base text-gray-600">Thank you for your purchase</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">Order #{order.orderNumber} • {order.orderDate}</p>
          </div>

          {/* Order Summary */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-[#224229] mb-3 sm:mb-4 pb-2 border-b border-[#e5e7eb]">
              Order Summary
            </h2>
            
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-[#e5e7eb]">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm sm:text-base text-[#224229]">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Size: {item.size}</p>
                    <div className="flex justify-between items-center mt-1 sm:mt-2">
                      <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="font-medium text-sm sm:text-base text-[#224229]">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Seller contact: plantshop@example.com</p>
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

          {/* Delivery Information */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-[#224229] mb-3 sm:mb-4 pb-2 border-b border-[#e5e7eb]">
              Delivery Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="font-medium text-sm sm:text-base text-[#224229] mb-1 sm:mb-2">Shipping To</h3>
                <p className="text-xs sm:text-sm text-gray-600">{order.customerInfo.name}</p>
                <p className="text-xs sm:text-sm text-gray-600">{order.customerInfo.address}</p>
                <p className="text-xs sm:text-sm text-gray-600">{order.customerInfo.phone}</p>
                {order.customerInfo.notes && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                    <span className="font-medium">Notes:</span> {order.customerInfo.notes}
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-sm sm:text-base text-[#224229] mb-1 sm:mb-2">Delivery Method</h3>
                <p className="text-xs sm:text-sm text-gray-600">{order.deliveryMethod?.name}</p>
                <p className="text-xs sm:text-sm text-gray-600">Estimated delivery: {order.deliveryAgent?.estimatedDelivery}</p>
                
                <div className="mt-2 sm:mt-4">
                  <h3 className="font-medium text-sm sm:text-base text-[#224229] mb-1 sm:mb-2">Delivery Agent</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{order.deliveryAgent?.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{order.deliveryAgent?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-[#f0f7f1] p-3 sm:p-4 rounded-lg mb-6 sm:mb-8">
            <h3 className="font-medium text-sm sm:text-base text-[#224229] mb-1 sm:mb-2">What's Next?</h3>
            <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              <li>Your delivery agent will contact you to confirm the delivery time</li>
              <li>You'll receive an email with your order details</li>
              <li>Prepare payment for when your items arrive</li>
            </ul>
          </div>

          {/* Support Information */}
          <div className="border-t border-[#e5e7eb] pt-4 sm:pt-6">
            <h3 className="font-medium text-sm sm:text-base text-[#224229] mb-2 sm:mb-3">Need Help?</h3>
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#224229] text-white rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Customer Support</p>
                  <p className="font-medium text-sm sm:text-base text-[#224229]">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#224229] text-white rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Email Support</p>
                  <p className="font-medium text-sm sm:text-base text-[#224229]">support@greencart.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              onClick={handleDownloadReceipt}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-white border border-[#224229] text-[#224229] py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-[#f0f7f1] transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Download Receipt
            </button>
            <button
              onClick={handleContinueShopping}
              className="flex-1 bg-[#224229] text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-[#4b6250] transition-colors text-sm sm:text-base"
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