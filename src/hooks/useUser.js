import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const USER_KEY = ['users'];

// API functions
const userApi = {
    getUsers: async (params = {}) => {
        const { data } = await api.get('/users', { params });
        return data;
    },
    getUser: async (id) => {
        const { data } = await api.get(`/users/${id}`);
        return data;
    },
    createUser: async (userData) => {
        const { data } = await api.post('/users', userData);
        return data;
    },
    updateUser: async ({ id, ...userData }) => {
        const { data } = await api.put(`/users/${id}`, userData);
        return data;
    },
    deleteUser: async (id) => {
        const { data } = await api.delete(`/users/${id}`);
        return data;
    },
    bulkDeleteUsers: async (ids) => {
        const { data } = await api.post('/users/bulk-delete', { ids });
        return data;
    },
    promoteUser: async (id) => {
        const { data } = await api.post(`/users/${id}/promote`);
        return data;
    },
};

// Hook
export const useUser = () => {
    const queryClient = useQueryClient();

    // Get users with search and pagination - FIXED: This should be a function that returns useQuery
    const usersQuery = (params) => 
        useQuery({
            queryKey: [...USER_KEY, params],
            queryFn: () => userApi.getUsers(params),
            keepPreviousData: true,
        });

    // Create user
    const createUser = useMutation({
        mutationFn: userApi.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries(USER_KEY);
        },
    });

    // Update user
    const updateUser = useMutation({
        mutationFn: userApi.updateUser,
        onSuccess: () => {
            queryClient.invalidateQueries(USER_KEY);
        },
    });

    // Delete user
    const deleteUser = useMutation({
        mutationFn: userApi.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries(USER_KEY);
        },
    });

    // Bulk delete users
    const bulkDeleteUsers = useMutation({
        mutationFn: userApi.bulkDeleteUsers,
        onSuccess: () => {
            queryClient.invalidateQueries(USER_KEY);
        },
    });

    // Promote user
    const promoteUser = useMutation({
        mutationFn: userApi.promoteUser,
        onSuccess: () => {
            queryClient.invalidateQueries(USER_KEY);
        },
    });

    return {
        usersQuery,
        createUser,
        updateUser,
        deleteUser,
        bulkDeleteUsers,
        promoteUser,
    };
};