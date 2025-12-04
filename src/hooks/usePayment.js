// src/hooks/usePayment.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff } from '../utils/retry';
import api from '../api';

const PAYMENT_KEY = ['payments'];

const paymentApi = {
  // Get all payments (for admin)
  getAll: async (params = {}, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get('/payments', { params, signal }),
      3,
      1000,
      30000
    );
    return data;
  },

  // Get single payment
  getOne: async (id, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/payments/${id}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },

  // Create payment (for customer)
  create: async (payload) => {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(payload).forEach(key => {
      if (key === 'gcash_receipt_image' && payload[key]) {
        formData.append(key, payload[key]);
      } else if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key]);
      }
    });

    const { data } = await retryWithBackoff(
      () => api.post('/payments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }),
      2,
      1000,
      45000
    );
    return data;
  },

  // Update payment status (for admin)
  updateStatus: async ({ id, status, admin_notes }) => {
    const { data } = await retryWithBackoff(
      () => api.put(`/payments/${id}/status`, { status, admin_notes }),
      2,
      1000,
      30000
    );
    return data;
  },

  // Delete payment (for admin)
  delete: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.delete(`/payments/${id}`),
      2,
      1000,
      30000
    );
    return data;
  },

  // Get payments by booking
  getByBooking: async (bookingId, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/payments/booking/${bookingId}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },

  // Get customer's payments
  getCustomerPayments: async (params = {}, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get('/payments/customer/my-payments', { params, signal }),
      3,
      1000,
      30000
    );
    return data;
  },
};

export const usePayment = () => {
  const queryClient = useQueryClient();

  // Fetch all payments (admin)
  const paymentsQuery = (params = {}) => useQuery({
    queryKey: [...PAYMENT_KEY, params],
    queryFn: ({ signal }) => paymentApi.getAll(params, signal),
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

  // Fetch single payment
  const paymentQuery = (id) => useQuery({
    queryKey: [...PAYMENT_KEY, id],
    queryFn: ({ signal }) => paymentApi.getOne(id, signal),
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

  // Fetch payments by booking
  const paymentsByBookingQuery = (bookingId) => useQuery({
    queryKey: [...PAYMENT_KEY, 'booking', bookingId],
    queryFn: ({ signal }) => paymentApi.getByBooking(bookingId, signal),
    enabled: !!bookingId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch customer payments
  const customerPaymentsQuery = (params = {}) => useQuery({
    queryKey: [...PAYMENT_KEY, 'customer', params],
    queryFn: ({ signal }) => paymentApi.getCustomerPayments(params, signal),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Create payment mutation
  const createPayment = useMutation({
    mutationFn: paymentApi.create,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEY });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['accounts-receivables'] });
      
      // Invalidate specific booking
      if (data?.booking_id) {
        queryClient.invalidateQueries({ queryKey: ['bookings', data.booking_id] });
        queryClient.invalidateQueries({ queryKey: ['accounts-receivables', 'booking', data.booking_id] });
      }
      console.log('✅ Payment created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('❌ Create payment error:', error.response?.data || error.message);
      throw error;
    },
  });

  // Create payment for booking (simplified version)
  const createPaymentForBooking = useMutation({
    mutationFn: async ({ bookingId, ...payload }) => {
      const paymentData = {
        booking_id: bookingId,
        ...payload
      };
      return paymentApi.create(paymentData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEY });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['accounts-receivables'] });
      
      if (data?.booking_id) {
        queryClient.invalidateQueries({ queryKey: ['bookings', data.booking_id] });
        
        // Update the booking cache immediately with new AR data
        queryClient.setQueryData(['bookings', data.booking_id], (oldData) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            accounts_receivable: {
              ...oldData.accounts_receivable,
              collectible_amount: data.remaining_balance || 0,
              payment_method: data.payment_method || data.payment?.payment_method,
              is_paid: data.is_paid || false
            }
          };
        });
        
        // Also update customer bookings list cache
        queryClient.setQueriesData(
          { queryKey: ['bookings', 'customer'] },
          (oldData) => {
            if (!oldData || !oldData.data) return oldData;
            
            return {
              ...oldData,
              data: oldData.data.map(booking => {
                if (booking.id === data.booking_id) {
                  return {
                    ...booking,
                    accounts_receivable: {
                      ...booking.accounts_receivable,
                      collectible_amount: data.remaining_balance || 0,
                      payment_method: data.payment_method || data.payment?.payment_method,
                      is_paid: data.is_paid || false
                    }
                  };
                }
                return booking;
              })
            };
          }
        );
      }
    },
    onError: (error) => {
      console.error('❌ Create payment for booking error:', error.response?.data || error.message);
      throw error;
    },
  });

  // Update payment status mutation
  const updatePaymentStatus = useMutation({
    mutationFn: paymentApi.updateStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEY });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: [...PAYMENT_KEY, data.id] });
      }
      // Also invalidate AR and booking queries since payment status affects them
      queryClient.invalidateQueries({ queryKey: ['accounts-receivables'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  // Delete payment mutation
  const deletePayment = useMutation({
    mutationFn: paymentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEY });
      queryClient.invalidateQueries({ queryKey: ['accounts-receivables'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  return {
    // Queries
    paymentsQuery,
    paymentQuery,
    paymentsByBookingQuery,
    customerPaymentsQuery,
    
    // Mutations
    createPayment,
    createPaymentForBooking,
    updatePaymentStatus,
    deletePayment,
  };
};