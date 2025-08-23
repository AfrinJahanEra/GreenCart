// src/pages/orderdashboard/PendingOrders.jsx
import { Link } from 'react-router-dom';
import { theme } from '../../theme';
import React, { useState } from 'react';

const PendingOrders = () => {
  const [orders, setOrders] = useState([
    {
      id: 'GC-1003',
      status: 'Processing',
      date: '2023-06-20',
      items: [
        {
          id: 3,
          name: 'Fiddle Leaf Fig',
          price: 55,
          image: 'https://images.unsplash.com/photo-1534710961216-75c88202f43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          quantity: 1
        }
      ],
      total: 64.95,
      deliveryMethod: 'Standard Delivery',
      estimatedDelivery: 'June 25, 2023',
      customerConfirmed: 0,
      agentConfirmed: 0
    }
  ]);

  const confirmDelivery = async (orderId) => {
    try {
      // Simulate API call to confirm_customer_delivery
      console.log(`Confirming delivery for order ${orderId}`);
      // Update local state (in real app, fetch updated data from backend)
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, customerConfirmed: 1 } : order
      ));
    } catch (error) {
      console.error('Error confirming delivery:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Pending Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-4 text-lg text-gray-600">No pending orders</p>
          <Link
            to="/plants"
            className="mt-4 inline-block bg-[#224229] text-white px-6 py-2 rounded-lg hover:bg-[#4b6250] transition-colors"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b gap-2">
                <div>
                  <h3 className="font-medium">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500">{order.date}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  {order.status}
                </span>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Items</h4>
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div key={item.id} className="flex gap-3">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            <p className="text-sm font-medium" style={{ color: theme.colors.primary }}>${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Delivery Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Method:</span> {order.deliveryMethod}</p>
                      <p><span className="text-gray-500">Est. Delivery:</span> {order.estimatedDelivery}</p>
                      <p><span className="text-gray-500">Customer Confirmed:</span> {order.customerConfirmed ? 'Yes' : 'No'}</p>
                      <p><span className="text-gray-500">Agent Confirmed:</span> {order.agentConfirmed ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Actions</h4>
                    <div className="space-y-2">
                      {!order.customerConfirmed && (
                        <button 
                          onClick={() => confirmDelivery(order.id)}
                          className="w-full bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors text-sm"
                        >
                          Confirm Delivery
                        </button>
                      )}
                      <button className="w-full bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm">
                        Cancel Order
                      </button>
                      <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        Contact Support
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingOrders;