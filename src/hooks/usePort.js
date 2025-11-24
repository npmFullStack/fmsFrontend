// src/hooks/usePort.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff } from '../utils/retry';
import api from '../api';

const PORT_KEY = ['ports'];

// ✅ Enhanced API functions with retry and timeout handling
const portApi = {
  getAll: async (params = {}, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get('/ports', { params, signal }),
      3, // maxRetries
      1000, // baseDelay
      30000 // timeout
    );
    return data;
  },
  getOne: async (id, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/ports/${id}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },
  create: async (payload) => {
    const { data } = await retryWithBackoff(
      () => api.post('/ports', payload),
      2, // Fewer retries for mutations
      1000,
      45000 // Longer timeout for creation
    );
    return data;
  },
  update: async ({ id, ...payload }) => {
    const { data } = await retryWithBackoff(
      () => api.put(`/ports/${id}`, payload),
      2,
      1000,
      30000
    );
    return data;
  },
  delete: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.delete(`/ports/${id}`),
      2,
      1000,
      30000
    );
    return data;
  },
  bulkDelete: async (ids) => {
    const { data } = await retryWithBackoff(
      () => api.post('/ports/bulk-destroy', { ids }),
      2,
      1000,
      45000 // Longer timeout for bulk operations
    );
    return data;
  },
  restore: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.put(`/ports/${id}/restore`),
      2,
      1000,
      30000
    );
    return data;
  },
};

// ✅ Enhanced Hook
export const usePort = () => {
  const queryClient = useQueryClient();

  // Fetch all ports with enhanced options
  const portsQuery = (params = {}) => useQuery({
    queryKey: [...PORT_KEY, params],
    queryFn: ({ signal }) => portApi.getAll(params, signal),
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

  // Fetch single port with enhanced options
  const portQuery = (id) => useQuery({
    queryKey: [...PORT_KEY, id],
    queryFn: ({ signal }) => portApi.getOne(id, signal),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for single port
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Enhanced mutations with better error handling
  const createPort = useMutation({
    mutationFn: portApi.create,
    onSuccess: (data) => {
      // Invalidate and refetch ports
      queryClient.invalidateQueries({ queryKey: PORT_KEY });
      console.log('✅ Port created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('❌ Create port error:', error.response?.data || error.message);
      throw error;
    },
  });

  const updatePort = useMutation({
    mutationFn: portApi.update,
    onSuccess: (data) => {
      // Invalidate specific port and all ports
      queryClient.invalidateQueries({ queryKey: PORT_KEY });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: [...PORT_KEY, data.id] });
      }
      console.log('✅ Port updated successfully');
    },
    onError: (error) => {
      console.error('❌ Update port error:', error.response?.data || error.message);
    },
  });

  const deletePort = useMutation({
    mutationFn: portApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PORT_KEY });
      console.log('✅ Port deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Delete port error:', error.response?.data || error.message);
    },
  });

  const bulkDeletePorts = useMutation({
    mutationFn: portApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PORT_KEY });
      console.log('✅ Bulk delete successful');
    },
    onError: (error) => {
      console.error('❌ Bulk delete error:', error.response?.data || error.message);
    },
  });

  const restorePort = useMutation({
    mutationFn: portApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PORT_KEY });
      console.log('✅ Port restored successfully');
    },
    onError: (error) => {
      console.error('❌ Restore port error:', error.response?.data || error.message);
    },
  });

  return {
    // Queries
    portsQuery,
    portQuery,
    // Mutations
    createPort,
    updatePort,
    deletePort,
    bulkDeletePorts,
    restorePort,
  };
};