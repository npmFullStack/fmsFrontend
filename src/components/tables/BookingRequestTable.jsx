// src/components/tables/BookingRequestTable.jsx
import React, { useMemo, useCallback } from 'react';
import DataTable from '../ui/DataTable';
import { Calendar, MapPin, Package, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const BookingRequestTable = ({
  data = [],
  onApprove,
  onReject,
  isLoading = false,
  isUpdating = false,
  sortField,
  sortDirection,
  onSortChange,
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'badge bg-green-500 text-white border-green-600';
      case 'rejected':
        return 'badge bg-red-500 text-white border-red-600';
      default:
        return 'badge bg-yellow-500 text-white border-yellow-600';
    }
  };

  const calculateTotalWeight = (items) => {
    return items?.reduce((sum, item) => sum + (item.weight * item.quantity), 0) || 0;
  };

  const calculateTotalItems = (items) => {
    return items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: () => (
          <button onClick={() => handleSort('id')} className="table-header-button">
            BOOKING ID
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="table-cell-monospace table-cell-content">#{getValue()}</span>
        ),
      },
      {
        accessorKey: 'customer',
        header: () => (
          <button onClick={() => handleSort('first_name')} className="table-header-button">
            CUSTOMER
          </button>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium text-heading truncate">
                {item.first_name} {item.last_name}
              </span>
              <span className="text-sm text-muted truncate">{item.email}</span>
              <span className="text-xs text-muted truncate">{item.contact_number || 'No contact'}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'route',
        header: () => (
          <button className="table-header-button">ROUTE</button>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-col text-sm">
              <span className="text-heading">
                {item.origin?.route_name || item.origin?.name || 'N/A'} → {item.destination?.route_name || item.destination?.name || 'N/A'}
              </span>
              <span className="text-xs text-muted mt-1">
                Departure: {formatDate(item.departure_date)}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'container_info',
        header: () => (
          <button className="table-header-button">CONTAINER & VOLUME</button>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-col text-sm">
              <span className="text-heading">
                {item.container_quantity} × {item.container_size?.size || item.container_size?.name || 'Container'}
              </span>
              <span className="text-xs text-muted mt-1">
                Mode: {item.mode_of_service || 'N/A'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'cargo_details',
        header: () => (
          <button className="table-header-button">CARGO DETAILS</button>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const totalWeight = calculateTotalWeight(item.items);
          const totalItems = calculateTotalItems(item.items);
          
          return (
            <div className="flex flex-col text-sm">
              <span className="text-heading">{totalItems} items</span>
              <span className="text-xs text-muted mt-1">{totalWeight} kg total</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'shipping_info',
        header: () => (
          <button className="table-header-button">SHIPPING INFO</button>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-col text-sm">
              <span className="text-heading truncate">
                {item.shipping_line?.name || 'Not specified'}
              </span>
              <span className="text-xs text-muted mt-1">
                Terms: {item.terms || 0} days
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'parties',
        header: () => (
          <button className="table-header-button">PARTIES</button>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-col text-sm">
              <span className="text-xs text-heading truncate">
                Shipper: {item.shipper_first_name} {item.shipper_last_name}
              </span>
              <span className="text-xs text-muted mt-1 truncate">
                Consignee: {item.consignee_first_name} {item.consignee_last_name}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: () => (
          <button onClick={() => handleSort('status')} className="table-header-button">
            STATUS
          </button>
        ),
        cell: ({ getValue }) => (
          <span className={getStatusBadge(getValue())}>
            {getValue().replace('_', ' ').toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: () => (
          <button onClick={() => handleSort('created_at')} className="table-header-button">
            CREATED
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-sm text-muted">
            {formatDate(getValue())}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="table-header-button">ACTIONS</span>,
        cell: ({ row }) => {
          const item = row.original;
          const isPending = item.status === 'pending';
          const isUpdatingItem = isUpdating;

          return (
            <div className="flex gap-2">
              {isPending ? (
                <>
                  <button
                    onClick={() => onApprove(item)}
                    disabled={isUpdatingItem}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      isUpdatingItem
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isUpdatingItem ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mx-1" />
                    ) : (
                      'Approve'
                    )}
                  </button>
                  <button
                    onClick={() => onReject(item)}
                    disabled={isUpdatingItem}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      isUpdatingItem
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isUpdatingItem ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mx-1" />
                    ) : (
                      'Reject'
                    )}
                  </button>
                </>
              ) : (
                <span className="text-xs text-muted px-2 py-1">
                  {item.status === 'approved' ? 'Approved' : 'Rejected'}
                </span>
              )}
            </div>
          );
        },
      },
    ],
    [sortField, sortDirection, handleSort, onApprove, onReject, isUpdating]
  );

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