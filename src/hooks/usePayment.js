// [file name]: usePayment.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const PAYMENT_KEY = ['payments'];
const CUSTOMER_BOOKING_KEY = ['customer-bookings'];

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
    const { data } = await api.post(`/customer/bookings/${bookingId}/pay`, payload);
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
};

// Hook
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

  // Mutations
  const createPayment = useMutation({
    mutationFn: paymentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(PAYMENT_KEY);
      queryClient.invalidateQueries(CUSTOMER_BOOKING_KEY);
      console.log('✅ Payment created successfully');
    },
    onError: (error) => {
      console.error('❌ Create payment error:', error.response?.data || error.message);
    },
  });

  const createPaymentForBooking = useMutation({
    mutationFn: ({ bookingId, ...payload }) => paymentApi.createForBooking(bookingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(PAYMENT_KEY);
      queryClient.invalidateQueries(CUSTOMER_BOOKING_KEY);
      console.log('✅ Payment created successfully');
    },
    onError: (error) => {
      console.error('❌ Create payment error:', error.response?.data || error.message);
    },
  });

  const updatePayment = useMutation({
    mutationFn: paymentApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries(PAYMENT_KEY);
      console.log('✅ Payment updated');
    },
    onError: (error) => {
      console.error('❌ Update payment error:', error.response?.data || error.message);
    },
  });

  const processGCashPayment = useMutation({
    mutationFn: ({ id, ...payload }) => paymentApi.processGCash(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(PAYMENT_KEY);
      queryClient.invalidateQueries(CUSTOMER_BOOKING_KEY);
      console.log('✅ GCash payment processed');
    },
    onError: (error) => {
      console.error('❌ Process GCash error:', error.response?.data || error.message);
    },
  });

  const deletePayment = useMutation({
    mutationFn: paymentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(PAYMENT_KEY);
      console.log('✅ Payment deleted');
    },
    onError: (error) => {
      console.error('❌ Delete payment error:', error.response?.data || error.message);
    },
  });

  return {
    // Queries
    customerBookingsQuery,
    customerBookingQuery,
    paymentsQuery,
    paymentQuery,
    paymentsByBookingQuery,
    
    // Mutations
    createPayment,
    createPaymentForBooking,
    updatePayment,
    processGCashPayment,
    deletePayment,
  };
};