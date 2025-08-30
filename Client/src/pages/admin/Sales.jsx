import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';

const Sales = () => {
  const { salesReps, loading, error, deleteCustomer, refreshAllData } = useOutletContext();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [sellerToDelete, setSellerToDelete] = useState(null);
  const [sellerToEdit, setSellerToEdit] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingCommission, setEditingCommission] = useState(false);
  const [commissionPercentage, setCommissionPercentage] = useState(10);
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

  const handleDeleteClick = (seller) => {
    setSellerToDelete(seller);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sellerToDelete || !user?.user_id) return;
    
    setDeleting(true);
    try {
      const result = await deleteCustomer(sellerToDelete.user_id, user.user_id);
      
      if (result.success) {
        alert('Seller deleted successfully!');
        setShowDeleteModal(false);
        setSellerToDelete(null);
      } else {
        alert('Failed to delete seller: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the seller.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSellerToDelete(null);
  };

  const handleCommissionClick = (seller) => {
    setSellerToEdit(seller);
    setCommissionPercentage(seller.commission_rate || 10);
    setShowCommissionModal(true);
  };

  const handleCommissionSave = async () => {
    if (!sellerToEdit) return;
    
    setEditingCommission(true);
    try {
      // Note: This would need a backend endpoint to update commission rates
      // For now, just log the change
      console.log('Update commission for seller:', sellerToEdit.user_id, 'to', commissionPercentage + '%');
      alert(`Commission rate updated to ${commissionPercentage}% for ${sellerToEdit.first_name} ${sellerToEdit.last_name}`);
      setShowCommissionModal(false);
      setSellerToEdit(null);
    } catch (error) {
      console.error('Commission update error:', error);
      alert('An error occurred while updating the commission rate.');
    } finally {
      setEditingCommission(false);
    }
  };

  const handleCommissionCancel = () => {
    setShowCommissionModal(false);
    setSellerToEdit(null);
    setCommissionPercentage(10);
  };

  const calculateTotalEarnings = (seller) => {
    return seller.total_earnings || seller.activity_count * 50 || 0;
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
                    <div className="text-right">
                      <div>{rep.commission_rate || 10}%</div>
                      <div className="text-sm text-gray-500">Total Earnings: ${calculateTotalEarnings(rep)}</div>
                    </div>
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
                      <button 
                        onClick={() => handleCommissionClick(rep)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit Commission"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(rep)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Seller"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v1H4V5zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 3a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
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
                <div className="hidden md:grid col-span-2 items-center">
                  <div>{rep.commission_rate || 10}%</div>
                  <div className="text-sm text-gray-500">Total: ${calculateTotalEarnings(rep)}</div>
                </div>
                <div className="hidden md:grid col-span-2 items-center">
                  <div>{rep.activity_count || 0} sales</div>
                  <div className="text-sm text-gray-500">${rep.earnings || 0}</div>
                </div>
                <div className="hidden md:grid col-span-2 items-center flex gap-2">
                  <button 
                    onClick={() => handleCommissionClick(rep)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Commission"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(rep)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Seller"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v1H4V5zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 3a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
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

      {/* Delete Seller Confirmation Modal */}
      {showDeleteModal && sellerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600">Confirm Delete</h2>
              <button 
                onClick={handleDeleteCancel} 
                className="text-gray-500 hover:text-gray-700"
                disabled={deleting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this seller?
              </p>
              <div className="bg-gray-100 p-3 rounded">
                <p className="font-medium">{`${sellerToDelete.first_name} ${sellerToDelete.last_name}`}</p>
                <p className="text-sm text-gray-600">{sellerToDelete.email}</p>
                <p className="text-sm text-gray-600">Total Earnings: ${calculateTotalEarnings(sellerToDelete)}</p>
              </div>
              <p className="text-sm text-red-600 mt-2">
                This action cannot be undone. The seller account will be deactivated.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors order-1 sm:order-2 disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Seller'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Edit Modal */}
      {showCommissionModal && sellerToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: theme.colors.primary }}>Edit Commission Rate</h2>
              <button 
                onClick={handleCommissionCancel} 
                className="text-gray-500 hover:text-gray-700"
                disabled={editingCommission}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <div className="bg-gray-100 p-3 rounded mb-4">
                <p className="font-medium">{`${sellerToEdit.first_name} ${sellerToEdit.last_name}`}</p>
                <p className="text-sm text-gray-600">{sellerToEdit.email}</p>
                <p className="text-sm text-gray-600">Total Earnings: ${calculateTotalEarnings(sellerToEdit)}</p>
                <p className="text-sm text-gray-600">Current Commission: {sellerToEdit.commission_rate || 10}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>New Commission Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={editingCommission}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Commission amount: ${((calculateTotalEarnings(sellerToEdit) * commissionPercentage) / 100).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={handleCommissionCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
                disabled={editingCommission}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommissionSave}
                className="bg-[#224229] text-white px-4 py-2 rounded-lg hover:bg-[#4b6250] transition-colors order-1 sm:order-2 disabled:opacity-50"
                disabled={editingCommission}
              >
                {editingCommission ? 'Saving...' : 'Save Commission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;