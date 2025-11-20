// src/components/tables/AccountsPayableTable.jsx
import React, { useState, useMemo } from 'react';
import DataTable from '../ui/DataTable';
import { ChevronUp, ChevronDown, DollarSign, Truck, Anchor, FileText } from 'lucide-react';
import { toUpperCase, formatCurrency } from '../../utils/formatters';

const AccountsPayableTable = ({
  data = [],
  onView,
  onSortChange,
  sortField = 'id',
  sortDirection = 'asc',
  isLoading = false,
}) => {
  const handleSort = (field) => {
    if (!onSortChange) return;
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newDirection);
  };

  const getSortIcon = (field) => {
    const baseClass = 'table-sort-icon';
    if (sortField !== field) {
      return <ChevronUp className={`${baseClass} table-sort-inactive`} />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className={`${baseClass} table-sort-active`} />
    ) : (
      <ChevronDown className={`${baseClass} table-sort-active`} />
    );
  };

  // Calculate total amount for each AP record
  const calculateTotalAmount = (ap) => {
    let total = 0;

    // Freight charges
    if (ap.freight_charge) {
      total += parseFloat(ap.freight_charge.amount) || 0;
    }

    // Trucking charges
    if (ap.trucking_charges) {
      total += ap.trucking_charges.reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
    }

    // Port charges
    if (ap.port_charges) {
      total += ap.port_charges.reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
    }

    // Misc charges
    if (ap.misc_charges) {
      total += ap.misc_charges.reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
    }

    return total;
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'voucher_number',
        header: () => (
          <button onClick={() => handleSort('voucher_number')} className="table-header-button">
            VOUCHER {getSortIcon('voucher_number')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="table-cell-monospace table-cell-heading">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'booking.booking_number',
        header: () => (
          <button onClick={() => handleSort('booking_number')} className="table-header-button">
            BOOKING NO. {getSortIcon('booking_number')}
          </button>
        ),
        cell: ({ row }) => (
          <span className="table-cell-monospace">
            {row.original.booking?.booking_number || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'booking.first_name',
        header: () => (
          <button onClick={() => handleSort('first_name')} className="table-header-button">
            CUSTOMER {getSortIcon('first_name')}
          </button>
        ),
        cell: ({ row }) => (
          <span className="table-cell-content">
            {`${row.original.booking?.first_name || ''} ${row.original.booking?.last_name || ''}`.trim() || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'total_amount',
        header: () => (
          <button onClick={() => handleSort('total_amount')} className="table-header-button">
            TOTAL AMOUNT {getSortIcon('total_amount')}
          </button>
        ),
        cell: ({ row }) => (
          <span className="table-cell-monospace table-cell-emphasis">
            {formatCurrency(calculateTotalAmount(row.original))}
          </span>
        ),
        meta: { cellClassName: 'table-cell-right' },
      },
      {
        accessorKey: 'is_paid',
        header: () => (
          <button onClick={() => handleSort('is_paid')} className="table-header-button">
            STATUS {getSortIcon('is_paid')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className={`table-badge ${getValue() ? 'table-badge-success' : 'table-badge-warning'}`}>
            {getValue() ? 'Paid' : 'Unpaid'}
          </span>
        ),
        meta: { cellClassName: 'table-cell-center' },
      },
      {
        id: 'actions',
        header: 'ACTIONS',
        cell: ({ row }) => (
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => onView(row.original)}
              className="table-btn-primary"
            >
              View Details
            </button>
          </div>
        ),
        meta: { headerClassName: 'table-cell-center', cellClassName: 'table-cell-center' },
      },
    ],
    [sortField, sortDirection, onSortChange]
  );

  return (
    <div className="table-container">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage="No accounts payable records found. Add your first record above."
      />
    </div>
  );
};

export default AccountsPayableTable;