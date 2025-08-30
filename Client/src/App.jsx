// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Home from './pages/Home';
import PlantCollection from './pages/PlantCollection';
import PlantDetails from './pages/PlantDetails';
import NotFound from './pages/NotFound';
import Order from './pages/Order';
import OrderConfirmation from './pages/OrderConfirmation';
import { theme } from './theme';
import SellerDashboard from './pages/SellerDashboard';
import Dashboard from './pages/seller/Dashboard';
import Plants from './pages/seller/Plants';
import Sales from './pages/seller/Sales';
import AddPlant from './pages/seller/AddPlant';
import RecordSale from './pages/seller/RecordSale';
import DeliveryDashboard from './pages/DeliveryDashboard';
import Assigned from './pages/delivery/Assigned';
import Pending from './pages/delivery/Pending';
import Completed from './pages/delivery/Completed';
import Earnings from './pages/delivery/Earnings';
import AdminDashboard from './pages/AdminDashboard';
import AdDashboard from './pages/admin/Dashboard';
import Customers from './pages/admin/Customers';
import Delivery from './pages/admin/Delivery';
import AdSales from './pages/admin/Sales';
import Orders from './pages/admin/Orders';
import Reports from './pages/admin/Reports';
import OrderDashboard from './pages/orderdashboard/OrderDashboard';
import AllOrders from './pages/orderdashboard/AllOrders';
import PendingOrders from './pages/orderdashboard/PendingOrders';
import DeliveredOrders from './pages/orderdashboard/DeliveredOrders';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.colors.background.light }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plants" element={<PlantCollection />} />
            <Route path="/plants/:category" element={<PlantCollection />} />
            <Route path="/plant/:id" element={<PlantDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route path="/order" element={
  
                <Order />

            } />
            <Route path="/order-confirmation" element={

                <OrderConfirmation />

            } />
            
            {/* Seller Routes */}
            <Route path="/seller/*" element={
    
                <SellerDashboard />
 
            }>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="plants" element={<Plants />} />
              <Route path="sales" element={<Sales />} />
              <Route path="add-plant" element={<AddPlant />} />
              <Route path="record-sale" element={<RecordSale />} />
            </Route>
            
            {/* Delivery Routes */}
            <Route path="/delivery/*" element={

                <DeliveryDashboard />

            }>
              <Route index element={<Assigned />} />
              <Route path="assigned" element={<Assigned />} />
              <Route path="pending" element={<Pending />} />
              <Route path="completed" element={<Completed />} />
              <Route path="earnings" element={<Earnings />} />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={
  
                <AdminDashboard />
       
            }>
              <Route index element={<AdDashboard />} />
              <Route path="dashboard" element={<AdDashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="delivery" element={<Delivery />} />
              <Route path="sales" element={<AdSales />} />
              <Route path="orders" element={<Orders />} />
              <Route path="reports" element={<Reports />} />
            </Route>
            
            {/* Customer Orders */}
            <Route path="/orders/*" element={
  
                <OrderDashboard />
     
            }>
              <Route index element={<Navigate to="all" replace />} />
              <Route path="all" element={<AllOrders />} />
              <Route path="pending" element={<PendingOrders />} />
              <Route path="delivered" element={<DeliveredOrders />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
export default App;