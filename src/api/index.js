// src/api/index.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      hasToken: !!token,
      requestId: config.headers['X-Request-ID']
    });
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      status: response.status,
      url: response.config.url,
      requestId: response.config.headers['X-Request-ID']
    });
    return response;
  },
  (error) => {
    const requestId = error.config?.headers?.['X-Request-ID'];
    
    console.error('❌ API Response Error:', {
      message: error.message,
      status: error.response?.status,
      requestId,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Enhanced error handling
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - please try again';
    }
    
    if (error.response?.status >= 500) {
      error.message = 'Server error - please try again later';
    }
    
    return Promise.reject(error);
  }
);

// Make api available globally for debugging (remove in production)
if (import.meta.env.DEV) {
  window.api = api;
}

export default api;