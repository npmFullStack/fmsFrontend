// src/hooks/useAuth.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const AUTH_KEY = ['auth'];

// ✅ API functions
const authApi = {
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
  getUser: async () => {
    const { data } = await api.get('/auth/user');
    return data;
  },
};

// ✅ Hook
export const useAuth = () => {
  const queryClient = useQueryClient();

  // Get current user
  const userQuery = useQuery({
    queryKey: AUTH_KEY,
    queryFn: authApi.getUser,
    retry: false,
    enabled: false, // We'll manually trigger this when needed
  });

  // Login
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      // Update auth query data
      queryClient.setQueryData(AUTH_KEY, data);
      console.log('✅ Login successful');
    },
    onError: (error) => {
      console.error('❌ Login error:', error.response?.data || error.message);
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Remove token from localStorage
      localStorage.removeItem('token');
      // Clear auth data
      queryClient.setQueryData(AUTH_KEY, null);
      queryClient.clear();
      console.log('✅ Logout successful');
    },
    onError: (error) => {
      console.error('❌ Logout error:', error.response?.data || error.message);
      // Still clear local data even if server call fails
      localStorage.removeItem('token');
      queryClient.setQueryData(AUTH_KEY, null);
      queryClient.clear();
    },
  });

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  // Initialize auth state
  const initializeAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {

    }
  };

  return {
    userQuery,
    loginMutation,
    logoutMutation,
    isAuthenticated,
    initializeAuth,
  };
};