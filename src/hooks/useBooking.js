// src/hooks/useBooking.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff } from '../utils/retry';
import api from '../api';

const BOOKING_KEY = ['bookings'];

// Enhanced API functions with retry and timeout handling
const bookingApi = {
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
  quote: async (payload) => {
    const { data } = await retryWithBackoff(
      () => api.post('/bookings/quote', payload),
      2,
      1000,
      45000
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
      45000 // Longer timeout for approval (email sending)
    );
    return data;
  },
};

// Hook
export const useBooking = () => {
  const queryClient = useQueryClient();

  // Fetch all bookings with enhanced options
  const bookingsQuery = (params = {}) => useQuery({
    queryKey: [...BOOKING_KEY, params],
    queryFn: ({ signal }) => bookingApi.getAll(params, signal),
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

  // Fetch single booking with enhanced options
  const bookingQuery = (id) => useQuery({
    queryKey: [...BOOKING_KEY, id],
    queryFn: ({ signal }) => bookingApi.getOne(id, signal),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for single booking
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Enhanced mutations with better error handling
  const createBooking = useMutation({
    mutationFn: bookingApi.create,
    onSuccess: (data) => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: BOOKING_KEY });
      console.log('✅ Booking created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('❌ Create booking error:', error.response?.data || error.message);
      throw error;
    },
  });

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

  const updateBooking = useMutation({
    mutationFn: bookingApi.update,
    onSuccess: (data) => {
      // Invalidate specific booking and all bookings
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

  return {
    // Queries
    bookingsQuery,
    bookingQuery,
    // Mutations
    createBooking,
    createQuote,
    updateBooking,
    deleteBooking,
    bulkDeleteBookings,
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
      queryClient.invalidateQueries({ queryKey: BOOKING_KEY });
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
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: BOOKING_KEY });
      
      // Snapshot the previous value
      const previousBookings = queryClient.getQueryData(BOOKING_KEY);
      
      // Optimistically update to the new value
      queryClient.setQueryData(BOOKING_KEY, (old) => {
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
      
      // Return context with the snapshotted value
      return { previousBookings };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousBookings) {
        queryClient.setQueryData(BOOKING_KEY, context.previousBookings);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: BOOKING_KEY });
    },
  });
  
  return { optimisticUpdate };
};