import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Loading from './components/Loading';
import Layout from './components/Layout';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const CategoryList = lazy(() => import('./pages/CategoryList'));

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/CategoryList" element={<CategoryList />} />
          </Routes>
        </Layout>
      </Suspense>
    </Router>
  );
}

export default App;
