// src/pages/orderdashboard/AllOrders.jsx
import { Link } from 'react-router-dom';
import { theme } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomerOrders } from '../../hooks/useCustomerOrders';

const AllOrders = () => {
  const { user } = useAuth();
  const { orders, loading, error } = useCustomerOrders(user?.user_id);

  if (loading.all) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>All Orders</h1>
        <div className="space-y-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error.all) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>All Orders</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error.all}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>All Orders ({orders.all.length})</h1>
      
      {orders.all.length === 0 ? (
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
          {orders.all.map(order => (
            <div key={order.order_id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b gap-2">
                <div>
                  <h3 className="font-medium">Order #{order.order_number}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.order_date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.order_status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.order_status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                  order.order_status === 'Out for Delivery' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.order_status}
                </span>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-3">Items</h4>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">{order.items_summary}</p>
                      {order.primary_image && (
                        <img 
                          src={order.primary_image} 
                          alt="Order items" 
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Delivery Information */}
                  <div>
                    <h4 className="font-medium mb-3">Delivery Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Method:</span> {order.delivery_method}</p>
                      <p><span className="text-gray-500">Address:</span> {order.delivery_address}</p>
                      {order.tracking_number && (
                        <p><span className="text-gray-500">Tracking #:</span> {order.tracking_number}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Order Summary */}
                  <div>
                    <h4 className="font-medium mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Items:</span> {order.item_count}</p>
                      <p className="font-medium"><span className="text-gray-500">Total:</span> ${order.total_amount}</p>
                      {order.order_status === 'Out for Delivery' && (
                        <p className="text-sm text-orange-600">
                          {order.agent_confirmed ? 'Agent confirmed - Waiting for you' : 'Waiting for agent confirmation'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t flex justify-end">
                  <Link
                    to={`/orders/details/${order.order_id}`}
                    state={{ order }}
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