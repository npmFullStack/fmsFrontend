// src/hooks/useContainer.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const CONTAINER_KEY = ['containers'];

// ✅ API functions
const containerApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/container-types', { params });
    return data;
  },
  getOne: async (id) => {
    const { data } = await api.get(`/container-types/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/container-types', payload);
    return data;
  },
  update: async ({ id, ...payload }) => {
    const { data } = await api.put(`/container-types/${id}`, payload);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/container-types/${id}`);
    return data;
  },
  bulkDelete: async (ids) => {
    const { data } = await api.post('/container-types/bulk-destroy', { ids });
    return data;
  },
  restore: async (id) => {
    const { data } = await api.put(`/container-types/${id}/restore`);
    return data;
  },
};

// ✅ Hook
export const useContainer = () => {
  const queryClient = useQueryClient();

  // Fetch all
  const containersQuery = useQuery({
    queryKey: CONTAINER_KEY,
    queryFn: () => containerApi.getAll(),
  });

  // Create
  const createContainer = useMutation({
    mutationFn: containerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(CONTAINER_KEY);
      console.log('✅ Container created successfully');
    },
    onError: (error) => {
      console.error('❌ Create error:', error.response?.data || error.message);
    },
  });

  // Update
  const updateContainer = useMutation({
    mutationFn: containerApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries(CONTAINER_KEY);
      console.log('✅ Container updated');
    },
    onError: (error) => {
      console.error('❌ Update error:', error.response?.data || error.message);
    },
  });

  // Delete
  const deleteContainer = useMutation({
    mutationFn: containerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(CONTAINER_KEY);
      console.log('✅ Container deleted');
    },
    onError: (error) => {
      console.error('❌ Delete error:', error.response?.data || error.message);
    },
  });

  // Bulk delete
  const bulkDeleteContainers = useMutation({
    mutationFn: containerApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries(CONTAINER_KEY);
      console.log('✅ Bulk delete successful');
    },
    onError: (error) => {
      console.error('❌ Bulk delete error:', error.response?.data || error.message);
    },
  });

  // Restore
  const restoreContainer = useMutation({
    mutationFn: containerApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries(CONTAINER_KEY);
      console.log('✅ Container restored');
    },
    onError: (error) => {
      console.error('❌ Restore error:', error.response?.data || error.message);
    },
  });

  return {
    containersQuery,
    createContainer,
    updateContainer,
    deleteContainer,
    bulkDeleteContainers,
    restoreContainer,
  };
};
