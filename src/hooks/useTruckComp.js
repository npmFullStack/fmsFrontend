import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff } from '../utils/retry';
import api from '../api';

const TRUCK_COMP_KEY = ['truck_comps'];

// Enhanced API functions with retry and timeout handling
const truckCompApi = {
  getAll: async (params = {}, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get('/truck-comps', { params, signal }),
      3, // maxRetries
      1000, // baseDelay
      30000 // timeout
    );
    return data;
  },
  
  getOne: async (id, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/truck-comps/${id}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },
  
  create: async (payload) => {
    const { data } = await retryWithBackoff(
      () => api.post('/truck-comps', payload),
      2, // Fewer retries for mutations
      1000,
      45000 // Longer timeout for creation
    );
    return data;
  },
  
  update: async ({ id, ...payload }) => {
    const { data } = await retryWithBackoff(
      () => api.put(`/truck-comps/${id}`, payload),
      2,
      1000,
      30000
    );
    return data;
  },
  
  delete: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.delete(`/truck-comps/${id}`),
      2,
      1000,
      30000
    );
    return data;
  },
  
  bulkDelete: async (ids) => {
    const { data } = await retryWithBackoff(
      () => api.post('/truck-comps/bulk-delete', { ids }),
      2,
      1000,
      45000 // Longer timeout for bulk operations
    );
    return data;
  },
  
  restore: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.post(`/truck-comps/${id}/restore`),
      2,
      1000,
      30000
    );
    return data;
  },
};

export const useTruckComp = () => {
  const queryClient = useQueryClient();

  // ✅ Enhanced truck companies query with optimized options
  const truckCompsQuery = (params = {}) => useQuery({
    queryKey: [...TRUCK_COMP_KEY, params],
    queryFn: ({ signal }) => truckCompApi.getAll(params, signal),
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

  // Fetch single truck company with enhanced options
  const truckCompQuery = (id) => useQuery({
    queryKey: [...TRUCK_COMP_KEY, id],
    queryFn: ({ signal }) => truckCompApi.getOne(id, signal),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for single truck company
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Enhanced mutations with better error handling
  const createTruckComp = useMutation({
    mutationFn: truckCompApi.create,
    onSuccess: (data) => {
      // Invalidate and refetch truck companies
      queryClient.invalidateQueries({ queryKey: TRUCK_COMP_KEY });
      console.log('✅ Truck company created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('❌ Create truck company error:', error.response?.data || error.message);
      throw error;
    },
  });

  const updateTruckComp = useMutation({
    mutationFn: truckCompApi.update,
    onSuccess: (data) => {
      // Invalidate specific truck company and all truck companies
      queryClient.invalidateQueries({ queryKey: TRUCK_COMP_KEY });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: [...TRUCK_COMP_KEY, data.id] });
      }
      console.log('✅ Truck company updated successfully');
    },
    onError: (error) => {
      console.error('❌ Update truck company error:', error.response?.data || error.message);
    },
  });

  const deleteTruckComp = useMutation({
    mutationFn: truckCompApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRUCK_COMP_KEY });
      console.log('✅ Truck company deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Delete truck company error:', error.response?.data || error.message);
    },
  });

  const bulkDeleteTruckComps = useMutation({
    mutationFn: truckCompApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRUCK_COMP_KEY });
      console.log('✅ Bulk delete successful');
    },
    onError: (error) => {
      console.error('❌ Bulk delete error:', error.response?.data || error.message);
    },
  });

  const restoreTruckComp = useMutation({
    mutationFn: truckCompApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRUCK_COMP_KEY });
      console.log('✅ Truck company restored successfully');
    },
    onError: (error) => {
      console.error('❌ Restore truck company error:', error.response?.data || error.message);
    },
  });

  return {
    // Queries
    truckCompsQuery,
    truckCompQuery,
    // Mutations
    createTruckComp,
    updateTruckComp,
    deleteTruckComp,
    bulkDeleteTruckComps,
    restoreTruckComp,
  };
};