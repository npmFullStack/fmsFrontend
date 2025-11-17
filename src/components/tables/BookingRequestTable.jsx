// src/components/tables/BookingRequestTable.jsx
import React, { useMemo, useCallback } from 'react';
import DataTable from '../ui/DataTable';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Package, Eye, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const BookingRequestTable = ({
  data = [],
  onApprove,
  onReject,
  isLoading = false,
  sortField,
  sortDirection,
  onSortChange,
}) => {
  const navigate = useNavigate();

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
            <div className="flex items-center text-sm text-muted">
              <MapPin className="w-4 h-4 mr-2" />
              {item.origin?.route_name || item.origin?.name || 'N/A'} →{' '}
              {item.destination?.route_name || item.destination?.name || 'N/A'}
            </div>
          );
        },
      },
      {
        accessorKey: 'container_quantity',
        header: () => (
          <button onClick={() => handleSort('container_quantity')} className="table-header-button">
            CONTAINERS
          </button>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center text-sm text-muted">
              <Package className="w-4 h-4 mr-2" />
              {item.container_quantity}×{item.container_size?.size || item.container_size?.name || 'Container'}
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
        id: 'actions',
        header: () => <span className="table-header-button">ACTIONS</span>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/booking-details/${item.id}`)}
                className="table-action-btn text-blue-600"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                onClick={() => onApprove(item.id)}
                className="table-action-btn text-green-600"
              >
                <CheckCircle className="w-4 h-4" />
              </button>

              <button
                onClick={() => onReject(item.id)}
                className="table-action-btn text-red-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [sortField, sortDirection, handleSort, onApprove, onReject]
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