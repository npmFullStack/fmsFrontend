// src/hooks/useAP.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff } from '../utils/retry';
import api from '../api';

const AP_KEY = ['accounts-payables'];
const PAY_CHARGES_KEY = ['pay-charges'];

// ✅ Enhanced API functions with retry and timeout handling
const apApi = {
  getAll: async (params = {}, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get('/accounts-payables', { params, signal }),
      3, // maxRetries
      1000, // baseDelay
      30000 // timeout
    );
    return data;
  },

  getOne: async (id, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/accounts-payables/${id}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },

  getByBooking: async (bookingId, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/accounts-payables/booking/${bookingId}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },

  create: async (payload) => {
    const { data } = await retryWithBackoff(
      () => api.post('/accounts-payables', payload),
      2, // Fewer retries for mutations
      1000,
      45000 // Longer timeout for creation
    );
    return data;
  },

  // Pay Charges specific APIs
  getPayableCharges: async (params = {}, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get('/pay-charges', { params, signal }),
      3,
      1000,
      30000
    );
    return data;
  },

  getPayableChargesByBooking: async (bookingId, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/pay-charges/booking/${bookingId}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },

  markChargeAsPaid: async (payload) => {
    const { data } = await retryWithBackoff(
      () => api.post('/pay-charges/mark-paid', payload),
      2,
      1000,
      30000
    );
    return data;
  },

  markMultipleChargesAsPaid: async (payload) => {
    const { data } = await retryWithBackoff(
      () => api.post('/pay-charges/mark-multiple-paid', payload),
      2,
      1000,
      45000 // Longer timeout for bulk operations
    );
    return data;
  },
};

// ✅ Enhanced Hook
export const useAP = () => {
  const queryClient = useQueryClient();

  // ✅ Enhanced AP records query with optimized options
  const apQuery = (params = {}) => useQuery({
    queryKey: [...AP_KEY, params],
    queryFn: ({ signal }) => apApi.getAll(params, signal),
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

  // Fetch AP by booking ID with enhanced options
  const apByBookingQuery = (bookingId) => useQuery({
    queryKey: [...AP_KEY, 'booking', bookingId],
    queryFn: ({ signal }) => apApi.getByBooking(bookingId, signal),
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

  // ✅ Enhanced payable charges query for PayCharges page
  const payableChargesQuery = (params = {}) => useQuery({
    queryKey: [...PAY_CHARGES_KEY, params],
    queryFn: ({ signal }) => apApi.getPayableCharges(params, signal),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });

  // Fetch payable charges by booking with enhanced options
  const payableChargesByBookingQuery = (bookingId) => useQuery({
    queryKey: [...PAY_CHARGES_KEY, 'booking', bookingId],
    queryFn: ({ signal }) => apApi.getPayableChargesByBooking(bookingId, signal),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Enhanced mutations with better error handling
  const createAP = useMutation({
    mutationFn: apApi.create,
    onSuccess: (data) => {
      // Invalidate and refetch AP records
      queryClient.invalidateQueries({ queryKey: AP_KEY });
      queryClient.invalidateQueries({ queryKey: PAY_CHARGES_KEY });
      console.log('✅ AP record created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('❌ Create AP error:', error.response?.data || error.message);
      throw error;
    },
  });

  const markChargeAsPaid = useMutation({
    mutationFn: apApi.markChargeAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AP_KEY });
      queryClient.invalidateQueries({ queryKey: PAY_CHARGES_KEY });
      console.log('✅ Charge marked as paid successfully');
    },
    onError: (error) => {
      console.error('❌ Mark as paid error:', error.response?.data || error.message);
    },
  });

  const markMultipleChargesAsPaid = useMutation({
    mutationFn: apApi.markMultipleChargesAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AP_KEY });
      queryClient.invalidateQueries({ queryKey: PAY_CHARGES_KEY });
      console.log('✅ Multiple charges marked as paid successfully');
    },
    onError: (error) => {
      console.error('❌ Multiple mark as paid error:', error.response?.data || error.message);
    },
  });

  return {
    // Queries
    apQuery,
    apByBookingQuery,
    payableChargesQuery,
    payableChargesByBookingQuery,
    
    // Mutations
    createAP,
    markChargeAsPaid,
    markMultipleChargesAsPaid,
  };
};