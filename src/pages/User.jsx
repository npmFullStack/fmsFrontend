import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, RefreshCw, UserPlus, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

import { useUser } from '../hooks/useUser';
import { useOptimizedApi } from '../hooks/useOptimizedApi';
import TableLayout from '../components/layout/TableLayout';
import UserTable from '../components/tables/UserTable';
import AddUser from '../components/modals/AddUser';
import DeleteUser from '../components/modals/DeleteUser';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const User = () => {
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);
    const [restoringUser, setRestoringUser] = useState(null); // Add this state
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch] = useDebounce(searchTerm, 500);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('id');
    const [direction, setDirection] = useState('asc');
    const [forceRefresh, setForceRefresh] = useState(0);

    // Optimized API hook
    const { optimizedRequest, cancelRequest, clearCache } = useOptimizedApi();

    // useUser hook handles everything
    const {
        usersQuery,
        createUser,
        deleteUser,
        restoreUser, // You'll need to add this to useUser hook
    } = useUser();

    // Fetch users with optimization
    const { data, isLoading, isError, refetch } = usersQuery({
        search: debouncedSearch,
        page,
        per_page: 10,
        sort,
        direction,
        _refresh: forceRefresh
    });

    const users = data?.data || [];
    const pagination = {
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
        from: data?.from || 0,
        to: data?.to || 0,
        total: data?.total || 0,
    };

    const handleSortChange = useCallback((field, dir) => {
        setSort(field);
        setDirection(dir);
    }, []);

    // Refresh data function
    const handleRefresh = useCallback(() => {
        clearCache('users');
        setForceRefresh(prev => prev + 1);
        toast.success('Data refreshed');
    }, [clearCache]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cancelRequest('users');
        };
    }, [cancelRequest]);

    /* ==========================
     * CRUD ACTIONS
     * ========================== */
    const handleAddCustomer = useCallback(async (userData) => {
        try {
            await createUser.mutateAsync(userData);
            clearCache('users');
            toast.success('Customer added successfully');
            setIsAddCustomerModalOpen(false);
        } catch (error) {
            console.error('Add customer error:', error);
            toast.error(error.response?.data?.message || 'Failed to add customer');
        }
    }, [createUser, clearCache]);

    const handleAddAdmin = useCallback(async (userData) => {
        try {
            const adminData = { ...userData, role: 'admin' };
            await createUser.mutateAsync(adminData);
            clearCache('users');
            toast.success('Admin added successfully');
            setIsAddAdminModalOpen(false);
        } catch (error) {
            console.error('Add admin error:', error);
            toast.error(error.response?.data?.message || 'Failed to add admin');
        }
    }, [createUser, clearCache]);

    const handleDelete = useCallback(() => {
        if (deletingUser) {
            deleteUser.mutate(deletingUser.id, {
                onSuccess: () => {
                    clearCache('users');
                    toast.success('User restricted successfully');
                    setIsDeleteModalOpen(false);
                    setDeletingUser(null);
                },
                onError: (error) => {
                    console.error('Restrict user error:', error);
                    toast.error(error.response?.data?.message || 'Failed to restrict user');
                },
            });
        }
    }, [deleteUser, deletingUser, clearCache]);

    const handleRestore = useCallback(() => {
        if (restoringUser) {
            restoreUser.mutate(restoringUser.id, {
                onSuccess: () => {
                    clearCache('users');
                    toast.success('User unrestricted successfully');
                    setIsDeleteModalOpen(false); // Reuse the same modal
                    setRestoringUser(null);
                },
                onError: (error) => {
                    console.error('Unrestrict user error:', error);
                    toast.error(error.response?.data?.message || 'Failed to unrestrict user');
                },
            });
        }
    }, [restoreUser, restoringUser, clearCache]);

    const handleDeleteClick = useCallback((user) => {
        setDeletingUser(user);
        setRestoringUser(null);
        setIsDeleteModalOpen(true);
    }, []);

    const handleRestoreClick = useCallback((user) => {
        setRestoringUser(user);
        setDeletingUser(null);
        setIsDeleteModalOpen(true);
    }, []);

    /* ===============================
     * STATES
     * =============================== */
    if (isLoading && !data) {
        return (
            <div className="page-loading">
                <div className="page-loading-spinner"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="page-error">
                <div className="page-error-content">
                    <p>Failed to load users. Please try again.</p>
                    <button 
                        onClick={handleRefresh}
                        className="page-btn-primary mt-4"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    /* ===============================
     * UI
     * =============================== */
    return (
        <div className="page-container">
            {/* Page Header */}
            <div className="page-header">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="page-title">User Management</h1>
                        <p className="page-subtitle">Manage system users and their roles</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="page-btn-secondary flex items-center gap-2"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="page-table-section">
                <TableLayout
                    searchBar={
                        <SearchBar
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onClear={() => setSearchTerm("")}
                            placeholder="Search users by name, email, or phone"
                        />
                    }
                    actions={
                        <div className="page-actions flex gap-2">
                            <button
                                onClick={() => setIsAddCustomerModalOpen(true)}
                                className="page-btn-primary flex items-center gap-2"
                                disabled={createUser.isPending}
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Customer
                            </button>
                            <button
                                onClick={() => setIsAddAdminModalOpen(true)}
                                className="page-btn-secondary flex items-center gap-2"
                                disabled={createUser.isPending}
                            >
                                <Shield className="w-4 h-4" />
                                Add Admin
                            </button>
                        </div>
                    }
                >
                    <UserTable
                        data={users}
                        onDelete={handleDeleteClick} 
                        onRestore={handleRestoreClick} // Add this prop
                        sortField={sort}
                        sortDirection={direction}
                        onSortChange={handleSortChange}
                        isLoading={isLoading}
                    />
                </TableLayout>
            </div>

            {pagination.last_page > 1 && (
                <div className="page-pagination">
                    <Pagination
                        currentPage={pagination.current_page}
                        totalPages={pagination.last_page}
                        onPageChange={setPage}
                    />
                </div>
            )}

            {/* Modals */}
            <AddUser
                isOpen={isAddCustomerModalOpen}
                onClose={() => setIsAddCustomerModalOpen(false)}
                onSave={handleAddCustomer}
                isLoading={createUser.isPending}
                title="Add Customer"
            />

            <AddUser
                isOpen={isAddAdminModalOpen}
                onClose={() => setIsAddAdminModalOpen(false)}
                onSave={handleAddAdmin}
                isLoading={createUser.isPending}
                title="Add Admin"
            />

            {/* Reuse DeleteUser modal for both restrict and unrestrict */}
            <DeleteUser
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingUser(null);
                    setRestoringUser(null);
                }}
                onDelete={deletingUser ? handleDelete : handleRestore}
                user={deletingUser || restoringUser}
                isLoading={deleteUser.isPending || restoreUser.isPending}
                isRestore={!!restoringUser} // Add this prop to indicate unrestrict mode
            />
        </div>
    );
};

export default User;