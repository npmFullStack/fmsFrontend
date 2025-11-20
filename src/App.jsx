// src/App.jsx
import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import LoadingSkeleton from './components/ui/LoadingSkeleton';
import { useAuth } from './hooks/useAuth';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Quote = lazy(() => import('./pages/Quote'));

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Category = lazy(() => import('./pages/Category'));
const ContainerType = lazy(() => import('./pages/ContainerType'));
const Port = lazy(() => import('./pages/Port'));
const TruckComp = lazy(() => import('./pages/TruckComp'));
const ShippingLine = lazy(() => import('./pages/ShippingLine'));
const BookingRequest = lazy(() => import('./pages/BookingRequest'));
const Booking = lazy(() => import('./pages/Booking'));
const User = lazy(() => import('./pages/User'));
const CargoMonitoring = lazy(() => import('./pages/CargoMonitoring'));

function App() {
  const { initializeAuth } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <Router>
      <Suspense fallback={<LoadingSkeleton type="generic" />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/quote" element={<Quote />} />
          </Route>
          
          {/* Authenticated Routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories" element={<Category />} />
            <Route path="/container-types" element={<ContainerType />} />
            <Route path="/ports" element={<Port />} />
            <Route path="/truck-comp" element={<TruckComp />} />
            <Route path="/shipping-line" element={<ShippingLine />} />
            <Route path="/booking-request" element={<BookingRequest />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/users" element={<User />} />
            <Route path="/cargo-monitoring" element={<CargoMonitoring />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;