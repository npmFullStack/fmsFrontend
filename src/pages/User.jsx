import React, { useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

import { useUser } from '../hooks/useUser';
import TableLayout from '../components/layout/TableLayout';
import UserTable from '../components/tables/UserTable';
import AddUser from '../components/modals/AddUser';
import DeleteUser from '../components/modals/DeleteUser';
import PromoteUser from '../components/modals/PromoteUser';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const User = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);
    const [deletingUsers, setDeletingUsers] = useState(null);
    const [promotingUser, setPromotingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch] = useDebounce(searchTerm, 500);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('id');
    const [direction, setDirection] = useState('asc');

    // useUser hook handles everything
    const {
        usersQuery,
        createUser,
        updateUser,
        deleteUser,
        bulkDeleteUsers,
        promoteUser,
    } = useUser();

    // Fetch users (server-side pagination & search)
    const { data, isLoading, isError } = usersQuery({
        search: debouncedSearch,
        page,
        per_page: 10,
        sort,
        direction
    });

    // Client-side sorting (fallback if server-side sorting isn't working)
    const sortedUsers = useMemo(() => {
        if (!data?.data) return [];
        return [...data.data].sort((a, b) => {
            let aVal = a[sort];
            let bVal = b[sort];

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            return direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });
    }, [data?.data, sort, direction]);

    const users = sortedUsers;
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

    /* ==========================
     * CRUD ACTIONS
     * ========================== */
    const handleAdd = useCallback(
        async (userData) => {
            try {
                await createUser.mutateAsync(userData);
                toast.success('User added successfully');
                setIsAddModalOpen(false);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to add user');
            }
        },
        [createUser]
    );

    const handleUpdate = useCallback(
        async (id, userData) => {
            try {
                await updateUser.mutateAsync({ id, ...userData });
                toast.success('User updated successfully');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update user');
            }
        },
        [updateUser]
    );

    const handleDelete = useCallback(() => {
        if (deletingUsers) {
            const ids = deletingUsers.map((user) => user.id);
            bulkDeleteUsers.mutate(ids, {
                onSuccess: (res) => {
                    toast.success(res?.message || 'Users deleted successfully');
                },
                onError: (error) => {
                    toast.error(error.response?.data?.message || 'Failed to delete users');
                },
            });
        } else if (deletingUser) {
            deleteUser.mutate(deletingUser.id, {
                onSuccess: () => {
                    toast.success('User deleted successfully');
                },
                onError: (error) => {
                    toast.error(error.response?.data?.message || 'Failed to delete user');
                },
            });
        }
        setIsDeleteModalOpen(false);
        setDeletingUser(null);
        setDeletingUsers(null);
    }, [deleteUser, bulkDeleteUsers, deletingUser, deletingUsers]);

    const handlePromote = useCallback(() => {
        if (!promotingUser) return;
        
        promoteUser.mutate(promotingUser.id, {
            onSuccess: () => {
                toast.success('User promoted to admin successfully');
                setIsPromoteModalOpen(false);
                setPromotingUser(null);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to promote user');
            },
        });
    }, [promoteUser, promotingUser]);

    const handleEditClick = useCallback((user) => {
        handleUpdate(user.id, user);
    }, [handleUpdate]);

    const handleDeleteClick = useCallback((userOrUsers) => {
        if (Array.isArray(userOrUsers)) {
            setDeletingUsers(userOrUsers);
            setDeletingUser(null);
        } else {
            setDeletingUser(userOrUsers);
            setDeletingUsers(null);
        }
        setIsDeleteModalOpen(true);
    }, []);

    const handlePromoteClick = useCallback((user) => {
        setPromotingUser(user);
        setIsPromoteModalOpen(true);
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
                    Failed to load users. Please try again.
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
                <h1 className="page-title">User Management</h1>
                <p className="page-subtitle">Manage system users and their roles</p>
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
                        <div className="page-actions">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="page-btn-primary"
                            >
                                <Plus className="page-btn-icon" />
                                Add User
                            </button>
                            <button className="page-btn-secondary">
                                <Filter className="page-btn-icon" />
                                Filter
                            </button>
                        </div>
                    }
                >
                    <UserTable
                        data={users}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onPromote={handlePromoteClick}
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
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAdd}
                isLoading={createUser.isPending}
            />

            <DeleteUser
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingUser(null);
                    setDeletingUsers(null);
                }}
                onDelete={handleDelete}
                user={deletingUser}
                users={deletingUsers}
                isLoading={deleteUser.isPending || bulkDeleteUsers.isPending}
            />

            <PromoteUser
                isOpen={isPromoteModalOpen}
                onClose={() => {
                    setIsPromoteModalOpen(false);
                    setPromotingUser(null);
                }}
                onPromote={handlePromote}
                user={promotingUser}
                isLoading={promoteUser.isPending}
            />
        </div>
    );
};

export default User;