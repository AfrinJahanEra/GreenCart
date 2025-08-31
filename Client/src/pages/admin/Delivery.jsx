import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Delivery = () => {
  const { deliveryAgents, loading, error } = useOutletContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle: 'Bike',
  });

  const filteredAgents = Array.isArray(deliveryAgents)
    ? deliveryAgents.filter(agent => {
        const fullName = `${agent.first_name || ''} ${agent.last_name || ''}`.toLowerCase();
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.phone?.includes(searchTerm)
        );
      })
    : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAgent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAgent = (e) => {
    e.preventDefault();
    console.log('Add delivery agent:', newAgent);
    setShowAddModal(false);
    setNewAgent({ name: '', email: '', phone: '', vehicle: 'Bike' });
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>Delivery Personnel</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors w-full md:w-auto"
        >
          Add New Agent
        </button>
      </div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search delivery agents..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {loading.deliveryAgents && <div className="text-center">Loading delivery agents...</div>}
      {error.deliveryAgents && <div className="text-red-500 mb-4">{error.deliveryAgents}</div>}
      {!Array.isArray(deliveryAgents) && !loading.deliveryAgents && !error.deliveryAgents && (
        <div className="text-red-500 mb-4">Error: Delivery agents data is not in the expected format</div>
      )}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="hidden md:grid grid-cols-12 bg-gray-100 p-3 font-medium">
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Contact</div>
          <div className="col-span-2">Vehicle</div>
          <div className="col-span-2">Deliveries</div>
          <div className="col-span-2">Status</div>
        </div>
        {filteredAgents.length > 0 ? (
          filteredAgents.map(agent => (
            <div key={agent.user_id || agent.agent_id} className="grid grid-cols-1 md:grid-cols-12 p-4 border-b gap-4 md:gap-0">
              <div className="md:hidden space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{`${agent.first_name || ''} ${agent.last_name || ''}`.trim() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Contact:</span>
                  <div className="text-right">
                    <div className="text-sm">{agent.email || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{agent.phone || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Vehicle:</span>
                  <span>{agent.vehicle_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Deliveries:</span>
                  <div className="text-right">
                    <div>{agent.activity_count || 0}</div>
                    <div className="text-sm text-gray-500">Active: {agent.is_active ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-medium">Status:</span>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      agent.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden md:grid col-span-3 font-medium items-center">
                {`${agent.first_name || ''} ${agent.last_name || ''}`.trim() || 'N/A'}
              </div>
              <div className="hidden md:grid col-span-3 items-center">
                <div>{agent.email || 'N/A'}</div>
                <div className="text-sm text-gray-500">{agent.phone || 'N/A'}</div>
              </div>
              <div className="hidden md:grid col-span-2 items-center">{agent.vehicle_type || 'N/A'}</div>
              <div className="hidden md:grid col-span-2 items-center">
                <div>{agent.activity_count || 0}</div>
                <div className="text-sm text-gray-500">Active: {agent.is_active ? 'Yes' : 'No'}</div>
              </div>
              <div className="hidden md:grid col-span-2 items-center flex gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  agent.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {agent.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No delivery agents found
          </div>
        )}
      </div>
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: theme.colors.primary }}>Add Delivery Agent</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddAgent}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={newAgent.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newAgent.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={newAgent.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Vehicle Type</label>
                <select
                  name="vehicle"
                  value={newAgent.vehicle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Bike">Bike</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Car">Car</option>
                  <option value="Van">Van</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors order-1 sm:order-2"
                >
                  Add Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Delivery;