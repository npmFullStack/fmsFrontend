import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { retryWithBackoff } from '../utils/retry';
import api from '../api';

const USER_KEY = ['users'];

// Enhanced API functions with retry and timeout handling
const userApi = {
    getUsers: async (params = {}, signal) => {
        const { data } = await retryWithBackoff(
            () => api.get('/users', { params, signal }),
            3, // maxRetries
            1000, // baseDelay
            30000 // timeout
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
            2, // Fewer retries for mutations
            1000,
            45000 // Longer timeout for creation
        );
        return data;
    },
    updateUser: async ({ id, ...userData }) => {
        const { data } = await retryWithBackoff(
            () => api.put(`/users/${id}`, userData),
            2,
            1000,
            30000
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
    bulkDeleteUsers: async (ids) => {
        const { data } = await retryWithBackoff(
            () => api.post('/users/bulk-delete', { ids }),
            2,
            1000,
            45000 // Longer timeout for bulk operations
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
            staleTime: 2 * 60 * 1000, // 2 minutes - data stays fresh for 2 mins
            gcTime: 10 * 60 * 1000, // 10 minutes - cache time
            keepPreviousData: true,
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

    // Get single user with enhanced options
    const userQuery = (id) => 
        useQuery({
            queryKey: [...USER_KEY, id],
            queryFn: ({ signal }) => userApi.getUser(id, signal),
            enabled: !!id,
            staleTime: 5 * 60 * 1000, // 5 minutes for single user
            gcTime: 15 * 60 * 1000, // 15 minutes cache
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
            // Invalidate and refetch users
            queryClient.invalidateQueries({ queryKey: USER_KEY });
            console.log('✅ User created successfully', data);
            return data;
        },
        onError: (error) => {
            console.error('❌ Create user error:', error.response?.data || error.message);
            throw error;
        },
    });

    const updateUser = useMutation({
        mutationFn: userApi.updateUser,
        onSuccess: (data) => {
            // Invalidate specific user and all users
            queryClient.invalidateQueries({ queryKey: USER_KEY });
            if (data?.id) {
                queryClient.invalidateQueries({ queryKey: [...USER_KEY, data.id] });
            }
            console.log('✅ User updated successfully');
        },
        onError: (error) => {
            console.error('❌ Update user error:', error.response?.data || error.message);
        },
    });

    const deleteUser = useMutation({
        mutationFn: userApi.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_KEY });
            console.log('✅ User deleted successfully');
        },
        onError: (error) => {
            console.error('❌ Delete user error:', error.response?.data || error.message);
        },
    });

    const bulkDeleteUsers = useMutation({
        mutationFn: userApi.bulkDeleteUsers,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_KEY });
            console.log('✅ Bulk delete successful');
        },
        onError: (error) => {
            console.error('❌ Bulk delete error:', error.response?.data || error.message);
        },
    });

    const promoteUser = useMutation({
        mutationFn: userApi.promoteUser,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: USER_KEY });
            if (data?.id) {
                queryClient.invalidateQueries({ queryKey: [...USER_KEY, data.id] });
            }
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
        updateUser,
        deleteUser,
        bulkDeleteUsers,
        promoteUser,
    };
};