// src/pages/admin/Dashboard.jsx
import { useOutletContext } from 'react-router-dom';
import { theme } from '../../theme';

const Dashboard = () => {
  const { stats } = useOutletContext();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Customers</h3>
          <p className="text-3xl font-bold">{stats.totalCustomers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Active Delivery Agents</h3>
          <p className="text-3xl font-bold">{stats.totalDeliveryAgents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Sales Team Members</h3>
          <p className="text-3xl font-bold">{stats.totalSalesReps}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Monthly Revenue</h3>
          <p className="text-3xl font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Active Deliveries</h3>
          <p className="text-3xl font-bold">{stats.activeDeliveries}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.primary }}>Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">New customer registered</p>
                <p className="text-sm text-gray-500">John Smith - 2 hours ago</p>
              </div>
            </div>
            <button className="text-blue-500 hover:text-blue-700 text-sm">View</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Order #1005 completed</p>
                <p className="text-sm text-gray-500">Total: $85 - 5 hours ago</p>
              </div>
            </div>
            <button className="text-blue-500 hover:text-blue-700 text-sm">Details</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">New delivery agent onboarded</p>
                <p className="text-sm text-gray-500">Sarah Johnson - 1 day ago</p>
              </div>
            </div>
            <button className="text-blue-500 hover:text-blue-700 text-sm">Profile</button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.primary }}>Recent Orders</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(order => (
              <div key={order} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between">
                  <span className="font-medium">Order #{1000 + order}</span>
                  <span className={order % 3 === 0 ? 'text-green-500' : order % 2 === 0 ? 'text-yellow-500' : 'text-blue-500'}>
                    {order % 3 === 0 ? 'Delivered' : order % 2 === 0 ? 'Shipped' : 'Processing'}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Customer {order}</span>
                  <span>${(order * 25 + 50).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.primary }}>Top Performers</h2>
          <div className="space-y-3">
            {[1, 2, 3].map(performer => (
              <div key={performer} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between">
                  <span className="font-medium">Sales Rep {performer}</span>
                  <span className="text-green-500">${(performer * 1000).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{performer * 15} sales</span>
                  <span>{(performer * 4.8).toFixed(1)} ★</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;