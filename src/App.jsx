// src/App.jsx
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSkeleton from './components/ui/LoadingSkeleton';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Category = lazy(() => import('./pages/Category'));

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSkeleton type="generic" />}>
        <Layout>
          <Routes>
            <Route 
              path="/" 
              element={
                <Suspense fallback={<LoadingSkeleton type="home" />}>
                  <Home />
                </Suspense>
              } 
            />
            <Route 
              path="/category" 
              element={
                <Suspense fallback={<LoadingSkeleton type="table" rows={5} columns={4} />}>
                  <Category />
                </Suspense>
              } 
            />
          </Routes>
        </Layout>
      </Suspense>
    </Router>
  );
}

export default App;