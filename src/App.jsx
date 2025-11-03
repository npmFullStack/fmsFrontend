// src/App.jsx
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import LoadingSkeleton from './components/ui/LoadingSkeleton';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Quote = lazy(() => import('./pages/Quote'));

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Category = lazy(() => import('./pages/Category'));
const ContainerType = lazy(() => import('./pages/ContainerType'));
const Port = lazy(() => import('./pages/Port'));
const ShippingLine = lazy(() => import('./pages/ShippingLine'));
const BookingRequest = lazy(() => import('./pages/BookingRequest'));
const BookingDetails = lazy(() => import('./pages/BookingDetails'));


function App() {
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
            <Route path="/shipping-line" element={<ShippingLine />} />
            <Route path="/booking-request" element={<BookingRequest />} />
<Route path="/booking-details/:id" element={<BookingDetails />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;