// src/pages/admin/Orders.jsx
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Orders = () => {
  const { users, onUpdateUser } = useOutletContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('');

  // Combine orders with customer and delivery agent info
  const ordersWithDetails = users.orders.map(order => {
    const customer = users.customers.find(c => c.name === order.customer) || {};
    const agent = users.deliveryAgents.find(a => a.id === order.assignedAgent) || {};
    return {
      ...order,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      agentName: agent.name || 'Unassigned'
    };
  });

  const filteredOrders = ordersWithDetails.filter(order =>
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm) ||
    order.agentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignAgent = (orderId) => {
    const order = users.orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrder = {
      ...order,
      assignedAgent: selectedAgent,
      status: selectedAgent ? 'Assigned' : 'Processing'
    };

    // Update the order in the users context
    const updatedOrders = users.orders.map(o => 
      o.id === orderId ? updatedOrder : o
    );

    onUpdateUser('orders', updatedOrders);
    setAssigningOrder(null);
    setSelectedAgent('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>Order Management</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-100 p-3 font-medium">
          <div className="col-span-1">Order ID</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-2">Contact</div>
          <div className="col-span-1">Amount</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Delivery Agent</div>
          <div className="col-span-2">Actions</div>
        </div>

        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div key={order.id} className="grid grid-cols-12 p-3 border-b items-center">
              <div className="col-span-1 font-medium">#{order.id}</div>
              <div className="col-span-2">
                <div className="font-medium">{order.customer}</div>
                <div className="text-sm text-gray-500">{order.date}</div>
              </div>
              <div className="col-span-2">
                <div>{order.customerEmail}</div>
                <div className="text-sm text-gray-500">{order.customerPhone}</div>
              </div>
              <div className="col-span-1">${order.amount}</div>
              <div className="col-span-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="col-span-2">
                {order.agentName}
              </div>
              <div className="col-span-2 flex gap-2">
                <button
                  onClick={() => {
                    setAssigningOrder(order.id);
                    setSelectedAgent(order.assignedAgent || '');
                  }}
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

      {/* Assign Delivery Agent Modal */}
      {assigningOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: theme.colors.primary }}>
                Assign Delivery Agent for Order #{assigningOrder}
              </h2>
              <button 
                onClick={() => setAssigningOrder(null)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>
                Select Delivery Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">-- Unassigned --</option>
                {users.deliveryAgents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.vehicle})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAssigningOrder(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignAgent(assigningOrder)}
                className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors"
              >
                Assign Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;