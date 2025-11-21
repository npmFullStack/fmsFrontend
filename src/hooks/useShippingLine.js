import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const SHIPPING_LINE_KEY = ['shipping_lines'];

// API functions
const shippingLineApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/shipping-lines', { params });
    return data;
  },

  getOne: async (id) => {
    const { data } = await api.get(`/shipping-lines/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post('/shipping-lines', payload);
    return data;
  },

  update: async ({ id, ...payload }) => {
    const { data } = await api.put(`/shipping-lines/${id}`, payload);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/shipping-lines/${id}`);
    return data;
  },

bulkDelete: async (ids) => {
  const { data } = await api.post('/shipping-lines/bulk-delete', { ids });
  return data;
},

  restore: async (id) => {
    const { data } = await api.put(`/shipping-lines/${id}/restore`);
    return data;
  },
};

// Hook
export const useShippingLine = () => {
  const queryClient = useQueryClient();

  // ✅ Accept parameters for pagination, search, and sorting
  const shippingLinesQuery = (params = {}) => useQuery({
    queryKey: [...SHIPPING_LINE_KEY, params], // Include params in query key
    queryFn: () => shippingLineApi.getAll(params),
  });

  // Create
  const createShippingLine = useMutation({
    mutationFn: shippingLineApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(SHIPPING_LINE_KEY);
      console.log('Shipping line created successfully');
    },
    onError: (error) => {
      console.error('Create error', error.response?.data || error.message);
    },
  });

  // Update
  const updateShippingLine = useMutation({
    mutationFn: shippingLineApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries(SHIPPING_LINE_KEY);
      console.log('Shipping line updated');
    },
    onError: (error) => {
      console.error('Update error', error.response?.data || error.message);
    },
  });

  // Delete
  const deleteShippingLine = useMutation({
    mutationFn: shippingLineApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(SHIPPING_LINE_KEY);
      console.log('Shipping line deleted');
    },
    onError: (error) => {
      console.error('Delete error', error.response?.data || error.message);
    },
  });

  // Bulk delete
  const bulkDeleteShippingLines = useMutation({
    mutationFn: shippingLineApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries(SHIPPING_LINE_KEY);
      console.log('Bulk delete successful');
    },
    onError: (error) => {
      console.error('Bulk delete error', error.response?.data || error.message);
    },
  });

  // Restore
  const restoreShippingLine = useMutation({
    mutationFn: shippingLineApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries(SHIPPING_LINE_KEY);
      console.log('Shipping line restored');
    },
    onError: (error) => {
      console.error('Restore error', error.response?.data || error.message);
    },
  });

  return {
    shippingLinesQuery,
    createShippingLine,
    updateShippingLine,
    deleteShippingLine,
    bulkDeleteShippingLines,
    restoreShippingLine,
  };
};