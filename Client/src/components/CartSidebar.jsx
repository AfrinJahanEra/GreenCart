import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

const CartSidebar = ({ showCart, setShowCart }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef();
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Bromeliad Pineapple',
      price: 54,
      image: 'https://images.unsplash.com/photo-1591958911319-0fe5a7f04319?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      size: 'Small',
      quantity: 1,
      selected: true,
      seller: 'plantguru@example.com'
    },
    {
      id: 2,
      name: 'Snake Plant',
      price: 65,
      image: 'https://images.unsplash.com/photo-1591958911319-0fe5a7f04319?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      size: 'Medium',
      quantity: 1,
      selected: true,
      seller: 'greenthumb@example.com'
    }
  ]);

  const toggleSelection = (id) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
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
    const selectedItems = cartItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      alert('Please select at least one item to proceed');
      return;
    }
    setShowCart(false);
    navigate('/order', { state: { items: selectedItems } });
  };

  if (!showCart) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={() => setShowCart(false)}
      ></div>
      
      <div className="fixed top-0 right-0 w-full md:w-1/2 lg:w-1/3 h-full bg-[#224229] text-white z-50 overflow-y-auto">
        <div className="p-6" ref={sidebarRef}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Cart</h2>
            <div className="flex gap-4">
              <button 
                onClick={handleDownloadPDF}
                className="text-white hover:text-[#f7f0e1]"
                title="Download Cart Summary"
              >
                <i className="fas fa-download"></i>
              </button>
              <button 
                onClick={() => setShowCart(false)}
                className="text-2xl hover:text-[#f7f0e1]"
              >
                &times;
              </button>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-10">
              <i className="fas fa-shopping-cart text-4xl mb-4 opacity-50"></i>
              <p className="text-lg">Your cart is empty</p>
              <p className="mt-2 text-[#f7f0e1]">Start shopping to add items to your cart</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-start gap-4 p-4 rounded-lg relative ${item.selected ? 'bg-[#2d5133]' : 'bg-[#224229] opacity-70'}`}
                >
                  <button 
                    onClick={() => toggleSelection(item.id)}
                    className={`w-5 h-5 flex items-center justify-center rounded border ${item.selected ? 'bg-[#f7f0e1] border-[#f7f0e1]' : 'border-white'}`}
                  >
                    {item.selected && <i className="fas fa-check text-[#224229] text-xs"></i>}
                  </button>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-[#f7f0e1] text-sm mb-1">Size: {item.size}</p>
                    <p className="text-[#f7f0e1] text-xs mb-2">Seller: {item.seller}</p>
                    <p className="font-medium">${item.price}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        className="w-6 h-6 flex items-center justify-center bg-[#224229] rounded hover:bg-[#1a3320]"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <button 
                        className="w-6 h-6 flex items-center justify-center bg-[#224229] rounded hover:bg-[#1a3320]"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button 
                    className="absolute top-4 right-4 text-red-300 hover:text-red-400"
                    onClick={() => removeItem(item.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
              
              <div className="mt-6 border-t border-[#f7f0e1] pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>
                    ${cartItems
                      .filter(item => item.selected)
                      .reduce((total, item) => total + (item.price * item.quantity), 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping:</span>
                  <span>$9.95</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4">
                  <span>Total:</span>
                  <span>
                    ${(cartItems
                      .filter(item => item.selected)
                      .reduce((total, item) => total + (item.price * item.quantity), 0) + 9.95)
                      .toFixed(2)}
                  </span>
                </div>
                <button 
                  onClick={handleProceedToOrder}
                  className="w-full bg-[#f7f0e1] text-[#224229] py-3 rounded-lg font-bold mt-4 hover:bg-[#e5dcc9] transition-colors"
                >
                  Proceed to Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;