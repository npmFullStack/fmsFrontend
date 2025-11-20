// src/hooks/useCargoMonitoring.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const CARGO_MONITORING_KEY = ['cargo-monitoring'];

// API functions
const cargoMonitoringApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/cargo-monitoring', { params });
    return data;
  },
  
  getByBooking: async (bookingId) => {
    const { data } = await api.get(`/cargo-monitoring/booking/${bookingId}`);
    return data;
  },
  
  updateStatus: async ({ id, status, timestamp }) => {
  const { data } = await api.put(`/cargo-monitoring/${id}/status`, { 
    status, 
    timestamp 
  });
  return data;
},
  
  getOne: async (id) => {
    const { data } = await api.get(`/cargo-monitoring/${id}`);
    return data;
  }
};

// Hook
export const useCargoMonitoring = () => {
  const queryClient = useQueryClient();

  // Fetch all cargo monitoring with bookings
  const cargoMonitoringQuery = (params = {}) => useQuery({
    queryKey: [...CARGO_MONITORING_KEY, params],
    queryFn: () => cargoMonitoringApi.getAll(params),
  });

  // Fetch cargo monitoring by booking ID
  const cargoMonitoringByBookingQuery = (bookingId) => useQuery({
    queryKey: [...CARGO_MONITORING_KEY, 'booking', bookingId],
    queryFn: () => cargoMonitoringApi.getByBooking(bookingId),
    enabled: !!bookingId,
  });

  // Fetch single cargo monitoring
  const cargoMonitoringDetailQuery = (id) => useQuery({
    queryKey: [...CARGO_MONITORING_KEY, id],
    queryFn: () => cargoMonitoringApi.getOne(id),
    enabled: !!id,
  });

  // Update status mutation
  const updateCargoStatus = useMutation({
    mutationFn: cargoMonitoringApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(CARGO_MONITORING_KEY);
      console.log('✔️ Cargo status updated successfully');
    },
    onError: (error) => {
      console.error('✗️ Update cargo status error:', error.response?.data || error.message);
      throw error;
    },
  });

  return {
    // Queries
    cargoMonitoringQuery,
    cargoMonitoringByBookingQuery,
    cargoMonitoringDetailQuery,
    
    // Mutations
    updateCargoStatus,
  };
};