import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../index';
import toast from 'react-hot-toast';

// Create booking mutation
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookingData) => {
      const res = await api.post('/bookings', bookingData);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Booking submitted successfully! Please wait for admin verification.');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit booking');
    },
  });
};

// Update booking status mutation
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await api.put(`/bookings/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Booking status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update booking status');
    },
  });
};