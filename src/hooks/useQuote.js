// src/hooks/useQuote.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff } from '../utils/retry';
import api from '../api';

const QUOTE_KEY = ['quotes'];

// ✅ Enhanced API functions with retry and timeout handling
const quoteApi = {
  getAll: async (params = {}, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get('/quotes', { params, signal }),
      3, // maxRetries
      1000, // baseDelay
      30000 // timeout
    );
    return data;
  },

  getOne: async (id, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/quotes/${id}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },

  create: async (payload) => {
    const { data } = await retryWithBackoff(
      () => api.post('/quotes', payload),
      2, // Fewer retries for mutations
      1000,
      45000 // Longer timeout for creation
    );
    return data;
  },

  send: async ({ id, ...payload }) => {
    const { data } = await retryWithBackoff(
      () => api.post(`/quotes/${id}/send`, payload),
      2,
      1000,
      45000 // Longer timeout for email sending
    );
    return data;
  },

  delete: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.delete(`/quotes/${id}`),
      2,
      1000,
      30000
    );
    return data;
  },
};

// ✅ Enhanced Hook
export const useQuote = () => {
  const queryClient = useQueryClient();

  // ✅ Enhanced quotes query with optimized options
  const quotesQuery = (params = {}) => useQuery({
    queryKey: [...QUOTE_KEY, params],
    queryFn: ({ signal }) => quoteApi.getAll(params, signal),
    staleTime: 2 * 60 * 1000, // 2 minutes - data stays fresh for 2 mins
    gcTime: 10 * 60 * 1000, // 10 minutes - cache time
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times for server errors
      return failureCount < 2;
    },
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });

  // Fetch single quote with enhanced options
  const quoteQuery = (id) => useQuery({
    queryKey: [...QUOTE_KEY, id],
    queryFn: ({ signal }) => quoteApi.getOne(id, signal),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for single quote
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // ✅ Enhanced mutations with better error handling
  const createQuote = useMutation({
    mutationFn: quoteApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUOTE_KEY });
      console.log('✅ Quote created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('❌ Create quote error:', error.response?.data || error.message);
      throw error;
    },
  });

  const sendQuote = useMutation({
    mutationFn: quoteApi.send,
    onSuccess: (data) => {
      // Invalidate specific quote and all quotes
      queryClient.invalidateQueries({ queryKey: QUOTE_KEY });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: [...QUOTE_KEY, data.id] });
      }
      console.log('✅ Quote sent successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('❌ Send quote error:', error.response?.data || error.message);
      throw error;
    },
  });

  const deleteQuote = useMutation({
    mutationFn: quoteApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTE_KEY });
      console.log('✅ Quote deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Delete quote error:', error.response?.data || error.message);
    },
  });

  return {
    // Queries
    quotesQuery,
    quoteQuery,
    // Mutations
    createQuote,
    sendQuote,
    deleteQuote,
  };
};