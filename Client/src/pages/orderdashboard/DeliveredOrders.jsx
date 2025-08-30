// src/pages/orderdashboard/DeliveredOrders.jsx
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { theme } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomerOrders } from '../../hooks/useCustomerOrders';

const DeliveredOrders = () => {
  const { user } = useAuth();
  const { orders, loading, error, addReview } = useCustomerOrders(user?.user_id);
  const [showReviewForm, setShowReviewForm] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, reviewText: '' });

  const handleReviewSubmit = async (orderId, plantId) => {
    const result = await addReview({
      plant_id: plantId,
      order_id: orderId,
      rating: reviewData.rating,
      review_text: reviewData.reviewText
    });
    
    if (result.success) {
      setShowReviewForm(null);
      setReviewData({ rating: 5, reviewText: '' });
    }
  };

  if (loading.completedForReview) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Delivered Orders</h1>
        <div className="space-y-6">
          {[1, 2].map((n) => (
            <div key={n} className="border rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error.completedForReview) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Delivered Orders</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error.completedForReview}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>
        Delivered Orders ({orders.completedForReview.length})
      </h1>
      
      {orders.completedForReview.length === 0 ? (
        <div className="text-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-4 text-lg text-gray-600">No delivered orders yet</p>
          <Link
            to="/plants"
            className="mt-4 inline-block bg-[#224229] text-white px-6 py-2 rounded-lg hover:bg-[#4b6250] transition-colors"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.completedForReview.map(order => (
            <div key={order.order_id} className="border rounded-lg overflow-hidden">
              <div className="bg-green-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-green-200 gap-2">
                <div>
                  <h3 className="font-medium">Order #{order.order_number}</h3>
                  <p className="text-sm text-green-600">
                    Delivered on {new Date(order.actual_delivery_date).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Delivered
                </span>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Summary */}
                  <div>
                    <h4 className="font-medium mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Order Date:</span> {new Date(order.order_date).toLocaleDateString()}</p>
                      <p><span className="text-gray-500">Total Amount:</span> ${order.total_amount}</p>
                      <p><span className="text-gray-500">Delivery Confirmed:</span> Yes</p>
                    </div>
                  </div>
                  
                  {/* Items for Review */}
                  <div className="lg:col-span-2">
                    <h4 className="font-medium mb-3">Rate Your Plants</h4>
                    <div className="space-y-4">
                      {order.items?.map(item => (
                        <div key={item.plant_id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{item.plant_name}</h5>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              <p className="text-sm text-gray-600">Size: {item.size_name}</p>
                            </div>
                            {item.has_review ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Reviewed
                              </span>
                            ) : (
                              <button
                                onClick={() => setShowReviewForm(`${order.order_id}-${item.plant_id}`)}
                                className="bg-[#224229] text-white px-3 py-1 rounded text-sm hover:bg-[#4b6250]"
                              >
                                Add Review
                              </button>
                            )}
                          </div>
                          
                          {showReviewForm === `${order.order_id}-${item.plant_id}` && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <h6 className="font-medium mb-2">Review {item.plant_name}</h6>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm mb-1">Rating</label>
                                  <select
                                    value={reviewData.rating}
                                    onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                                    className="w-full p-2 border rounded"
                                  >
                                    {[1, 2, 3, 4, 5].map(rating => (
                                      <option key={rating} value={rating}>
                                        {rating} Star{rating > 1 ? 's' : ''}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm mb-1">Review</label>
                                  <textarea
                                    value={reviewData.reviewText}
                                    onChange={(e) => setReviewData({ ...reviewData, reviewText: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                    placeholder="Share your experience with this plant..."
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleReviewSubmit(order.order_id, item.plant_id)}
                                    disabled={loading.addReview}
                                    className="bg-[#224229] text-white px-4 py-2 rounded hover:bg-[#4b6250] disabled:bg-gray-400"
                                  >
                                    {loading.addReview ? 'Submitting...' : 'Submit Review'}
                                  </button>
                                  <button
                                    onClick={() => setShowReviewForm(null)}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t flex justify-end">
                  <Link
                    to={`/orders/details/${order.order_id}`}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    View Order Details
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

export default DeliveredOrders;