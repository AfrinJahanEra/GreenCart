import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Orders = () => {
  const { orders, assignDeliveryAgent, getAvailableDeliveryAgents, loading, error } = useOutletContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [availableAgents, setAvailableAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Fetch available delivery agents when opening assignment modal
  const fetchAvailableAgents = async () => {
    setLoadingAgents(true);
    try {
      const result = await getAvailableDeliveryAgents();
      if (result.success) {
        setAvailableAgents(result.data);
      } else {
        console.error('Failed to fetch available agents:', result.error);
        setAvailableAgents([]);
      }
    } catch (error) {
      console.error('Error fetching available agents:', error);
      setAvailableAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.order_number?.toString().includes(searchTerm) ||
    order.agent_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignAgent = async (orderId) => {
    const selectedAgentData = selectedAgent ? availableAgents.find(agent => agent.agent_id === selectedAgent) : null;
    
    if (selectedAgent && selectedAgentData) {
      const confirmMessage = `Assign order to ${selectedAgentData.name}?\n\nAgent Details:\n- Email: ${selectedAgentData.email}\n- Phone: ${selectedAgentData.phone}\n- Available Slots: ${selectedAgentData.available_slots}/3\n- Vehicle: ${selectedAgentData.vehicle_type || 'N/A'}\n\nAfter assignment, this agent will have ${selectedAgentData.available_slots - 1} available slots.`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
    } else if (!selectedAgent) {
      if (!confirm('Remove current delivery agent assignment from this order?')) {
        return;
      }
    }
    
    try {
      setAssigning(true);
      console.log('Attempting to assign agent:', { orderId, selectedAgent });
      
      const result = await assignDeliveryAgent(orderId, selectedAgent || null);
      
      console.log('Assignment result:', result);
      
      if (result.success) {
        alert(selectedAgent ? 'Delivery agent assigned successfully!' : 'Order unassigned successfully!');
        setAssigningOrder(null);
        setSelectedAgent('');
        // Refresh available agents to show updated slot counts
        if (selectedAgent) {
          fetchAvailableAgents();
        }
      } else {
        console.error('Assignment failed:', result.error);
        alert(`Failed to assign delivery agent: ${result.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Assignment exception:', error);
      alert(`An error occurred while assigning the delivery agent: ${error.message || 'Please try again later'}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenAssignModal = (orderId, currentAgentId) => {
    setAssigningOrder(orderId);
    setSelectedAgent(currentAgentId || '');
    fetchAvailableAgents(); // Fetch available agents when opening modal
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>Order Management</h1>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute right-3 top-2.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      {loading.orders && <div className="text-center">Loading orders...</div>}
      {error.orders && <div className="text-red-500 mb-4">{error.orders}</div>}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="hidden md:grid grid-cols-12 bg-gray-100 p-3 font-medium">
          <div className="col-span-1">Order ID</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-2">Contact</div>
          <div className="col-span-1">Amount</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Delivery Agent</div>
        </div>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div key={order.order_id} className="grid grid-cols-1 md:grid-cols-12 p-4 border-b gap-4 md:gap-0">
              <div className="md:hidden space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Order ID:</span>
                  <span>#{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Customer:</span>
                  <div className="text-right">
                    <div className="font-medium">{order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.order_date}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Contact:</span>
                  <div className="text-right">
                    <div className="text-sm">{order.customer_email}</div>
                    <div className="text-sm text-gray-500">{order.customer_phone}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span>${order.total_amount?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.order_status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.order_status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                    order.order_status === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.order_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Agent:</span>
                  <span>{order.agent_name || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-medium">Actions:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenAssignModal(order.order_id, order.agent_id)}
                      className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Assign
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="hidden md:grid col-span-1 font-medium items-center">#{order.order_number}</div>
              <div className="hidden md:grid col-span-2 items-center">
                <div className="font-medium">{order.customer_name}</div>
                <div className="text-sm text-gray-500">{order.order_date}</div>
              </div>
              <div className="hidden md:grid col-span-2 items-center">
                <div className="text-sm">{order.customer_email}</div>
                <div className="text-sm text-gray-500">{order.customer_phone}</div>
              </div>
              <div className="hidden md:grid col-span-1 items-center">${order.total_amount?.toFixed(2) || 'N/A'}</div>
              <div className="hidden md:grid col-span-2 items-center">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  order.order_status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.order_status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                  order.order_status === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.order_status}
                </span>
              </div>
              {/* <div className="hidden md:grid col-span-2 items-center">{order.agent_name || 'Unassigned'}</div> */}
              <div className="hidden md:grid col-span-2 items-center flex gap-2">
                <button
                  onClick={() => handleOpenAssignModal(order.order_id, order.agent_id)}
                  className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Assign
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No orders found
          </div>
        )}
      </div>
      {assigningOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold" style={{ color: theme.colors.primary }}>Assign Delivery Agent</h2>
                {(() => {
                  const currentOrder = orders.find(o => o.order_id === assigningOrder);
                  return currentOrder ? (
                    <div className="text-sm text-gray-600 mt-1">
                      Order #{currentOrder.order_number} - {currentOrder.customer_name} - ${currentOrder.total_amount?.toFixed(2)}
                    </div>
                  ) : null;
                })()}
              </div>
              <button onClick={() => setAssigningOrder(null)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>Select Delivery Agent</label>
              {loadingAgents ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#224229] mx-auto"></div>
                  <span className="text-sm text-gray-500 mt-2">Loading available agents...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <div className="border border-gray-300 rounded-lg p-3 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedAgent('')}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Unassign Order</div>
                        <div className="text-sm text-gray-500">Remove current delivery agent assignment</div>
                      </div>
                      <input
                        type="radio"
                        name="agent"
                        value=""
                        checked={selectedAgent === ''}
                        onChange={() => setSelectedAgent('')}
                        className="text-[#224229] focus:ring-[#224229]"
                      />
                    </div>
                  </div>
                  {availableAgents.map(agent => (
                    <div 
                      key={agent.agent_id} 
                      className="border border-gray-300 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedAgent(agent.agent_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-gray-600">{agent.email}</div>
                          <div className="text-sm text-gray-600">{agent.phone}</div>
                          <div className="text-xs text-green-600 mt-1">
                            Available Slots: {agent.available_slots}/3 • Vehicle: {agent.vehicle_type || 'N/A'}
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="agent"
                          value={agent.agent_id}
                          checked={selectedAgent === agent.agent_id}
                          onChange={() => setSelectedAgent(agent.agent_id)}
                          className="text-[#224229] focus:ring-[#224229]"
                        />
                      </div>
                    </div>
                  ))}
                  {availableAgents.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No delivery agents available with free slots
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setAssigningOrder(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
                disabled={assigning}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignAgent(assigningOrder)}
                className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors order-1 sm:order-2 disabled:opacity-50"
                disabled={assigning || (!selectedAgent && selectedAgent !== '')}
              >
                {assigning ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {selectedAgent ? 'Assigning...' : 'Unassigning...'}
                  </div>
                ) : (
                  selectedAgent ? 'Assign Agent' : 'Remove Assignment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;