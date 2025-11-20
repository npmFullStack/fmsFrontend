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

  // Calculate paid amount for each AP record
  const calculatePaidAmount = (ap) => {
    let paid = 0;

    // Freight charges
    if (ap.freight_charge && ap.freight_charge.is_paid) {
      paid += parseFloat(ap.freight_charge.amount) || 0;
    }

    // Trucking charges
    if (ap.trucking_charges) {
      paid += ap.trucking_charges
        .filter(charge => charge.is_paid)
        .reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
    }

    // Port charges
    if (ap.port_charges) {
      paid += ap.port_charges
        .filter(charge => charge.is_paid)
        .reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
    }

    // Misc charges
    if (ap.misc_charges) {
      paid += ap.misc_charges
        .filter(charge => charge.is_paid)
        .reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
    }

    return paid;
  };

  // Determine payment status
  const getPaymentStatus = (ap) => {
    const totalAmount = calculateTotalAmount(ap);
    const paidAmount = calculatePaidAmount(ap);
    
    if (totalAmount === 0) return { status: 'No Charges', badge: 'table-badge-neutral' };
    if (paidAmount === 0) return { status: 'Unpaid', badge: 'table-badge-warning' };
    if (paidAmount === totalAmount) return { status: 'Paid', badge: 'table-badge-success' };
    return { status: 'Partial', badge: 'table-badge-info' };
  };

  const columns = useMemo(
    () => [
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
        accessorKey: 'paid_amount',
        header: () => (
          <button onClick={() => handleSort('paid_amount')} className="table-header-button">
            PAID AMOUNT {getSortIcon('paid_amount')}
          </button>
        ),
        cell: ({ row }) => (
          <span className="table-cell-monospace">
            {formatCurrency(calculatePaidAmount(row.original))}
          </span>
        ),
        meta: { cellClassName: 'table-cell-right' },
      },
      {
        accessorKey: 'balance',
        header: () => (
          <button onClick={() => handleSort('balance')} className="table-header-button">
            BALANCE {getSortIcon('balance')}
          </button>
        ),
        cell: ({ row }) => {
          const total = calculateTotalAmount(row.original);
          const paid = calculatePaidAmount(row.original);
          const balance = total - paid;
          return (
            <span className={`table-cell-monospace ${balance > 0 ? 'table-cell-emphasis text-red-600' : ''}`}>
              {formatCurrency(balance)}
            </span>
          );
        },
        meta: { cellClassName: 'table-cell-right' },
      },
      {
        id: 'status',
        header: () => (
          <button onClick={() => handleSort('status')} className="table-header-button">
            STATUS {getSortIcon('status')}
          </button>
        ),
        cell: ({ row }) => {
          const { status, badge } = getPaymentStatus(row.original);
          return (
            <span className={`table-badge ${badge}`}>
              {status}
            </span>
          );
        },
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