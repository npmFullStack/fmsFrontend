import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Loading from './components/Loading';
import HomeSkeleton from './components/skeletons/HomeSkeleton';
import CategorySkeleton from './components/skeletons/CategorySkeleton';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Category = lazy(() => import('./pages/Category'));

function App() {
  return (
    <Router>
      {/* Global fallback */}
      <Suspense fallback={<Loading />}>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                <Suspense fallback={<HomeSkeleton />}>
                  <Home />
                </Suspense>
              }
            />
            <Route
              path="/Category"
              element={
                <Suspense fallback={<CategorySkeleton />}>
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
