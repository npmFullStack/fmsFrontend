import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff } from '../utils/retry';
import api from '../api';

const USER_KEY = ['users'];

// Enhanced API functions with retry and timeout handling
const userApi = {
    getUsers: async (params = {}, signal) => {
        const { data } = await retryWithBackoff(
            () => api.get('/users', { params, signal }),
            3,
            1000,
            30000
        );
        return data;
    },
    getUser: async (id, signal) => {
        const { data } = await retryWithBackoff(
            () => api.get(`/users/${id}`, { signal }),
            3,
            1000,
            30000
        );
        return data;
    },
    createUser: async (userData) => {
        const { data } = await retryWithBackoff(
            () => api.post('/users', userData),
            2,
            1000,
            45000
        );
        return data;
    },
    deleteUser: async (id) => {
        const { data } = await retryWithBackoff(
            () => api.delete(`/users/${id}`),
            2,
            1000,
            30000
        );
        return data;
    },
    restoreUser: async (id) => {
        const { data } = await retryWithBackoff(
            () => api.post(`/users/${id}/restore`),
            2,
            1000,
            30000
        );
        return data;
    },
    promoteUser: async (id) => {
        const { data } = await retryWithBackoff(
            () => api.post(`/users/${id}/promote`),
            2,
            1000,
            30000
        );
        return data;
    },
};

// Enhanced Hook
export const useUser = () => {
    const queryClient = useQueryClient();

    // Get users with enhanced options
    const usersQuery = (params = {}) => 
        useQuery({
            queryKey: [...USER_KEY, params],
            queryFn: ({ signal }) => userApi.getUsers(params, signal),
            staleTime: 2 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            keepPreviousData: true,
            retry: (failureCount, error) => {
                if (error.response?.status >= 400 && error.response?.status < 500) {
                    return false;
                }
                return failureCount < 2;
            },
            refetchOnWindowFocus: false,
        });

    // Get single user with enhanced options
    const userQuery = (id) => 
        useQuery({
            queryKey: [...USER_KEY, id],
            queryFn: ({ signal }) => userApi.getUser(id, signal),
            enabled: !!id,
            staleTime: 5 * 60 * 1000,
            gcTime: 15 * 60 * 1000,
            retry: (failureCount, error) => {
                if (error.response?.status >= 400 && error.response?.status < 500) {
                    return false;
                }
                return failureCount < 2;
            },
        });

    // Enhanced mutations with better error handling
    const createUser = useMutation({
        mutationFn: userApi.createUser,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: USER_KEY });
            console.log('✅ User created successfully', data);
            return data;
        },
        onError: (error) => {
            console.error('❌ Create user error:', error.response?.data || error.message);
            throw error;
        },
    });

    const deleteUser = useMutation({
        mutationFn: userApi.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_KEY });
            console.log('✅ User restricted successfully');
        },
        onError: (error) => {
            console.error('❌ Restrict user error:', error.response?.data || error.message);
            throw error;
        },
    });

    const restoreUser = useMutation({
        mutationFn: userApi.restoreUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_KEY });
            console.log('✅ User unrestricted successfully');
        },
        onError: (error) => {
            console.error('❌ Unrestrict user error:', error.response?.data || error.message);
            throw error;
        },
    });

    const promoteUser = useMutation({
        mutationFn: userApi.promoteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_KEY });
            console.log('✅ User promoted successfully');
        },
        onError: (error) => {
            console.error('❌ Promote user error:', error.response?.data || error.message);
            throw error;
        },
    });

    return {
        // Queries
        usersQuery,
        userQuery,
        // Mutations
        createUser,
        deleteUser,
        restoreUser,
        promoteUser,
    };
};