import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import LoadingSkeleton from './components/ui/LoadingSkeleton';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Category = lazy(() => import('./pages/Category'));

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Suspense fallback={<LoadingSkeleton type="generic" />}>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category" element={<Category />} />
            </Routes>
          </Layout>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;