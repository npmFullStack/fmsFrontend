// src/hooks/useContainer.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff } from '../utils/retry';
import api from '../api';

const CONTAINER_KEY = ['containers'];

// ✅ Enhanced API functions with retry and timeout handling
const containerApi = {
  getAll: async (params = {}, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get('/container-types', { params, signal }),
      3, // maxRetries
      1000, // baseDelay
      30000 // timeout
    );
    return data;
  },
  getOne: async (id, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/container-types/${id}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },
  create: async (payload) => {
    const { data } = await retryWithBackoff(
      () => api.post('/container-types', payload),
      2, // Fewer retries for mutations
      1000,
      45000 // Longer timeout for creation
    );
    return data;
  },
  update: async ({ id, ...payload }) => {
    const { data } = await retryWithBackoff(
      () => api.put(`/container-types/${id}`, payload),
      2,
      1000,
      30000
    );
    return data;
  },
  delete: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.delete(`/container-types/${id}`),
      2,
      1000,
      30000
    );
    return data;
  },
  bulkDelete: async (ids) => {
    const { data } = await retryWithBackoff(
      () => api.post('/container-types/bulk-destroy', { ids }),
      2,
      1000,
      45000 // Longer timeout for bulk operations
    );
    return data;
  },
  restore: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.put(`/container-types/${id}/restore`),
      2,
      1000,
      30000
    );
    return data;
  },
};

// ✅ Enhanced Hook
export const useContainer = () => {
  const queryClient = useQueryClient();

  // Fetch all containers with enhanced options
  const containersQuery = (params = {}) => useQuery({
    queryKey: [...CONTAINER_KEY, params],
    queryFn: ({ signal }) => containerApi.getAll(params, signal),
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

  // Fetch single container with enhanced options
  const containerQuery = (id) => useQuery({
    queryKey: [...CONTAINER_KEY, id],
    queryFn: ({ signal }) => containerApi.getOne(id, signal),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for single container
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Enhanced mutations with better error handling
  const createContainer = useMutation({
    mutationFn: containerApi.create,
    onSuccess: (data) => {
      // Invalidate and refetch containers
      queryClient.invalidateQueries({ queryKey: CONTAINER_KEY });
      console.log('✅ Container type created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('❌ Create container type error:', error.response?.data || error.message);
      throw error;
    },
  });

  const updateContainer = useMutation({
    mutationFn: containerApi.update,
    onSuccess: (data) => {
      // Invalidate specific container and all containers
      queryClient.invalidateQueries({ queryKey: CONTAINER_KEY });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: [...CONTAINER_KEY, data.id] });
      }
      console.log('✅ Container type updated successfully');
    },
    onError: (error) => {
      console.error('❌ Update container type error:', error.response?.data || error.message);
    },
  });

  const deleteContainer = useMutation({
    mutationFn: containerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTAINER_KEY });
      console.log('✅ Container type deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Delete container type error:', error.response?.data || error.message);
    },
  });

  const bulkDeleteContainers = useMutation({
    mutationFn: containerApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTAINER_KEY });
      console.log('✅ Bulk delete successful');
    },
    onError: (error) => {
      console.error('❌ Bulk delete error:', error.response?.data || error.message);
    },
  });

  const restoreContainer = useMutation({
    mutationFn: containerApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTAINER_KEY });
      console.log('✅ Container type restored successfully');
    },
    onError: (error) => {
      console.error('❌ Restore container type error:', error.response?.data || error.message);
    },
  });

  return {
    // Queries
    containersQuery,
    containerQuery,
    // Mutations
    createContainer,
    updateContainer,
    deleteContainer,
    bulkDeleteContainers,
    restoreContainer,
  };
};