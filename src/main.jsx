import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import 'react-loading-skeleton/dist/skeleton.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--b1))',
            color: 'hsl(var(--bc))',
            border: '1px solid hsl(var(--b3))',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
          success: {
            style: {
              background: 'hsl(var(--su))',
              color: 'hsl(var(--suc))',
              border: '1px solid hsl(var(--su))',
            },
            iconTheme: {
              primary: 'hsl(var(--suc))',
              secondary: 'hsl(var(--su))',
            },
          },
          error: {
            style: {
              background: 'hsl(var(--er))',
              color: 'hsl(var(--erc))',
              border: '1px solid hsl(var(--er))',
            },
            iconTheme: {
              primary: 'hsl(var(--erc))',
              secondary: 'hsl(var(--er))',
            },
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);