import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from '../ui/DataTable';
import BulkActionBar from '../ui/BulkActionBar';
import DeleteUser from '../modals/DeleteUser';
import { ChevronUp, ChevronDown, Shield, User, Trash2, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { toUpperCase } from '../../utils/formatters';

const UserTable = ({ 
    data = [],
    onEdit,
    onDelete,
    onRestrict,
    onSortChange,
    sortField = 'id',
    sortDirection = 'asc',
    isLoading = false,
    currentUserRole,
}) => {
    const [selected, setSelected] = useState([]);
    const [restrictModalOpen, setRestrictModalOpen] = useState(false);
    const [restrictingUsers, setRestrictingUsers] = useState([]);

    useEffect(() => setSelected([]), [data]);

    const handleBulkRestrict = useCallback(() => {
        if (!selected.length) return;
        
        // Check permissions for bulk restrict
        if (currentUserRole !== 'admin' && currentUserRole !== 'general_manager') {
            toast.error('You do not have permission to restrict users');
            return;
        }

        const usersToRestrict = data.filter((item) => selected.includes(item.id));
        
        // Check if trying to restrict admin/general_manager without proper permissions
        const hasRestrictedUsers = usersToRestrict.some(user => 
            (user.role === 'admin' || user.role === 'general_manager') && 
            currentUserRole !== 'general_manager'
        );

        if (hasRestrictedUsers) {
            toast.error('Only general managers can restrict admin users');
            return;
        }

        setRestrictingUsers(usersToRestrict);
        setRestrictModalOpen(true);
    }, [selected, data, currentUserRole]);

    const handleConfirmRestrict = useCallback(async () => {
        try {
            onDelete(restrictingUsers); // Using onDelete for soft delete/restrict
            setRestrictModalOpen(false);
            setRestrictingUsers([]);
        } catch (err) {
            toast.error(err.message || 'Failed to restrict users');
        }
    }, [restrictingUsers, onDelete]);

    const handleBulkEdit = useCallback(() => {
        if (selected.length === 1) {
            const userToEdit = data.find((item) => item.id === selected[0]);
            if (userToEdit && onEdit) {
                // Check permissions for editing admin/general_manager
                if ((userToEdit.role === 'admin' || userToEdit.role === 'general_manager') && 
                    currentUserRole !== 'general_manager') {
                    toast.error('Only general managers can edit admin users');
                    return;
                }
                onEdit(userToEdit);
            }
        } else {
            toast.error('Please select only one user to edit');
        }
    }, [selected, data, onEdit, currentUserRole]);

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
            case 'general_manager':
                return `${baseClass} bg-purple-600 text-white border border-purple-200`;
            case 'admin':
                return `${baseClass} bg-blue-600 text-white border border-blue-200`;
            case 'customer':
                return `${baseClass} bg-gray-800 text-white border border-gray-200`;
            default:
                return `${baseClass} bg-gray-100 text-gray-800 border border-gray-200`;
        }
    }, []);

    const getRoleIcon = useCallback((role) => {
        switch (role) {
            case 'general_manager':
                return <Shield className="w-3.5 h-3" />;
            case 'admin':
                return <Shield className="w-3.5 h-3" />;
            case 'customer':
                return <User className="w-3 h-3" />;
            default:
                return <User className="w-3 h-3" />;
        }
    }, []);

    const formatRole = useCallback((role) => {
        return role.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }, []);

    // Filter out general_manager users from display for non-general managers
    // Also filter out soft-deleted users (is_deleted = true)
    const filteredData = useMemo(() => {
        let filtered = data.filter(user => !user.is_deleted); // Exclude soft-deleted users
        
        if (currentUserRole !== 'general_manager') {
            filtered = filtered.filter(user => user.role !== 'general_manager');
        }
        return filtered;
    }, [data, currentUserRole]);

    const canRestrictUser = useCallback((user) => {
        if (currentUserRole === 'general_manager') return true;
        if (currentUserRole === 'admin') {
            return user.role === 'customer'; // Admins can only restrict customers
        }
        return false; // Customers can't restrict anyone
    }, [currentUserRole]);

    const canEditUser = useCallback((user) => {
        if (currentUserRole === 'general_manager') return true;
        if (currentUserRole === 'admin') {
            return user.role === 'customer'; // Admins can only edit customers
        }
        return false; // Customers can't edit anyone
    }, [currentUserRole]);

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
                cell: ({ row }) => {
                    const user = row.original;
                    const canEdit = canEditUser(user);
                    const canRestrict = canRestrictUser(user);

                    return (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onEdit?.(user)}
                                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 group ${
                                    canEdit 
                                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                }`}
                                disabled={!canEdit}
                                title={canEdit ? "Edit user" : "You don't have permission to edit this user"}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete?.(user)}
                                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 group ${
                                    canRestrict 
                                        ? 'bg-orange-500 text-white hover:bg-orange-600' 
                                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                }`}
                                disabled={!canRestrict}
                                title={canRestrict ? "Restrict user" : "You don't have permission to restrict this user"}
                            >
                                <UserX className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Restrict
                            </button>
                        </div>
                    );
                },
                meta: { headerClassName: 'w-40', cellClassName: 'w-40' },
            },
        ],
        [
            sortField, sortDirection, handleSort, getSortIcon, getRoleBadge, 
            getRoleIcon, formatRole, onEdit, onDelete, canEditUser, canRestrictUser
        ]
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
                isOpen={restrictModalOpen}
                onClose={() => {
                    setRestrictModalOpen(false);
                    setRestrictingUsers([]);
                }}
                onDelete={handleConfirmRestrict}
                user={restrictingUsers.length === 1 ? restrictingUsers[0] : null}
                users={restrictingUsers.length > 1 ? restrictingUsers : null}
                isLoading={false}
                actionType="restrict" // Add this prop to differentiate between delete and restrict
            />

            <BulkActionBar
                selectedCount={selected.length}
                onEdit={handleBulkEdit}
                onDelete={handleBulkRestrict}
                onCancel={handleBulkCancel}
                disableEdit={selected.length !== 1}
                disableDelete={selected.length === 0}
                deleteLabel="Restrict" // Change the label to "Restrict"
            />
        </div>
    );
};

export default UserTable;