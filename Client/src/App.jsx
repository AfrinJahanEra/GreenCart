// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PlantCollection from './pages/PlantCollection';
import PlantDetails from './pages/PlantDetails';
import NotFound from './pages/NotFound';
import Order from './pages/Order';
import OrderConfirmation from './pages/OrderConfirmation';
import { theme } from './theme';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.colors.background.light }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plants" element={<PlantCollection />} />
          <Route path="/plants/:category" element={<PlantCollection />} />
          <Route path="/plant/:id" element={<PlantDetails />} />
          <Route path="/order" element={<Order />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;