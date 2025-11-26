import React, { useMemo, useCallback } from 'react';
import DataTable from '../ui/DataTable';
import { ChevronUp, ChevronDown, Shield, User, UserX, UserCheck } from 'lucide-react';
import { toUpperCase } from '../../utils/formatters';

const UserTable = ({ 
    data = [],
    onDelete,
    onRestore, // Add this new prop
    onSortChange,
    sortField = 'id',
    sortDirection = 'asc',
    isLoading = false,
}) => {
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

    // REMOVED: Don't filter out soft-deleted users
    // const filteredData = useMemo(() => {
    //     return data.filter(user => !user.is_deleted);
    // }, [data]);

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
                accessorKey: 'is_deleted',
                header: () => <span className="table-header-button">STATUS</span>,
                cell: ({ getValue }) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getValue() 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                        {getValue() ? 'Restricted' : 'Active'}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: () => <span className="table-header-button">ACTIONS</span>,
                cell: ({ row }) => {
                    const user = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            {user.is_deleted ? (
                                // Unrestrict button for restricted users
                                <button
                                    onClick={() => onRestore?.(user)}
                                    className="px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 bg-green-500 text-white hover:bg-green-600"
                                    title="Unrestrict user"
                                >
                                    <UserCheck className="w-4 h-4" />
                                    Unrestrict
                                </button>
                            ) : (
                                // Restrict button for active users
                                <button
                                    onClick={() => onDelete?.(user)}
                                    className="px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 bg-orange-500 text-white hover:bg-orange-600"
                                    title="Restrict user"
                                >
                                    <UserX className="w-4 h-4" />
                                    Restrict
                                </button>
                            )}
                        </div>
                    );
                },
                meta: { headerClassName: 'w-32', cellClassName: 'w-32' },
            },
        ],
        [
            sortField, sortDirection, handleSort, getSortIcon, getRoleBadge, 
            getRoleIcon, formatRole, onDelete, onRestore // Added onRestore
        ]
    );

    return (
        <div className="table-container">
            <DataTable
                columns={columns}
                data={data} // Use original data, not filtered
                isLoading={isLoading}
                emptyMessage="No users found. Add your first user above."
            />
        </div>
    );
};

export default UserTable;