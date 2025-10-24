// src/App.jsx
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import LoadingSkeleton from './components/ui/LoadingSkeleton';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Category = lazy(() => import('./pages/Category'));
const ContainerType = lazy(() => import('./pages/ContainerType'));
const Port = lazy(() => import('./pages/Port'));
const Item = lazy(() => import('./pages/Item'));
const Login = lazy(() => import('./pages/Login'));
const Quote = lazy(() => import('./pages/Quote'));

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSkeleton type="generic" />}>
        <Routes>
          {/* Public Routes */}
            <PublicLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/quote" element={<Quote />} />
              </Routes>
            </PublicLayout>
          
          {/* Authenticated Routes */}
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/categories" element={<Category />} />
                <Route path="/container-types" element={<ContainerType />} />
                <Route path="/ports" element={<Port />} />
                <Route path="/items" element={<Item />} />
              </Routes>
            </Layout>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;