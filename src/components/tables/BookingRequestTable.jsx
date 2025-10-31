import React, { useMemo, useCallback } from 'react';
import DataTable from '../ui/DataTable';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { CheckCircle, XCircle } from 'lucide-react';

const BookingRequestTable = ({
  data = [],
  onApprove,
  onReject,
  onSortChange,
  sortField = 'id',
  sortDirection = 'asc',
  isLoading = false,
  isUpdating = false,
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

  const getStatusBadge = useCallback((status) => {
    const statusConfig = {
      pending: {
        class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Pending'
      },
      approved: {
        class: 'bg-green-100 text-green-800 border-green-200',
        text: 'Approved'
      },
      rejected: {
        class: 'bg-red-100 text-red-800 border-red-200',
        text: 'Rejected'
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.class}`}>
        {config.text}
      </span>
    );
  }, []);

  const columns = useMemo(() => [
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
      accessorKey: 'customer',
      header: () => (
        <button onClick={() => handleSort('first_name')} className="table-header-button">
          CUSTOMER {getSortIcon('first_name')}
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="table-cell-heading">
            {row.original.first_name} {row.original.last_name}
          </div>
          <div className="table-cell-muted text-xs">
            {row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'contact_number',
      header: 'CONTACT',
      cell: ({ getValue }) => (
        <span className="table-cell-content">{getValue()}</span>
      ),
    },
    {
      accessorKey: 'route',
      header: 'ROUTE',
      cell: ({ row }) => (
        <div>
          <div className="table-cell-heading">
            {row.original.origin} → {row.original.destination}
          </div>
          <div className="table-cell-muted text-xs">
            {row.original.mode_of_service}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'container_size',
      header: 'CONTAINER',
      cell: ({ getValue }) => (
        <span className="table-cell-content">{getValue()}</span>
      ),
      meta: { cellClassName: 'table-cell-center' },
    },
    {
      accessorKey: 'departure_date',
      header: () => (
        <button onClick={() => handleSort('departure_date')} className="table-header-button">
          DEPARTURE {getSortIcon('departure_date')}
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="table-cell-content">
          {new Date(getValue()).toLocaleDateString()}
        </span>
      ),
      meta: { cellClassName: 'table-cell-center' },
    },
    {
      accessorKey: 'items_count',
      header: 'ITEMS',
      cell: ({ row }) => (
        <span className="table-cell-content table-cell-center">
          {row.original.items?.length || 0}
        </span>
      ),
      meta: { cellClassName: 'table-cell-center' },
    },
    {
      accessorKey: 'status',
      header: () => (
        <button onClick={() => handleSort('status')} className="table-header-button">
          STATUS {getSortIcon('status')}
        </button>
      ),
      cell: ({ getValue }) => getStatusBadge(getValue()),
      meta: { cellClassName: 'table-cell-center' },
    },
    {
      accessorKey: 'created_at',
      header: () => (
        <button onClick={() => handleSort('created_at')} className="table-header-button">
          SUBMITTED {getSortIcon('created_at')}
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="table-cell-content">
          {new Date(getValue()).toLocaleDateString()}
        </span>
      ),
      meta: { cellClassName: 'table-cell-center' },
    },
    {
      accessorKey: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => {
        const booking = row.original;
        const isPending = booking.status === 'pending';
        
        return (
          <div className="flex space-x-2 justify-center">
            <button
              onClick={() => onApprove(booking)}
              disabled={!isPending || isUpdating}
              className="table-btn-success disabled:opacity-50 disabled:cursor-not-allowed"
              title="Approve booking"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => onReject(booking)}
              disabled={!isPending || isUpdating}
              className="table-btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reject booking"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        );
      },
      meta: { 
        headerClassName: 'table-cell-center',
        cellClassName: 'table-cell-center' 
      },
    },
  ], [handleSort, getSortIcon, getStatusBadge, onApprove, onReject, isUpdating]);

  return (
    <div className="table-container">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage="No booking requests found."
      />
    </div>
  );
};

export default BookingRequestTable;