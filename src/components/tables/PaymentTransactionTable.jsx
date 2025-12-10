// src/components/tables/PaymentTransactionTable.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { 
  CheckCircle, 
  Clock, 
  XCircle,
  Truck,
  Smartphone,
  CreditCard as CreditCardIcon,
  AlertCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import DataTable from '../ui/DataTable';

const PaymentTransactionTable = ({ 
  data = [],
  isLoading = false,
  bookings = []
}) => {
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = useCallback((field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  }, [sortField, sortDirection]);

  const getSortIcon = useCallback((field) => {
    if (sortField !== field) {
      return <ChevronUp className="table-sort-icon table-sort-inactive" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="table-sort-icon table-sort-active" />
      : <ChevronDown className="table-sort-icon table-sort-active" />;
  }, [sortField, sortDirection]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₱0.00';
    return `₱${parseFloat(amount).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Get status config
  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return {
          text: 'Paid',
          icon: <CheckCircle className="w-3 h-3" />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300',
        };
      case 'pending':
        return {
          text: 'Pending',
          icon: <Clock className="w-3 h-3" />,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300',
        };
      case 'rejected':
        return {
          text: 'Rejected',
          icon: <XCircle className="w-3 h-3" />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300',
        };
      default:
        return {
          text: status,
          icon: <AlertCircle className="w-3 h-3" />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300',
        };
    }
  };

  // Get method config - UPDATED to match ManagePaymentsTable style
  const getMethodConfig = (method) => {
    switch (method) {
      case 'cod':
        return {
          text: 'COD',
          icon: <Truck className="w-3 h-3" />,
          bgColor: 'bg-blue-600',
          textColor: 'text-white',
          borderColor: 'border-blue-700',
        };
      case 'gcash':
        return {
          text: 'GCash',
          icon: <Smartphone className="w-3 h-3" />,
          bgColor: 'bg-blue-700',
          textColor: 'text-white',
          borderColor: 'border-blue-800',
        };
      default:
        return {
          text: method,
          icon: <CreditCardIcon className="w-3 h-3" />,
          bgColor: 'bg-gray-600',
          textColor: 'text-white',
          borderColor: 'border-gray-700',
        };
    }
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!data.length) return [];
    
    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle dates
      if (sortField.includes('date') || sortField.includes('at')) {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      // Handle numbers
      if (sortField === 'amount') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }

      // Handle strings
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [data, sortField, sortDirection]);

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
      accessorKey: 'booking.booking_number',
      header: () => (
        <button onClick={() => handleSort('booking_number')} className="table-header-button">
          BOOKING # {getSortIcon('booking_number')}
        </button>
      ),
      cell: ({ row }) => {
        const bookingNum = row.original.booking?.booking_number;
        return bookingNum ? (
          <span className="table-cell-heading font-mono">{bookingNum}</span>
        ) : (
          <span className="table-cell-content text-gray-400">N/A</span>
        );
      },
    },
    {
      accessorKey: 'reference_number',
      header: () => (
        <button onClick={() => handleSort('reference_number')} className="table-header-button">
          REFERENCE # {getSortIcon('reference_number')}
        </button>
      ),
      cell: ({ getValue }) => {
        const refNum = getValue();
        return refNum ? (
          <span className="table-cell-content font-mono">{refNum}</span>
        ) : (
          <span className="table-cell-content text-gray-400">N/A</span>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: () => (
        <button onClick={() => handleSort('amount')} className="table-header-button">
          AMOUNT {getSortIcon('amount')}
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="table-cell-heading table-cell-right">
          {formatCurrency(getValue())}
        </span>
      ),
      meta: { cellClassName: 'table-cell-right' },
    },
    {
      accessorKey: 'payment_method',
      header: () => (
        <button onClick={() => handleSort('payment_method')} className="table-header-button">
          METHOD {getSortIcon('payment_method')}
        </button>
      ),
      cell: ({ row }) => {
        const method = row.original.payment_method;
        const config = getMethodConfig(method);
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded border text-xs">
            <span className={`px-2 py-1 rounded ${config.bgColor} ${config.borderColor} flex items-center gap-1`}>
              {config.icon}
              <span className={`font-semibold ${config.textColor}`}>
                {config.text}
              </span>
            </span>
          </div>
        );
      },
      meta: { cellClassName: 'table-cell-center' },
    },
    {
      accessorKey: 'status',
      header: () => (
        <button onClick={() => handleSort('status')} className="table-header-button">
          STATUS {getSortIcon('status')}
        </button>
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const config = getStatusConfig(status);
        return (
          <span className={`px-2 py-1 rounded border text-xs ${config.bgColor} ${config.borderColor} ${config.textColor} flex items-center gap-1`}>
            {config.icon}
            <span className="font-semibold">
              {config.text}
            </span>
          </span>
        );
      },
      meta: { cellClassName: 'table-cell-center' },
    },
    {
      accessorKey: 'payment_date',
      header: () => (
        <button onClick={() => handleSort('payment_date')} className="table-header-button">
          PAYMENT DATE {getSortIcon('payment_date')}
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="table-cell-content">
          {formatDate(getValue())}
        </span>
      ),
    },
  ], [handleSort, getSortIcon]);

  return (
    <div className="table-container">
      <DataTable
        columns={columns}
        data={sortedData}
        isLoading={isLoading}
        emptyMessage="No payment transactions found. Your payment history will appear here once you make payments."
      />
    </div>
  );
};

export default PaymentTransactionTable;