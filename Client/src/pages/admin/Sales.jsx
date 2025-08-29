import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Sales = () => {
  const { salesReps, loading, error, refreshAllData } = useOutletContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSalesRep, setNewSalesRep] = useState({
    name: '',
    email: '',
    phone: '',
    commissionRate: 10,
  });

  const filteredSalesReps = Array.isArray(salesReps)
    ? salesReps.filter(rep => {
        const fullName = `${rep.first_name || ''} ${rep.last_name || ''}`.toLowerCase();
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          rep.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rep.phone?.includes(searchTerm)
        );
      })
    : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSalesRep(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSalesRep = (e) => {
    e.preventDefault();
    // Note: Backend does not provide an endpoint to add sales reps
    console.log('Add sales rep:', newSalesRep);
    setShowAddModal(false);
    setNewSalesRep({ name: '', email: '', phone: '', commissionRate: 10 });
  };

  const handleRetry = () => {
    refreshAllData();
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>Sales Team Management</h1>
        <div className="flex gap-2">
          <button
            onClick={refreshAllData}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors"
          >
            Add New Sales Rep
          </button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search sales reps by name, email, or phone..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error.salesReps && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-red-700">{error.salesReps}</span>
            </div>
            <button
              onClick={handleRetry}
              className="text-red-700 hover:text-red-900 underline text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {loading.salesReps ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#224229]"></div>
          <span className="ml-2">Loading sales team...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="hidden md:grid grid-cols-12 bg-gray-100 p-3 font-medium">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-2">Commission</div>
            <div className="col-span-2">Performance</div>
            <div className="col-span-2">Actions</div>
          </div>
          
          {filteredSalesReps.length > 0 ? (
            filteredSalesReps.map(rep => (
              <div key={rep.user_id} className="grid grid-cols-1 md:grid-cols-12 p-4 border-b gap-4 md:gap-0">
                <div className="md:hidden space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{`${rep.first_name} ${rep.last_name}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Contact:</span>
                    <div className="text-right">
                      <div className="text-sm">{rep.email}</div>
                      <div className="text-sm text-gray-500">{rep.phone || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Commission:</span>
                    <span>10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Performance:</span>
                    <div className="text-right">
                      <div>{rep.activity_count || 0} sales</div>
                      <div className="text-sm text-gray-500">${rep.earnings || 0}</div>
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
                    </div>
                  </div>
                </div>
                
                <div className="hidden md:grid col-span-3 font-medium items-center">
                  {`${rep.first_name} ${rep.last_name}`}
                </div>
                <div className="hidden md:grid col-span-3 items-center">
                  <div>{rep.email}</div>
                  <div className="text-sm text-gray-500">{rep.phone || 'N/A'}</div>
                </div>
                <div className="hidden md:grid col-span-2 items-center">10%</div>
                <div className="hidden md:grid col-span-2 items-center">
                  <div>{rep.activity_count || 0} sales</div>
                  <div className="text-sm text-gray-500">${rep.earnings || 0}</div>
                </div>
                <div className="hidden md:grid col-span-2 items-center flex gap-2">
                  <button className="text-blue-500 hover:text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No sales representatives found matching your search' : 'No sales representatives found'}
            </div>
          )}
        </div>
      )}

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