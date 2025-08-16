// src/pages/admin/AdminDashboard.jsx
import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();

    // Sample data - in a real app, this would come from an API
    const [users, setUsers] = useState({
        customers: [
            { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', orders: 5, totalSpent: 250 },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1987654321', orders: 3, totalSpent: 180 },
            { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+1122334455', orders: 7, totalSpent: 420 },
        ],
        deliveryAgents: [
            { id: 1, name: 'Mike Brown', email: 'mike@example.com', phone: '+1555666777', deliveries: 15, earnings: 375 },
            { id: 2, name: 'Sarah Wilson', email: 'sarah@example.com', phone: '+1888999000', deliveries: 22, earnings: 550 },
        ],
        salesReps: [
            { id: 1, name: 'Alex Green', email: 'alex@example.com', phone: '+1444555666', sales: 28, earnings: 1400 },
            { id: 2, name: 'Emily Davis', email: 'emily@example.com', phone: '+1777888999', sales: 35, earnings: 1750 },
        ],
        orders: [
            { id: 1001, customer: 'John Doe', amount: 75, status: 'Processing', date: '2023-06-15' },
            { id: 1002, customer: 'Jane Smith', amount: 120, status: 'Processing', date: '2023-06-14' },
            { id: 1003, customer: 'Bob Johnson', amount: 55, status: 'Processing', date: '2023-06-13' },
            { id: 1004, customer: 'John Doe', amount: 95, status: 'Processing', date: '2023-06-12' },
            { id: 1005, customer: 'Jane Smith', amount: 65, status: 'Processing', date: '2023-06-11' },
        ]
    });

    const stats = {
        totalCustomers: users.customers.length,
        totalDeliveryAgents: users.deliveryAgents.length,
        totalSalesReps: users.salesReps.length,
        totalOrders: users.orders.length,
        monthlyRevenue: 3850,
        activeDeliveries: 8
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        navigate(`/admin/${tab}`);
    };

    const handleAddUser = (type, newUser) => {
        setUsers(prev => ({
            ...prev,
            [type]: [...prev[type], { ...newUser, id: Date.now() }]
        }));
    };

    const handleUpdateUser = (type, updatedUser) => {
        setUsers(prev => ({
            ...prev,
            [type]: prev[type].map(user =>
                user.id === updatedUser.id ? updatedUser : user
            )
        }));
    };

    const handleDeleteUser = (type, userId) => {
        setUsers(prev => ({
            ...prev,
            [type]: prev[type].filter(user => user.id !== userId)
        }));
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f7f0e1]">
            <Header />

            <div className="flex flex-1">
                {/* Sidebar */}
                <div className="w-64 bg-[#224229] text-white p-4 hidden md:block">
                    <div className="flex items-center gap-3 mb-8 p-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#224229] font-bold">
                            A
                        </div>
                        <div>
                            <p className="font-medium">Admin Dashboard</p>
                            <p className="text-xs text-green-200">Administrator</p>
                        </div>
                    </div>

                    <nav>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => handleTabChange('dashboard')}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                                >
                                    Dashboard Overview
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleTabChange('customers')}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'customers' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                                >
                                    Customer Management
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleTabChange('delivery')}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'delivery' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                                >
                                    Delivery Personnel
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleTabChange('sales')}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'sales' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                                >
                                    Sales Team
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleTabChange('orders')}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                                >
                                    Order Management
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleTabChange('reports')}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'reports' ? 'bg-green-700' : 'hover:bg-green-800'}`}
                                >
                                    Reports & Analytics
                                </button>
                            </li>
                        </ul>
                    </nav>

                    <div className="mt-8 pt-4 border-t border-green-700">
                        <Link
                            to="/"
                            className="block px-4 py-2 text-sm hover:bg-green-800 rounded-lg transition-colors"
                        >
                            Back to Store
                        </Link>
                    </div>
                </div>

                {/* Mobile sidebar toggle */}
                <div className="md:hidden fixed bottom-4 right-4 z-50">
                    <button className="w-12 h-12 bg-[#224229] text-white rounded-full shadow-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Main content */}
                <div className="flex-1 p-4 md:p-8">
                    <Outlet context={{
                        users,
                        stats,
                        onAddUser: handleAddUser,
                        onUpdateUser: handleUpdateUser,
                        onDeleteUser: handleDeleteUser
                    }} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;