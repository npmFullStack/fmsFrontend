// src/hooks/useBooking.js - UPDATED VERSION
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff } from '../utils/retry';
import api from '../api';

const BOOKING_KEY = ['bookings'];
const CUSTOMER_BOOKING_KEY = ['customer-bookings'];

// Enhanced API functions with retry and timeout handling
const bookingApi = {
  // ADMIN BOOKING METHODS
  getAll: async (params = {}, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get('/bookings', { params, signal }),
      3, // maxRetries
      1000, // baseDelay
      30000 // timeout
    );
    return data;
  },
  getOne: async (id, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/bookings/${id}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },
  create: async (payload) => {
    const { data } = await retryWithBackoff(
      () => api.post('/bookings', payload),
      2, // Fewer retries for mutations
      1000,
      45000 // Longer timeout for creation
    );
    return data;
  },
  update: async ({ id, ...payload }) => {
    const { data } = await retryWithBackoff(
      () => api.put(`/bookings/${id}`, payload),
      2,
      1000,
      30000
    );
    return data;
  },
  delete: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.delete(`/bookings/${id}`),
      2,
      1000,
      30000
    );
    return data;
  },
  bulkDelete: async (ids) => {
    const { data } = await retryWithBackoff(
      () => api.post('/bookings/bulk-delete', { ids }),
      2,
      1000,
      45000 // Longer timeout for bulk operations
    );
    return data;
  },
  restore: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.post(`/bookings/${id}/restore`),
      2,
      1000,
      30000
    );
    return data;
  },
  updateStatus: async ({ id, status }) => {
    const { data } = await retryWithBackoff(
      () => api.put(`/bookings/${id}`, { status }),
      2,
      1000,
      30000
    );
    return data;
  },
  updateBookingStatus: async ({ id, booking_status }) => {
    const { data } = await retryWithBackoff(
      () => api.put(`/bookings/${id}`, { booking_status }),
      2,
      1000,
      30000
    );
    return data;
  },
  approve: async (id) => {
  const { data } = await retryWithBackoff(
    () => api.post(`/bookings/${id}/approve`),
    2,
    1000,
    45000 // 45 seconds timeout
  );
  return data;
},

  // CUSTOMER BOOKING METHODS
  getCustomerBookings: async (params = {}, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get('/customer/bookings', { params, signal }),
      3,
      1000,
      30000
    );
    return data;
  },
  createCustomerBooking: async (payload) => {
    const { data } = await retryWithBackoff(
      () => api.post('/customer/bookings', payload),
      2,
      1000,
      45000
    );
    return data;
  },
  getCustomerBooking: async (id, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/customer/bookings/${id}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },

  // QUOTE METHODS
  quote: async (payload) => {
    const { data } = await retryWithBackoff(
      () => api.post('/bookings/quote', payload),
      2,
      1000,
      45000
    );
    return data;
  },
};

