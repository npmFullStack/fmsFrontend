// src/hooks/useAP.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const AP_KEY = ['accounts-payables'];

// ✅ API functions
const apApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/accounts-payables', { params });
    return data;
  },
  getOne: async (id) => {
    const { data } = await api.get(`/accounts-payables/${id}`);
    return data;
  },
  getByBooking: async (bookingId) => {
    const { data } = await api.get(`/accounts-payables/booking/${bookingId}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/accounts-payables', payload);
    return data;
  },
  update: async ({ id, ...payload }) => {
    const { data } = await api.put(`/accounts-payables/${id}`, payload);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/accounts-payables/${id}`);
    return data;
  },
  updateChargeStatus: async (apId, chargeType, chargeId, payload) => {
    const { data } = await api.put(`/accounts-payables/${apId}/${chargeType}/${chargeId}`, payload);
    return data;
  },
};

// ✅ Hook
export const useAP = () => {
  const queryClient = useQueryClient();

  // Fetch all AP records with optional params
  const apQuery = (params = {}) => useQuery({
    queryKey: [...AP_KEY, params],
    queryFn: () => apApi.getAll(params),
  });

  // Fetch AP by booking ID
  const apByBookingQuery = (bookingId) => useQuery({
    queryKey: [...AP_KEY, 'booking', bookingId],
    queryFn: () => apApi.getByBooking(bookingId),
    enabled: !!bookingId,
  });


const createAP = useMutation({
  mutationFn: apApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries(AP_KEY);
    console.log('✅ AP record created successfully');
  },
  onError: (error) => {
    console.error('❌ Create error:', error.response?.data || error.message);
  },
});


  // Update AP record
  const updateAP = useMutation({
    mutationFn: apApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries(AP_KEY);
      console.log('✅ AP record updated');
    },
    onError: (error) => {
      console.error('❌ Update error:', error.response?.data || error.message);
    },
  });

  // Delete AP record
  const deleteAP = useMutation({
    mutationFn: apApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(AP_KEY);
      console.log('✅ AP record deleted');
    },
    onError: (error) => {
      console.error('❌ Delete error:', error.response?.data || error.message);
    },
  });

  // Update charge status
  const updateChargeStatus = useMutation({
    mutationFn: ({ apId, chargeType, chargeId, payload }) => 
      apApi.updateChargeStatus(apId, chargeType, chargeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(AP_KEY);
      console.log('✅ Charge status updated');
    },
    onError: (error) => {
      console.error('❌ Charge update error:', error.response?.data || error.message);
    },
  });

  return {
    apQuery,
    apByBookingQuery,
    createAP,
    updateAP,
    deleteAP,
    updateChargeStatus,
  };
};