import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Loading from './components/Loading';
import HomeSkeleton from './components/skeletons/HomeSkeleton';
import CategoryListSkeleton from './components/skeletons/CategoryListSkeleton';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const CategoryList = lazy(() => import('./pages/CategoryList'));

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
              path="/CategoryList"
              element={
                <Suspense fallback={<CategoryListSkeleton />}>
                  <CategoryList />
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
