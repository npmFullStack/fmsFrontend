// usePayment.js - Updated version
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const PAYMENT_KEY = ['payments'];
const CUSTOMER_BOOKING_KEY = ['customer-bookings'];
const AR_KEY = ['accounts-receivables']; // Added AR key

// API functions
const paymentApi = {
  // Customer bookings
  getCustomerBookings: async (params = {}) => {
    const { data } = await api.get('/customer/bookings', { params });
    return data;
  },
  getCustomerBooking: async (id) => {
    const { data } = await api.get(`/customer/bookings/${id}`);
    return data;
  },
  
  // Payments
  getAll: async (params = {}) => {
    const { data } = await api.get('/payments', { params });
    return data;
  },
  getOne: async (id) => {
    const { data } = await api.get(`/payments/${id}`);
    return data;
  },
  getByBooking: async (bookingId) => {
    const { data } = await api.get(`/payments/booking/${bookingId}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/payments', payload);
    return data;
  },
  createForBooking: async (bookingId, payload) => {
    const { data } = await api.post(`/customer/bookings/${bookingId}/pay`, {
      ...payload,
      booking_id: bookingId // Ensure booking_id is included
    });
    return data;
  },
  update: async ({ id, ...payload }) => {
    const { data } = await api.put(`/payments/${id}`, payload);
    return data;
  },
  processGCash: async (id, payload) => {
    const { data } = await api.post(`/payments/${id}/process-gcash`, payload);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/payments/${id}`);
    return data;
  },
  checkStatus: async (id) => {
    const { data } = await api.get(`/payments/${id}/status`);
    return data;
  },
};

export const usePayment = () => {
  const queryClient = useQueryClient();

  // Customer bookings queries
  const customerBookingsQuery = (params = {}) => useQuery({
    queryKey: [...CUSTOMER_BOOKING_KEY, params],
    queryFn: () => paymentApi.getCustomerBookings(params),
  });

  const customerBookingQuery = (id) => useQuery({
    queryKey: [...CUSTOMER_BOOKING_KEY, id],
    queryFn: () => paymentApi.getCustomerBooking(id),
    enabled: !!id,
  });

  // Payment queries
  const paymentsQuery = (params = {}) => useQuery({
    queryKey: [...PAYMENT_KEY, params],
    queryFn: () => paymentApi.getAll(params),
  });

  const paymentQuery = (id) => useQuery({
    queryKey: [...PAYMENT_KEY, id],
    queryFn: () => paymentApi.getOne(id),
    enabled: !!id,
  });

  const paymentsByBookingQuery = (bookingId) => useQuery({
    queryKey: [...PAYMENT_KEY, 'booking', bookingId],
    queryFn: () => paymentApi.getByBooking(bookingId),
    enabled: !!bookingId,
  });

  const paymentStatusQuery = (id) => useQuery({
    queryKey: [...PAYMENT_KEY, 'status', id],
    queryFn: () => paymentApi.checkStatus(id),
    enabled: !!id,
    refetchInterval: (data) => {
      return data?.status === 'processing' ? 5000 : false;
    },
  });

  // Mutations with proper query invalidation
  const createPayment = useMutation({
    mutationFn: paymentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEY });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_BOOKING_KEY });
      queryClient.invalidateQueries({ queryKey: AR_KEY });
      console.log('✅ Payment created successfully, queries invalidated');
    },
    onError: (error) => {
      console.error('❌ Create payment error:', error.response?.data || error.message);
    },
  });

  const createPaymentForBooking = useMutation({
    mutationFn: ({ bookingId, ...payload }) => paymentApi.createForBooking(bookingId, payload),
    onSuccess: (data, variables) => {
      // Invalidate all related queries to force refresh
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEY });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_BOOKING_KEY });
      queryClient.invalidateQueries({ queryKey: AR_KEY });
      
      // Specifically invalidate the booking that was just paid
      queryClient.invalidateQueries({ 
        queryKey: [...CUSTOMER_BOOKING_KEY, variables.bookingId] 
      });
      
      console.log('✅ Payment created successfully, queries invalidated');
      return data;
    },
    onError: (error) => {
      console.error('❌ Create payment error:', error.response?.data || error.message);
    },
  });

  const updatePayment = useMutation({
    mutationFn: paymentApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEY });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_BOOKING_KEY });
      queryClient.invalidateQueries({ queryKey: AR_KEY });
      console.log('✅ Payment updated, queries invalidated');
    },
    onError: (error) => {
      console.error('❌ Update payment error:', error.response?.data || error.message);
    },
  });

  const processGCashPayment = useMutation({
    mutationFn: ({ id, ...payload }) => paymentApi.processGCash(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEY });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_BOOKING_KEY });
      queryClient.invalidateQueries({ queryKey: AR_KEY });
      console.log('✅ GCash payment processed, queries invalidated');
    },
    onError: (error) => {
      console.error('❌ Process GCash error:', error.response?.data || error.message);
    },
  });

  const deletePayment = useMutation({
    mutationFn: paymentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEY });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_BOOKING_KEY });
      queryClient.invalidateQueries({ queryKey: AR_KEY });
      console.log('✅ Payment deleted, queries invalidated');
    },
    onError: (error) => {
      console.error('❌ Delete payment error:', error.response?.data || error.message);
    },
  });

  const checkPaymentStatus = useMutation({
    mutationFn: paymentApi.checkStatus,
    onSuccess: (data) => {
      // If payment status changed to 'paid', refresh all related data
      if (data?.status === 'paid') {
        queryClient.invalidateQueries({ queryKey: PAYMENT_KEY });
        queryClient.invalidateQueries({ queryKey: CUSTOMER_BOOKING_KEY });
        queryClient.invalidateQueries({ queryKey: AR_KEY });
        console.log('✅ Payment status is paid, refreshing all data');
      }
    },
    onError: (error) => {
      console.error('❌ Check payment status error:', error.response?.data || error.message);
    },
  });

  return {
    // Queries
    customerBookingsQuery,
    customerBookingQuery,
    paymentsQuery,
    paymentQuery,
    paymentsByBookingQuery,
    paymentStatusQuery,
    
    // Mutations
    createPayment,
    createPaymentForBooking,
    updatePayment,
    processGCashPayment,
    deletePayment,
    checkPaymentStatus,
  };
};