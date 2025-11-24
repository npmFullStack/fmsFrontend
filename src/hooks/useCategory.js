// src/hooks/useCategory.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff } from '../utils/retry';
import api from '../api';

const CATEGORY_KEY = ['categories'];

// ✅ Enhanced API functions with retry and timeout handling
const categoryApi = {
  getAll: async (params = {}, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get('/categories', { params, signal }),
      3, // maxRetries
      1000, // baseDelay
      30000 // timeout
    );
    return data;
  },
  getOne: async (id, signal) => {
    const { data } = await retryWithBackoff(
      () => api.get(`/categories/${id}`, { signal }),
      3,
      1000,
      30000
    );
    return data;
  },
  create: async (payload) => {
    const { data } = await retryWithBackoff(
      () => api.post('/categories', payload),
      2, // Fewer retries for mutations
      1000,
      45000 // Longer timeout for creation
    );
    return data;
  },
  update: async ({ id, ...payload }) => {
    const { data } = await retryWithBackoff(
      () => api.put(`/categories/${id}`, payload),
      2,
      1000,
      30000
    );
    return data;
  },
  delete: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.delete(`/categories/${id}`),
      2,
      1000,
      30000
    );
    return data;
  },
  bulkDelete: async (ids) => {
    const { data } = await retryWithBackoff(
      () => api.post('/categories/bulk-destroy', { ids }),
      2,
      1000,
      45000 // Longer timeout for bulk operations
    );
    return data;
  },
  restore: async (id) => {
    const { data } = await retryWithBackoff(
      () => api.put(`/categories/${id}/restore`),
      2,
      1000,
      30000
    );
    return data;
  },
};

// ✅ Enhanced Hook
export const useCategory = () => {
  const queryClient = useQueryClient();

  // Fetch all categories with enhanced options
  const categoriesQuery = (params = {}) => useQuery({
    queryKey: [...CATEGORY_KEY, params],
    queryFn: ({ signal }) => categoryApi.getAll(params, signal),
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

  // Fetch single category with enhanced options
  const categoryQuery = (id) => useQuery({
    queryKey: [...CATEGORY_KEY, id],
    queryFn: ({ signal }) => categoryApi.getOne(id, signal),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for single category
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: (failureCount, error) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Enhanced mutations with better error handling
  const createCategory = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: (data) => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEY });
      console.log('✅ Category created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('❌ Create category error:', error.response?.data || error.message);
      throw error;
    },
  });

  const updateCategory = useMutation({
    mutationFn: categoryApi.update,
    onSuccess: (data) => {
      // Invalidate specific category and all categories
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEY });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: [...CATEGORY_KEY, data.id] });
      }
      console.log('✅ Category updated successfully');
    },
    onError: (error) => {
      console.error('❌ Update category error:', error.response?.data || error.message);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEY });
      console.log('✅ Category deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Delete category error:', error.response?.data || error.message);
    },
  });

  const bulkDeleteCategories = useMutation({
    mutationFn: categoryApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEY });
      console.log('✅ Bulk delete successful');
    },
    onError: (error) => {
      console.error('❌ Bulk delete error:', error.response?.data || error.message);
    },
  });

  const restoreCategory = useMutation({
    mutationFn: categoryApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEY });
      console.log('✅ Category restored successfully');
    },
    onError: (error) => {
      console.error('❌ Restore category error:', error.response?.data || error.message);
    },
  });

  return {
    // Queries
    categoriesQuery,
    categoryQuery,
    // Mutations
    createCategory,
    updateCategory,
    deleteCategory,
    bulkDeleteCategories,
    restoreCategory,
  };
};