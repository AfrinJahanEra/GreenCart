import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Sales = () => {
  const { users, onAddUser, onDeleteUser } = useOutletContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSalesRep, setNewSalesRep] = useState({
    name: '',
    email: '',
    phone: '',
    commissionRate: 10
  });

  const filteredSalesReps = users.salesReps.filter(rep =>
    rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSalesRep(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSalesRep = (e) => {
    e.preventDefault();
    onAddUser('salesReps', { ...newSalesRep, sales: 0, earnings: 0 });
    setShowAddModal(false);
    setNewSalesRep({
      name: '',
      email: '',
      phone: '',
      commissionRate: 10
    });
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>Sales Team Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors w-full md:w-auto"
        >
          Add New Sales Rep
        </button>
      </div>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search sales reps..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header - hidden on mobile */}
        <div className="hidden md:grid grid-cols-12 bg-gray-100 p-3 font-medium">
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Contact</div>
          <div className="col-span-2">Commission</div>
          <div className="col-span-2">Performance</div>
          <div className="col-span-2">Actions</div>
        </div>
        
        {filteredSalesReps.length > 0 ? (
          filteredSalesReps.map(rep => (
            <div key={rep.id} className="grid grid-cols-1 md:grid-cols-12 p-4 border-b gap-4 md:gap-0">
              {/* Mobile view */}
              <div className="md:hidden space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{rep.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Contact:</span>
                  <div className="text-right">
                    <div className="text-sm">{rep.email}</div>
                    <div className="text-sm text-gray-500">{rep.phone}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Commission:</span>
                  <span>{rep.commissionRate || 10}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Performance:</span>
                  <div className="text-right">
                    <div>{rep.sales} sales</div>
                    <div className="text-sm text-gray-500">${rep.earnings}</div>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-medium">Actions:</span>
                  <div className="flex gap-2">
                    <button className="text-blue-500 hover:text-blue-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => onDeleteUser('salesReps', rep.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Desktop view */}
              <div className="hidden md:grid col-span-3 font-medium items-center">{rep.name}</div>
              <div className="hidden md:grid col-span-3 items-center">
                <div>{rep.email}</div>
                <div className="text-sm text-gray-500">{rep.phone}</div>
              </div>
              <div className="hidden md:grid col-span-2 items-center">{rep.commissionRate || 10}%</div>
              <div className="hidden md:grid col-span-2 items-center">
                <div>{rep.sales} sales</div>
                <div className="text-sm text-gray-500">${rep.earnings}</div>
              </div>
              <div className="hidden md:grid col-span-2 items-center flex gap-2">
                <button className="text-blue-500 hover:text-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  onClick={() => onDeleteUser('salesReps', rep.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No sales representatives found
          </div>
        )}
      </div>
      
      {/* Add Sales Rep Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: theme.colors.primary }}>Add Sales Representative</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddSalesRep}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={newSalesRep.name}
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
                  value={newSalesRep.email}
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
                  value={newSalesRep.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.primary }}>Commission Rate (%)</label>
                <input
                  type="number"
                  name="commissionRate"
                  value={newSalesRep.commissionRate}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
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
                  Add Sales Rep
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;