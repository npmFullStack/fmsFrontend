// src/hooks/useAR.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const AR_KEY = ['accounts-receivables'];

// API functions
const arApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/accounts-receivables', { params });
    return data;
  },
  getOne: async (id) => {
    const { data } = await api.get(`/accounts-receivables/${id}`);
    return data;
  },
  getByBooking: async (bookingId) => {
    const { data } = await api.get(`/accounts-receivables/booking/${bookingId}`);
    return data;
  },
  getSummary: async () => {
    const { data } = await api.get('/accounts-receivables/summary');
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/accounts-receivables', payload);
    return data;
  },
  update: async ({ id, ...payload }) => {
    const { data } = await api.put(`/accounts-receivables/${id}`, payload);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/accounts-receivables/${id}`);
    return data;
  },
  markAsPaid: async (id) => {
    const { data } = await api.post(`/accounts-receivables/${id}/mark-paid`);
    return data;
  },
  processPayment: async ({ id, ...payload }) => {
    const { data } = await api.post(`/accounts-receivables/${id}/process-payment`, payload);
    return data;
  },
  
  // NEW: Get payment breakdown
  getPaymentBreakdown: async (id) => {
    const { data } = await api.get(`/accounts-receivables/${id}/payment-breakdown`);
    return data;
  },
};

// Hook
export const useAR = () => {
  const queryClient = useQueryClient();

  // Fetch all AR records with optional params
  const arQuery = (params = {}) => useQuery({
    queryKey: [...AR_KEY, params],
    queryFn: () => arApi.getAll(params),
  });

  // Fetch AR by booking ID
  const arByBookingQuery = (bookingId) => useQuery({
    queryKey: [...AR_KEY, 'booking', bookingId],
    queryFn: () => arApi.getByBooking(bookingId),
    enabled: !!bookingId,
  });

  // Fetch financial summary
  const arSummaryQuery = () => useQuery({
    queryKey: [...AR_KEY, 'summary'],
    queryFn: arApi.getSummary,
  });

  const createAR = useMutation({
    mutationFn: arApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(AR_KEY);
      console.log('✅ AR record created successfully');
    },
    onError: (error) => {
      console.error('❌ Create error:', error.response?.data || error.message);
    },
  });

  // Update AR record
  const updateAR = useMutation({
    mutationFn: arApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries(AR_KEY);
      console.log('✅ AR record updated');
    },
    onError: (error) => {
      console.error('❌ Update error:', error.response?.data || error.message);
    },
  });

  // Delete AR record
  const deleteAR = useMutation({
    mutationFn: arApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(AR_KEY);
      console.log('✅ AR record deleted');
    },
    onError: (error) => {
      console.error('❌ Delete error:', error.response?.data || error.message);
    },
  });

  // Mark as paid
  const markAsPaid = useMutation({
    mutationFn: arApi.markAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries(AR_KEY);
      console.log('✅ AR record marked as paid');
    },
    onError: (error) => {
      console.error('❌ Mark as paid error:', error.response?.data || error.message);
    },
  });
  
const processPayment = useMutation({
    mutationFn: arApi.processPayment,
    onSuccess: () => {
      queryClient.invalidateQueries(AR_KEY);
      console.log('✅ Payment processed successfully');
    },
    onError: (error) => {
      console.error('❌ Process payment error:', error.response?.data || error.message);
    },
  });
  
  const paymentBreakdownQuery = (id) => useQuery({
    queryKey: [...AR_KEY, 'payment-breakdown', id],
    queryFn: () => arApi.getPaymentBreakdown(id),
    enabled: !!id,
  });
  return {
    // Queries
    arQuery,
    arByBookingQuery,
    arSummaryQuery,
    
    // Mutations
    createAR,
    updateAR,
    deleteAR,
    markAsPaid,
    paymentBreakdownQuery,
    processPayment,
  };
};