// Hook
export const useBooking = () => {
  const queryClient = useQueryClient();

  // ADMIN QUERIES
  const bookingsQuery = (params = {}) => useQuery({
    queryKey: [...BOOKING_KEY, params],
    queryFn: ({ signal }) => bookingApi.getAll(params, signal),
    staleTime: 2 * 60 * 1000, // 2 minutes - data stays fresh for 2 mins
    gcTime: 10 * 60 * 1000, // 10 minutes - cache time
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });

  const bookingQuery = (id) => useQuery({
    queryKey: [...BOOKING_KEY, id],
    queryFn: ({ signal }) => bookingApi.getOne(id, signal),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // CUSTOMER QUERIES
  const customerBookingsQuery = (params = {}) => useQuery({
    queryKey: [...CUSTOMER_BOOKING_KEY, params],
    queryFn: ({ signal }) => bookingApi.getCustomerBookings(params, signal),
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

  const customerBookingQuery = (id) => useQuery({
    queryKey: [...CUSTOMER_BOOKING_KEY, id],
    queryFn: ({ signal }) => bookingApi.getCustomerBooking(id, signal),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // ADMIN MUTATIONS
  const createBooking = useMutation({
    mutationFn: bookingApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEY });
      console.log('✅ Admin booking created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('❌ Create admin booking error:', error.response?.data || error.message);
      throw error;
    },
  });

  const updateBooking = useMutation({
    mutationFn: bookingApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEY });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: [...BOOKING_KEY, data.id] });
      }
      console.log('✅ Booking updated successfully');
    },
    onError: (error) => {
      console.error('❌ Update booking error:', error.response?.data || error.message);
    },
  });

  const deleteBooking = useMutation({
    mutationFn: bookingApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEY });
      console.log('✅ Booking deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Delete booking error:', error.response?.data || error.message);
    },
  });

  const bulkDeleteBookings = useMutation({
    mutationFn: bookingApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEY });
      console.log('✅ Bulk delete successful');
    },
    onError: (error) => {
      console.error('❌ Bulk delete error:', error.response?.data || error.message);
    },
  });

  const restoreBooking = useMutation({
    mutationFn: bookingApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEY });
      console.log('✅ Booking restored successfully');
    },
    onError: (error) => {
      console.error('❌ Restore booking error:', error.response?.data || error.message);
    },
  });

  const updateBookingStatus = useMutation({
    mutationFn: bookingApi.updateStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEY });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: [...BOOKING_KEY, data.id] });
      }
      console.log('✅ Booking status updated successfully');
    },
    onError: (error) => {
      console.error('❌ Update status error:', error.response?.data || error.message);
    },
  });

  const updateBookingShippingStatus = useMutation({
    mutationFn: bookingApi.updateBookingStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEY });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: [...BOOKING_KEY, data.id] });
      }
      console.log('✅ Booking shipping status updated successfully');
    },
    onError: (error) => {
      console.error('❌ Update shipping status error:', error.response?.data || error.message);
    },
  });

  const approveBooking = useMutation({
    mutationFn: bookingApi.approve,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEY });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: [...BOOKING_KEY, data.id] });
      }
      console.log('✅ Booking approved and email sent successfully');
    },
    onError: (error) => {
      console.error('❌ Approve booking error:', error.response?.data || error.message);
      throw error;
    },
  });

  // CUSTOMER MUTATIONS
  const createCustomerBooking = useMutation({
    mutationFn: bookingApi.createCustomerBooking,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_BOOKING_KEY });
      console.log('✅ Customer booking submitted successfully (pending approval)', data);
      return data;
    },
    onError: (error) => {
      console.error('❌ Create customer booking error:', error.response?.data || error.message);
      throw error;
    },
  });

  // QUOTE MUTATIONS
  const createQuote = useMutation({
    mutationFn: bookingApi.quote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEY });
      console.log('✅ Quote created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('❌ Create quote error:', error.response?.data || error.message);
      throw error;
    },
  });

  return {
    // ADMIN QUERIES
    bookingsQuery,
    bookingQuery,
    
    // CUSTOMER QUERIES
    customerBookingsQuery,
    customerBookingQuery,
    
    // ADMIN MUTATIONS
    createBooking,
    updateBooking,
    deleteBooking,
    bulkDeleteBookings,
    restoreBooking,
    updateBookingStatus,
    updateBookingShippingStatus,
    approveBooking,
    
    // CUSTOMER MUTATIONS
    createCustomerBooking,
    
    // QUOTE MUTATIONS
    createQuote,
  };
};

// Specialized hook for quote form (without user_id)
export const useCreateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingApi.quote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      console.log('✅ Quote created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('❌ Create quote error:', error.response?.data || error.message);
      throw error;
    },
  });
};

// Additional hook for optimistic updates
export const useOptimisticBooking = () => {
  const queryClient = useQueryClient();
  
  const optimisticUpdate = useMutation({
    mutationFn: bookingApi.update,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['bookings'] });
      
      const previousBookings = queryClient.getQueryData(['bookings']);
      
      queryClient.setQueryData(['bookings'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(booking =>
            booking.id === variables.id
              ? { ...booking, ...variables }
              : booking
          )
        };
      });
      
      return { previousBookings };
    },
    onError: (err, variables, context) => {
      if (context?.previousBookings) {
        queryClient.setQueryData(['bookings'], context.previousBookings);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
  
  return { optimisticUpdate };
};