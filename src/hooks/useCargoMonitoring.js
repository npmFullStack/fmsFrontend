// src/hooks/useCargoMonitoring.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff } from '../utils/retry';
import api from '../api';

const CARGO_MONITORING_KEY = ['cargo-monitoring'];

// ✅ Enhanced API functions with retry and timeout handling
const cargoMonitoringApi = {
  getAll: async (params = {}, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get('/cargo-monitoring', { params, signal }),
      3, // maxRetries
      1000, // baseDelay
      30000 // timeout
    );
    return data;
  },
  
  getByBooking: async (bookingId, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/cargo-monitoring/booking/${bookingId}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },
  
  updateStatus: async ({ id, status, timestamp }) => {
    const { data } = await retryWithBackoff(
      () => api.put(`/cargo-monitoring/${id}/status`, { 
        status, 
        timestamp 
      }),
      2, // Fewer retries for mutations
      1000,
      30000
    );
    return data;
  },
  
  getOne: async (id, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/cargo-monitoring/${id}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  }
};

// ✅ Enhanced Hook
export const useCargoMonitoring = () => {
  const queryClient = useQueryClient();

  // ✅ Enhanced cargo monitoring query with optimized options
  const cargoMonitoringQuery = (params = {}) => useQuery({
    queryKey: [...CARGO_MONITORING_KEY, params],
    queryFn: ({ signal }) => cargoMonitoringApi.getAll(params, signal),
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

  // Fetch cargo monitoring by booking ID with enhanced options
  const cargoMonitoringByBookingQuery = (bookingId) => useQuery({
    queryKey: [...CARGO_MONITORING_KEY, 'booking', bookingId],
    queryFn: ({ signal }) => cargoMonitoringApi.getByBooking(bookingId, signal),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000, // 5 minutes for specific booking
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Fetch single cargo monitoring with enhanced options
  const cargoMonitoringDetailQuery = (id) => useQuery({
    queryKey: [...CARGO_MONITORING_KEY, id],
    queryFn: ({ signal }) => cargoMonitoringApi.getOne(id, signal),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for single record
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // ✅ Enhanced mutation with better error handling
  const updateCargoStatus = useMutation({
    mutationFn: cargoMonitoringApi.updateStatus,
    onSuccess: (data) => {
      // Invalidate specific cargo monitoring and all cargo monitoring
      queryClient.invalidateQueries({ queryKey: CARGO_MONITORING_KEY });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: [...CARGO_MONITORING_KEY, data.id] });
      }
      console.log('✅ Cargo status updated successfully', data);
    },
    onError: (error) => {
      console.error('❌ Update cargo status error:', error.response?.data || error.message);
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