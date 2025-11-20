// src/hooks/useBooking.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const BOOKING_KEY = ['bookings'];

// API functions
const bookingApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/bookings', { params });
    return data;
  },
  getOne: async (id) => {
    const { data } = await api.get(`/bookings/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/bookings', payload);
    return data;
  },
  quote: async (payload) => {
    const { data } = await api.post('/bookings/quote', payload);
    return data;
  },
  update: async ({ id, ...payload }) => {
    const { data } = await api.put(`/bookings/${id}`, payload);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/bookings/${id}`);
    return data;
  },
  bulkDelete: async (ids) => {
    const { data } = await api.post('/bookings/bulk-delete', { ids }); // ✅ FIXED - using POST
    return data;
  },
  restore: async (id) => {
    const { data } = await api.post(`/bookings/${id}/restore`);
    return data;
  },
  updateStatus: async ({ id, status }) => {
    const { data } = await api.put(`/bookings/${id}`, { status });
    return data;
  },
  updateBookingStatus: async ({ id, booking_status }) => {
    const { data } = await api.put(`/bookings/${id}`, { booking_status });
    return data;
  },
  approve: async (id) => {
    const { data } = await api.post(`/bookings/${id}/approve`);
    return data;
  },
};

// Hook
export const useBooking = () => {
  const queryClient = useQueryClient();

  // Fetch all bookings with optional params
  const bookingsQuery = (params = {}) => useQuery({
    queryKey: [...BOOKING_KEY, params],
    queryFn: () => bookingApi.getAll(params),
  });

  // Fetch single booking
  const bookingQuery = (id) => useQuery({
    queryKey: [...BOOKING_KEY, id],
    queryFn: () => bookingApi.getOne(id),
    enabled: !!id,
  });

  // Create booking
  const createBooking = useMutation({
    mutationFn: bookingApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries(BOOKING_KEY);
      console.log('Booking created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('Create booking error:', error.response?.data || error.message);
      throw error;
    },
  });

  // Create quote
  const createQuote = useMutation({
    mutationFn: bookingApi.quote,
    onSuccess: (data) => {
      queryClient.invalidateQueries(BOOKING_KEY);
      console.log('Quote created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('Create quote error:', error.response?.data || error.message);
      throw error;
    },
  });

  // Update booking
  const updateBooking = useMutation({
    mutationFn: bookingApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries(BOOKING_KEY);
      console.log('✔️ Booking updated');
    },
    onError: (error) => {
      console.error('✗️ Update booking error:', error.response?.data || error.message);
    },
  });

  // Delete booking (soft delete)
  const deleteBooking = useMutation({
    mutationFn: bookingApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(BOOKING_KEY);
      console.log('✔️ Booking deleted');
    },
    onError: (error) => {
      console.error('✗️ Delete booking error:', error.response?.data || error.message);
    },
  });

  // Bulk delete bookings - FIXED
  const bulkDeleteBookings = useMutation({
    mutationFn: bookingApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries(BOOKING_KEY);
      console.log('✔️ Bulk delete successful');
    },
    onError: (error) => {
      console.error('✗️ Bulk delete error:', error.response?.data || error.message);
    },
  });

  // Restore booking
  const restoreBooking = useMutation({
    mutationFn: bookingApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries(BOOKING_KEY);
      console.log('✔️ Booking restored');
    },
    onError: (error) => {
      console.error('✗️ Restore booking error:', error.response?.data || error.message);
    },
  });

  // Update booking status (admin approval: pending/approved/rejected)
  const updateBookingStatus = useMutation({
    mutationFn: bookingApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(BOOKING_KEY);
      console.log('✔️ Booking status updated');
    },
    onError: (error) => {
      console.error('✗️ Update status error:', error.response?.data || error.message);
    },
  });

  // Update booking shipping status (pending/in_transit/delivered)
  const updateBookingShippingStatus = useMutation({
    mutationFn: bookingApi.updateBookingStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(BOOKING_KEY);
      console.log('✔️ Booking shipping status updated');
    },
    onError: (error) => {
      console.error('✗️ Update shipping status error:', error.response?.data || error.message);
    },
  });

  // Approve booking (with email sending)
  const approveBooking = useMutation({
    mutationFn: bookingApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries(BOOKING_KEY);
      console.log('✔️ Booking approved and email sent');
    },
    onError: (error) => {
      console.error('✗️ Approve booking error:', error.response?.data || error.message);
      throw error;
    },
  });

  return {
    // Queries
    bookingsQuery,
    bookingQuery,
    // Mutations
    createBooking,
    createQuote,
    updateBooking,
    deleteBooking,
    bulkDeleteBookings, // ✅ Now this will work with POST
    restoreBooking,
    updateBookingStatus,
    updateBookingShippingStatus,
    approveBooking,
  };
};

// Specialized hook for quote form (without user_id)
export const useCreateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingApi.quote,
    onSuccess: (data) => {
      queryClient.invalidateQueries(BOOKING_KEY);
      console.log('✔ Quote created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('✗ Create quote error:', error.response?.data || error.message);
      throw error;
    },
  });
};