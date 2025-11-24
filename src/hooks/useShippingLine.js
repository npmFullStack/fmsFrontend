import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff } from '../utils/retry';
import api from '../api';

const SHIPPING_LINE_KEY = ['shipping_lines'];

// Enhanced API functions with retry and timeout handling
const shippingLineApi = {
  getAll: async (params = {}, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get('/shipping-lines', { params, signal }),
      3, // maxRetries
      1000, // baseDelay
      30000 // timeout
    );
    return data;
  },

  getOne: async (id, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/shipping-lines/${id}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },

  create: async (payload) => {
    const { data } = await retryWithBackoff(
      () => api.post('/shipping-lines', payload),
      2, // Fewer retries for mutations
      1000,
      45000 // Longer timeout for creation
    );
    return data;
  },

  update: async ({ id, ...payload }) => {
    const { data } = await retryWithBackoff(
      () => api.put(`/shipping-lines/${id}`, payload),
      2,
      1000,
      30000
    );
    return data;
  },

  delete: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.delete(`/shipping-lines/${id}`),
      2,
      1000,
      30000
    );
    return data;
  },

  bulkDelete: async (ids) => {
    const { data } = await retryWithBackoff(
      () => api.post('/shipping-lines/bulk-delete', { ids }),
      2,
      1000,
      45000 // Longer timeout for bulk operations
    );
    return data;
  },

  restore: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.put(`/shipping-lines/${id}/restore`),
      2,
      1000,
      30000
    );
    return data;
  },
};

// Enhanced Hook
export const useShippingLine = () => {
  const queryClient = useQueryClient();

  // ✅ Enhanced shipping lines query with optimized options
  const shippingLinesQuery = (params = {}) => useQuery({
    queryKey: [...SHIPPING_LINE_KEY, params],
    queryFn: ({ signal }) => shippingLineApi.getAll(params, signal),
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

  // Fetch single shipping line with enhanced options
  const shippingLineQuery = (id) => useQuery({
    queryKey: [...SHIPPING_LINE_KEY, id],
    queryFn: ({ signal }) => shippingLineApi.getOne(id, signal),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for single shipping line
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Enhanced mutations with better error handling
  const createShippingLine = useMutation({
    mutationFn: shippingLineApi.create,
    onSuccess: (data) => {
      // Invalidate and refetch shipping lines
      queryClient.invalidateQueries({ queryKey: SHIPPING_LINE_KEY });
      console.log('✅ Shipping line created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('❌ Create shipping line error:', error.response?.data || error.message);
      throw error;
    },
  });

  const updateShippingLine = useMutation({
    mutationFn: shippingLineApi.update,
    onSuccess: (data) => {
      // Invalidate specific shipping line and all shipping lines
      queryClient.invalidateQueries({ queryKey: SHIPPING_LINE_KEY });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: [...SHIPPING_LINE_KEY, data.id] });
      }
      console.log('✅ Shipping line updated successfully');
    },
    onError: (error) => {
      console.error('❌ Update shipping line error:', error.response?.data || error.message);
    },
  });

  const deleteShippingLine = useMutation({
    mutationFn: shippingLineApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHIPPING_LINE_KEY });
      console.log('✅ Shipping line deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Delete shipping line error:', error.response?.data || error.message);
    },
  });

  const bulkDeleteShippingLines = useMutation({
    mutationFn: shippingLineApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHIPPING_LINE_KEY });
      console.log('✅ Bulk delete successful');
    },
    onError: (error) => {
      console.error('❌ Bulk delete error:', error.response?.data || error.message);
    },
  });

  const restoreShippingLine = useMutation({
    mutationFn: shippingLineApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHIPPING_LINE_KEY });
      console.log('✅ Shipping line restored successfully');
    },
    onError: (error) => {
      console.error('❌ Restore shipping line error:', error.response?.data || error.message);
    },
  });

  return {
    // Queries
    shippingLinesQuery,
    shippingLineQuery,
    // Mutations
    createShippingLine,
    updateShippingLine,
    deleteShippingLine,
    bulkDeleteShippingLines,
    restoreShippingLine,
  };
};