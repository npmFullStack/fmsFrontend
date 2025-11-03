// src/hooks/useCategory.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const CATEGORY_KEY = ['categories'];

// ✅ API functions
const categoryApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/categories', { params });
    return data;
  },
  getOne: async (id) => {
    const { data } = await api.get(`/categories/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/categories', payload);
    return data;
  },
  update: async ({ id, ...payload }) => {
    const { data } = await api.put(`/categories/${id}`, payload);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },
  bulkDelete: async (ids) => {
    const { data } = await api.post('/categories/bulk-destroy', { ids });
    return data;
  },
  restore: async (id) => {
    const { data } = await api.put(`/categories/${id}/restore`);
    return data;
  },
};

// ✅ Hook
export const useCategory = () => {
  const queryClient = useQueryClient();

  // Fetch all categories with optional params
  const categoriesQuery = (params = {}) => useQuery({
    queryKey: [...CATEGORY_KEY, params],
    queryFn: () => categoryApi.getAll(params),
  });

  // Create category
  const createCategory = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(CATEGORY_KEY);
      console.log('✅ Category created successfully');
    },
    onError: (error) => {
      console.error('❌ Create error:', error.response?.data || error.message);
    },
  });

  // Update category
  const updateCategory = useMutation({
    mutationFn: categoryApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries(CATEGORY_KEY);
      console.log('✅ Category updated');
    },
    onError: (error) => {
      console.error('❌ Update error:', error.response?.data || error.message);
    },
  });

  // Delete category (soft delete)
  const deleteCategory = useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(CATEGORY_KEY);
      console.log('✅ Category deleted');
    },
    onError: (error) => {
      console.error('❌ Delete error:', error.response?.data || error.message);
    },
  });

  // Bulk delete categories
  const bulkDeleteCategories = useMutation({
    mutationFn: categoryApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries(CATEGORY_KEY);
      console.log('✅ Bulk delete successful');
    },
    onError: (error) => {
      console.error('❌ Bulk delete error:', error.response?.data || error.message);
    },
  });

  // Restore category
  const restoreCategory = useMutation({
    mutationFn: categoryApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries(CATEGORY_KEY);
      console.log('✅ Category restored');
    },
    onError: (error) => {
      console.error('❌ Restore error:', error.response?.data || error.message);
    },
  });

  return {
    categoriesQuery,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkDeleteCategories,
    restoreCategory,
  };
};