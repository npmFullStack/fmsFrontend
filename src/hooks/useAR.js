// src/hooks/useAR.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff } from '../utils/retry';
import api from '../api';

const AR_KEY = ['accounts-receivables'];

// ✅ Enhanced API functions with retry and timeout handling
const arApi = {
  getAll: async (params = {}, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get('/accounts-receivables', { params, signal }),
      3, // maxRetries
      1000, // baseDelay
      30000 // timeout
    );
    return data;
  },

  getOne: async (id, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/accounts-receivables/${id}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },

  getByBooking: async (bookingId, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/accounts-receivables/booking/${bookingId}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },

  getSummary: async (signal) => {
    const { data } = await retryWithBackoff(
      () => api.get('/accounts-receivables/summary', { signal }),
      3,
      1000,
      30000
    );
    return data;
  },

  create: async (payload) => {
    const { data } = await retryWithBackoff(
      () => api.post('/accounts-receivables', payload),
      2, // Fewer retries for mutations
      1000,
      45000 // Longer timeout for creation
    );
    return data;
  },

  update: async ({ id, ...payload }) => {
    const { data } = await retryWithBackoff(
      () => api.put(`/accounts-receivables/${id}`, payload),
      2,
      1000,
      30000
    );
    return data;
  },

  delete: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.delete(`/accounts-receivables/${id}`),
      2,
      1000,
      30000
    );
    return data;
  },

  markAsPaid: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.post(`/accounts-receivables/${id}/mark-paid`),
      2,
      1000,
      30000
    );
    return data;
  },

  processPayment: async ({ id, ...payload }) => {
    const { data } = await retryWithBackoff(
      () => api.post(`/accounts-receivables/${id}/process-payment`, payload),
      2,
      1000,
      30000
    );
    return data;
  },

  // NEW: Get payment breakdown
  getPaymentBreakdown: async (id, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/accounts-receivables/${id}/payment-breakdown`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },

  // NEW: Send payment email
  sendPaymentEmail: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.post(`/accounts-receivables/${id}/send-payment-email`),
      2,
      1000,
      30000
    );
    return data;
  },
};

// ✅ Enhanced Hook
export const useAR = () => {
  const queryClient = useQueryClient();

  // ✅ Enhanced AR records query with optimized options
  const arQuery = (params = {}) => useQuery({
    queryKey: [...AR_KEY, params],
    queryFn: ({ signal }) => arApi.getAll(params, signal),
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

  // Fetch AR by booking ID with enhanced options
  const arByBookingQuery = (bookingId) => useQuery({
    queryKey: [...AR_KEY, 'booking', bookingId],
    queryFn: ({ signal }) => arApi.getByBooking(bookingId, signal),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000, // 5 minutes for specific booking
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Fetch financial summary with enhanced options
  const arSummaryQuery = () => useQuery({
    queryKey: [...AR_KEY, 'summary'],
    queryFn: ({ signal }) => arApi.getSummary(signal),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Payment breakdown query with enhanced options
  const paymentBreakdownQuery = (id) => useQuery({
    queryKey: [...AR_KEY, 'payment-breakdown', id],
    queryFn: ({ signal }) => arApi.getPaymentBreakdown(id, signal),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Enhanced mutations with better error handling
  const createAR = useMutation({
    mutationFn: arApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: AR_KEY });
      console.log('✅ AR record created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('❌ Create AR error:', error.response?.data || error.message);
      throw error;
    },
  });

  const updateAR = useMutation({
    mutationFn: arApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: AR_KEY });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: [...AR_KEY, data.id] });
      }
      console.log('✅ AR record updated successfully');
    },
    onError: (error) => {
      console.error('❌ Update AR error:', error.response?.data || error.message);
    },
  });

  const deleteAR = useMutation({
    mutationFn: arApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AR_KEY });
      console.log('✅ AR record deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Delete AR error:', error.response?.data || error.message);
    },
  });

  const markAsPaid = useMutation({
    mutationFn: arApi.markAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AR_KEY });
      console.log('✅ AR record marked as paid successfully');
    },
    onError: (error) => {
      console.error('❌ Mark as paid error:', error.response?.data || error.message);
    },
  });

  const processPayment = useMutation({
    mutationFn: arApi.processPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AR_KEY });
      console.log('✅ Payment processed successfully');
    },
    onError: (error) => {
      console.error('❌ Process payment error:', error.response?.data || error.message);
    },
  });

  const sendPaymentEmail = useMutation({
    mutationFn: arApi.sendPaymentEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AR_KEY });
      console.log('✅ Payment email sent successfully');
    },
    onError: (error) => {
      console.error('❌ Send payment email error:', error.response?.data || error.message);
    },
  });

  return {
    // Queries
    arQuery,
    arByBookingQuery,
    arSummaryQuery,
    paymentBreakdownQuery,
    
    // Mutations
    createAR,
    updateAR,
    deleteAR,
    markAsPaid,
    processPayment,
    sendPaymentEmail,
  };
};