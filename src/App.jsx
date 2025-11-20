// src/App.jsx
import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import LoadingSkeleton from './components/ui/LoadingSkeleton';
import { useAuth } from './hooks/useAuth';

// Lazy-loaded pages with error handling
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error('Failed to load component:', error);
      // You can add retry logic here if needed
      throw error;
    }
  });

// Lazy-loaded pages
const Home = lazyWithRetry(() => import('./pages/Home'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const Quote = lazyWithRetry(() => import('./pages/Quote'));

const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const Category = lazyWithRetry(() => import('./pages/Category'));
const ContainerType = lazyWithRetry(() => import('./pages/ContainerType'));
const Port = lazyWithRetry(() => import('./pages/Port'));
const TruckComp = lazyWithRetry(() => import('./pages/TruckComp'));
const ShippingLine = lazyWithRetry(() => import('./pages/ShippingLine'));
const BookingRequest = lazyWithRetry(() => import('./pages/BookingRequest'));
const Booking = lazyWithRetry(() => import('./pages/Booking'));
const User = lazyWithRetry(() => import('./pages/User'));
const CargoMonitoring = lazyWithRetry(() => import('./pages/CargoMonitoring'));

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