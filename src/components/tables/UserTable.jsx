import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from '../ui/DataTable';
import BulkActionBar from '../ui/BulkActionBar';
import DeleteUser from '../modals/DeleteUser';
import { ChevronUp, ChevronDown, Shield, User, Trash2, ArrowUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { toUpperCase } from '../../utils/formatters';

const UserTable = ({ 
    data = [],
    onEdit,
    onDelete,
    onPromote,
    onSortChange,
    sortField = 'id',
    sortDirection = 'asc',
    isLoading = false,
}) => {
    const [selected, setSelected] = useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingUsers, setDeletingUsers] = useState([]);

    useEffect(() => setSelected([]), [data]);

    const handleBulkDelete = useCallback(() => {
        if (!selected.length) return;
        const usersToDelete = data.filter((item) => selected.includes(item.id));
        setDeletingUsers(usersToDelete);
        setDeleteModalOpen(true);
    }, [selected, data]);

    const handleConfirmDelete = useCallback(async () => {
        try {
            onDelete(deletingUsers);
            setDeleteModalOpen(false);
            setDeletingUsers([]);
        } catch (err) {
            toast.error(err.message || 'Failed to delete users');
        }
    }, [deletingUsers, onDelete]);

    const handleBulkEdit = useCallback(() => {
        if (selected.length === 1) {
            const userToEdit = data.find((item) => item.id === selected[0]);
            if (userToEdit && onEdit) {
                onEdit(userToEdit);
            }
        } else {
            toast.error('Please select only one user to edit');
        }
    }, [selected, data, onEdit]);

    const handleBulkPromote = useCallback(() => {
        if (selected.length === 1) {
            const userToPromote = data.find((item) => item.id === selected[0]);
            if (userToPromote && onPromote) {
                // Only allow promoting customers
                if (userToPromote.role === 'customer') {
                    onPromote(userToPromote);
                } else {
                    toast.error('Only customers can be promoted to admin');
                }
            }
        } else {
            toast.error('Please select only one user to promote');
        }
    }, [selected, data, onPromote]);

    const handleBulkCancel = useCallback(() => setSelected([]), []);

    const handleSort = useCallback(
        (field) => {
            if (!onSortChange) return;
            const newDirection =
                sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
            onSortChange(field, newDirection);
        },
        [sortField, sortDirection, onSortChange]
    );

    const getSortIcon = useCallback(
        (field) => {
            const baseClass = 'table-sort-icon';

            if (sortField !== field) {
                return <ChevronUp className={`${baseClass} table-sort-inactive`} />;
            }

            return sortDirection === 'asc' ? (
                <ChevronUp className={`${baseClass} table-sort-active`} />
            ) : (
                <ChevronDown className={`${baseClass} table-sort-active`} />
            );
        },
        [sortField, sortDirection]
    );

    const getRoleBadge = useCallback((role) => {
        const baseClass = "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-2";
        switch (role) {
            case 'admin':
                return `${baseClass} bg-blue-600 text-content border border-blue-200`;
            case 'customer':
                return `${baseClass} bg-gray-800 text-content border border-gray-200`;
            default:
                return `${baseClass} bg-gray-100 text-gray-800 border border-gray-200`;
        }
    }, []);

    const getRoleIcon = useCallback((role) => {
        switch (role) {
            case 'admin':
                return <Shield className="w-3.5 h-3" />;
            case 'customer':
                return <User className="w-3 h-3" />;
            default:
                return <User className="w-3 h-3" />;
        }
    }, []);

    const formatRole = useCallback((role) => {
        return role.charAt(0).toUpperCase() + role.slice(1);
    }, []);

    // Filter out general_manager users from display
    const filteredData = useMemo(() => {
        return data.filter(user => user.role !== 'general_manager');
    }, [data]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: () => (
                    <button onClick={() => handleSort('id')} className="table-header-button">
                        ID {getSortIcon('id')}
                    </button>
                ),
                cell: ({ getValue }) => (
                    <span className="table-cell-monospace table-cell-content">
                        {getValue()}
                    </span>
                ),
                meta: { cellClassName: 'table-cell-center' },
            },
            {
                accessorKey: 'first_name',
                header: () => (
                    <button onClick={() => handleSort('first_name')} className="table-header-button">
                        FIRST NAME {getSortIcon('first_name')}
                    </button>
                ),
                cell: ({ getValue }) => (
                    <span className="table-cell-content font-medium">
                        {toUpperCase(getValue())}
                    </span>
                ),
            },
            {
                accessorKey: 'last_name',
                header: () => (
                    <button onClick={() => handleSort('last_name')} className="table-header-button">
                        LAST NAME {getSortIcon('last_name')}
                    </button>
                ),
                cell: ({ getValue }) => (
                    <span className="table-cell-content font-medium">
                        {toUpperCase(getValue())}
                    </span>
                ),
            },
            {
                accessorKey: 'email',
                header: () => (
                    <button onClick={() => handleSort('email')} className="table-header-button">
                        EMAIL {getSortIcon('email')}
                    </button>
                ),
                cell: ({ getValue }) => (
                    <span className="table-cell-content">
                        {getValue()}
                    </span>
                ),
            },
            {
                accessorKey: 'contact_number',
                header: () => (
                    <button onClick={() => handleSort('contact_number')} className="table-header-button">
                        PHONE {getSortIcon('contact_number')}
                    </button>
                ),
                cell: ({ getValue }) => (
                    <span className="table-cell-content">
                        {getValue() || '-'}
                    </span>
                ),
            },
            {
                accessorKey: 'role',
                header: () => (
                    <button onClick={() => handleSort('role')} className="table-header-button">
                        ROLE {getSortIcon('role')}
                    </button>
                ),
                cell: ({ getValue }) => (
                    <span className={getRoleBadge(getValue())}>
                        {getRoleIcon(getValue())}
                        {formatRole(getValue())}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: () => <span className="table-header-button">ACTIONS</span>,
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        {row.original.role === 'customer' && (
                            <button
                                onClick={() => onPromote?.(row.original)}
                                className="px-2 py-1 bg-blue-500 text-white
                                rounded-lg text-xs font-medium hover:bg-blue-600
                                transition-all duration-200 shadow-sm
                                hover:shadow-md flex items-center gap-2 group"
                                title="Promote to Admin"
                            >
                                <ArrowUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Promote
                            </button>
                        )}
                        <button
                            onClick={() => onDelete?.(row.original)}
                            className="px-2 py-1 bg-red-500 text-white
                            rounded-lg text-xs font-medium hover:bg-red-600
                            transition-all duration-200 shadow-sm
                            hover:shadow-md flex items-center gap-2 group"
                        >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Delete
                        </button>
                    </div>
                ),
                meta: { headerClassName: 'w-40', cellClassName: 'w-40' },
            },
        ],
        [sortField, sortDirection, handleSort, getSortIcon, getRoleBadge, getRoleIcon, formatRole, onEdit, onDelete, onPromote]
    );

    return (
        <div className="table-container">
            <DataTable
                columns={columns}
                data={filteredData}
                isLoading={isLoading}
                emptyMessage="No users found. Add your first user above."
            />

            <DeleteUser
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setDeletingUsers([]);
                }}
                onDelete={handleConfirmDelete}
                user={deletingUsers.length === 1 ? deletingUsers[0] : null}
                users={deletingUsers.length > 1 ? deletingUsers : null}
                isLoading={false}
            />

            <BulkActionBar
                selectedCount={selected.length}
                onEdit={handleBulkEdit}
                onDelete={handleBulkDelete}
                onPromote={handleBulkPromote}
                onCancel={handleBulkCancel}
                disableEdit={selected.length !== 1}
                disablePromote={selected.length !== 1}
            />
        </div>
    );
};

export default UserTable;