// src/pages/PaymentTransaction.jsx
import React, { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { usePayment } from '../hooks/usePayment';
import { useBooking } from '../hooks/useBooking';
import TableLayout from '../components/layout/TableLayout';
import PaymentTransactionTable from '../components/tables/PaymentTransactionTable';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const PaymentTransaction = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [forceRefresh, setForceRefresh] = useState(0);

  const {
    customerPaymentsQuery,
  } = usePayment();

  const { customerBookingsQuery } = useBooking();

  // Fetch payment transactions
  const { data, isLoading, isError, refetch } = customerPaymentsQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    _refresh: forceRefresh
  });

  // Fetch bookings for reference
  const { data: bookingsData } = customerBookingsQuery({
    per_page: 100
  });

  const payments = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    from: data?.from || 0,
    to: data?.to || 0,
    total: data?.total || 0,
  };

  // Handle refresh
  const handleRefresh = () => {
    setForceRefresh(prev => prev + 1);
  };

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Payment Transactions</h1>
          <p className="page-subtitle">View your payment history</p>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Payment Transactions</h1>
          <p className="page-subtitle">View your payment history</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load transactions</h3>
          <p className="text-gray-600 mb-6">Please try again</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">Payment Transactions</h1>
            <p className="page-subtitle">View your payment history and receipts</p>
          </div>
          <button
            onClick={handleRefresh}
            className="page-btn-secondary flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="page-table-section">
        <TableLayout
          searchBar={
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search payments by booking number, reference number, or amount"
            />
          }
          actions={
            <div className="text-sm text-gray-500">
              Showing {pagination.from}-{pagination.to} of {pagination.total} payments
            </div>
          }
        >
          <PaymentTransactionTable
            data={payments}
            isLoading={isLoading}
            bookings={bookingsData?.data || []}
          />
        </TableLayout>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="page-pagination">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentTransaction;