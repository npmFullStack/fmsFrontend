// src/App.jsx
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSkeleton from './components/ui/LoadingSkeleton';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Category = lazy(() => import('./pages/Category'));
const ContainerType = lazy(() => import('./pages/ContainerType'));
const Port = lazy(() => import('./pages/Port'));
const Item = lazy(() => import('./pages/Item'));

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSkeleton type="generic" />}>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Category />} />
            <Route path="/container-types" element={<ContainerType />} />
            <Route path="/ports" element={<Port
                        />} />
            <Route path="/items" element={<Item
                        />} />
          </Routes>
        </Layout>
      </Suspense>
    </Router>
  );
}

export default App;
