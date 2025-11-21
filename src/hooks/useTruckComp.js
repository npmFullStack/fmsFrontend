import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const TRUCK_COMP_KEY = ['truck_comps'];

const truckCompApi = {
  getAll: async (params = {}) => (await api.get('/truck-comps', { params })).data,
  getOne: async (id) => (await api.get(`/truck-comps/${id}`)).data,
  create: async (payload) => (await api.post('/truck-comps', payload)).data,
  update: async ({ id, ...payload }) => (await api.put(`/truck-comps/${id}`, payload)).data,
  delete: async (id) => (await api.delete(`/truck-comps/${id}`)).data,
  bulkDelete: async (ids) => (await api.post('/truck-comps/bulk-delete', { ids })).data,
  restore: async (id) => (await api.post(`/truck-comps/${id}/restore`)).data,
};

export const useTruckComp = () => {
  const queryClient = useQueryClient();

  // ✅ Accept parameters and pass them to the API
  const truckCompsQuery = (params = {}) => useQuery({
    queryKey: [...TRUCK_COMP_KEY, params], // Include params in query key for proper caching
    queryFn: () => truckCompApi.getAll(params),
  });

  const createTruckComp = useMutation({
    mutationFn: truckCompApi.create,
    onSuccess: () => queryClient.invalidateQueries(TRUCK_COMP_KEY),
  });

  const updateTruckComp = useMutation({
    mutationFn: truckCompApi.update,
    onSuccess: () => queryClient.invalidateQueries(TRUCK_COMP_KEY),
  });

  const deleteTruckComp = useMutation({
    mutationFn: truckCompApi.delete,
    onSuccess: () => queryClient.invalidateQueries(TRUCK_COMP_KEY),
  });

  const bulkDeleteTruckComps = useMutation({
    mutationFn: truckCompApi.bulkDelete,
    onSuccess: () => queryClient.invalidateQueries(TRUCK_COMP_KEY),
  });

  const restoreTruckComp = useMutation({
    mutationFn: truckCompApi.restore,
    onSuccess: () => queryClient.invalidateQueries(TRUCK_COMP_KEY),
  });

  return {
    truckCompsQuery,
    createTruckComp,
    updateTruckComp,
    deleteTruckComp,
    bulkDeleteTruckComps,
    restoreTruckComp,
  };
};
