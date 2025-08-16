// src/pages/orderdashboard/AllOrders.jsx
import { Link } from 'react-router-dom';
import { theme } from '../../theme';

const AllOrders = () => {
  // Sample order data
  const orders = [
    {
      id: 'GC-1001',
      status: 'Delivered',
      date: '2023-06-15',
      items: [
        {
          id: 1,
          name: 'Monstera Deliciosa',
          price: 45,
          image: 'https://images.unsplash.com/photo-1525947088131-b701cd0f6dc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          quantity: 1
        }
      ],
      total: 54.95,
      deliveryMethod: 'Standard Delivery'
    },
    {
      id: 'GC-1002',
      status: 'Shipped',
      date: '2023-06-10',
      items: [
        {
          id: 2,
          name: 'Snake Plant',
          price: 35,
          image: 'https://images.unsplash.com/photo-1586220742613-b731f66f7743?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          quantity: 2
        }
      ],
      total: 79.95,
      deliveryMethod: 'Express Delivery'
    },
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
      deliveryMethod: 'Standard Delivery'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>All Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-4 text-lg text-gray-600">You have no orders yet</p>
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Items */}
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
                  
                  {/* Delivery Information */}
                  <div>
                    <h4 className="font-medium mb-3">Delivery Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Method:</span> {order.deliveryMethod}</p>
                      {order.status === 'Shipped' && (
                        <p><span className="text-gray-500">Tracking #:</span> TRK{order.id.slice(3)}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Order Summary */}
                  <div>
                    <h4 className="font-medium mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Subtotal:</span> ${(order.total - 9.95).toFixed(2)}</p>
                      <p><span className="text-gray-500">Shipping:</span> $9.95</p>
                      <p className="font-medium"><span className="text-gray-500">Total:</span> ${order.total}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t flex justify-end">
                  <Link
                    to={`/orders/${order.id}`}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllOrders;