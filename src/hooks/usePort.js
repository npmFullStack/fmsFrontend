// src/hooks/usePort.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const PORT_KEY = ['ports'];

// ✅ API functions
const portApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/ports', { params });
    return data;
  },
  getOne: async (id) => {
    const { data } = await api.get(`/ports/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/ports', payload);
    return data;
  },
  update: async ({ id, ...payload }) => {
    const { data } = await api.put(`/ports/${id}`, payload);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/ports/${id}`);
    return data;
  },
  bulkDelete: async (ids) => {
    const { data } = await api.post('/ports/bulk-destroy', { ids });
    return data;
  },
  restore: async (id) => {
    const { data } = await api.put(`/ports/${id}/restore`);
    return data;
  },
};

// ✅ Hook
export const usePort = () => {
  const queryClient = useQueryClient();

  // Fetch all ports with optional params
  const portsQuery = (params = {}) => useQuery({
    queryKey: [...PORT_KEY, params],
    queryFn: () => portApi.getAll(params),
  });

  // Create port
  const createPort = useMutation({
    mutationFn: portApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(PORT_KEY);
      console.log('✅ Port created successfully');
    },
    onError: (error) => {
      console.error('❌ Create error:', error.response?.data || error.message);
    },
  });

  // Update port
  const updatePort = useMutation({
    mutationFn: portApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries(PORT_KEY);
      console.log('✅ Port updated');
    },
    onError: (error) => {
      console.error('❌ Update error:', error.response?.data || error.message);
    },
  });

  // Delete port (soft delete)
  const deletePort = useMutation({
    mutationFn: portApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(PORT_KEY);
      console.log('✅ Port deleted');
    },
    onError: (error) => {
      console.error('❌ Delete error:', error.response?.data || error.message);
    },
  });

  // Bulk delete ports
  const bulkDeletePorts = useMutation({
    mutationFn: portApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries(PORT_KEY);
      console.log('✅ Bulk delete successful');
    },
    onError: (error) => {
      console.error('❌ Bulk delete error:', error.response?.data || error.message);
    },
  });

  // Restore port
  const restorePort = useMutation({
    mutationFn: portApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries(PORT_KEY);
      console.log('✅ Port restored');
    },
    onError: (error) => {
      console.error('❌ Restore error:', error.response?.data || error.message);
    },
  });

  return {
    portsQuery,
    createPort,
    updatePort,
    deletePort,
    bulkDeletePorts,
    restorePort,
  };
};