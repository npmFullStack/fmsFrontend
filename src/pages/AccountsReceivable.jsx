// src/pages/AccountsReceivable.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAR } from '../hooks/useAR';
import { useBooking } from '../hooks/useBooking';
import TableLayout from '../components/layout/TableLayout';
import AccountsReceivableTable from '../components/tables/AccountsReceivableTable';
import SendTotalPayment from '../components/modals/SendTotalPayment';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import { formatCurrency } from '../utils/formatters';
import { agingBuckets } from '../schemas/arSchema';


const AccountsReceivable = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('desc');

  // Hooks
  const { arQuery, arSummaryQuery, createAR, markAsPaid } = useAR();
  const { bookingsQuery } = useBooking();

  // Fetch AR records
  const { data, isLoading, isError } = arQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort,
    direction
  });

  // Fetch financial summary
  const { data: summaryData, isLoading: summaryLoading } = arSummaryQuery();

  // Fetch bookings for the dropdown
  const { data: bookingsData, isLoading: bookingsLoading } = bookingsQuery({
    per_page: 100,
    status: 'approved'
  });

  const bookings = bookingsData?.data || [];
  const arRecords = data?.data || [];
  const summary = summaryData?.summary || {};
  const agingBreakdown = summaryData?.aging_breakdown || [];

  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    from: data?.from || 0,
    to: data?.to || 0,
    total: data?.total || 0,
  };

  const handleSortChange = useCallback((field, dir) => {
    setSort(field);
    setDirection(dir);
  }, []);

  // CRUD Actions
  const handleSendPayment = useCallback(
    async (arData) => {
      try {
        await createAR.mutateAsync(arData);
        toast.success('Payment sent to customer successfully');
        setIsPaymentModalOpen(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send payment');
      }
    },
    [createAR]
  );

  const handleMarkAsPaid = useCallback(
    async (arId) => {
      try {
        await markAsPaid.mutateAsync(arId);
        toast.success('Record marked as paid successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to mark as paid');
      }
    },
    [markAsPaid]
  );

  const handleViewDetails = useCallback((arRecord) => {
    console.log('View AR details:', arRecord);
    toast.success(`Viewing details for booking ${arRecord.booking?.booking_number}`);
  }, []);

  // Summary cards data
  const summaryCards = useMemo(() => [
    {
      title: 'Total Collectible',
      value: summary.total_collectible || 0,
      icon: DollarSign,
      color: 'red',
      format: 'currency'
    },
    {
      title: 'Total Gross Income',
      value: summary.total_gross_income || 0,
      icon: TrendingUp,
      color: 'green',
      format: 'currency'
    },
    {
      title: 'Total Profit',
      value: summary.total_profit || 0,
      icon: CheckCircle,
      color: summary.total_profit >= 0 ? 'green' : 'red',
      format: 'currency'
    },
    {
      title: 'Total Records',
      value: summary.total_records || 0,
      icon: AlertTriangle,
      color: 'blue',
      format: 'number'
    }
  ], [summary]);

  if (isLoading && !data) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-error">
        <div className="page-error-content">
          Failed to load accounts receivable records. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Accounts Receivable</h1>
        <p className="page-subtitle">Manage customer payments, aging, and financial tracking</p>
      </div>

      {/* Financial Summary */}
      {!summaryLoading && summary.total_records > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-surface rounded-lg border border-main p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted">{card.title}</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      card.color === 'red' ? 'text-red-600' : 
                      card.color === 'green' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {card.format === 'currency' ? formatCurrency(card.value) : card.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${
                    card.color === 'red' ? 'bg-red-100 text-red-600' : 
                    card.color === 'green' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Aging Breakdown */}
      {!summaryLoading && agingBreakdown.length > 0 && (
        <div className="bg-surface rounded-lg border border-main p-4 mb-6">
          <h3 className="font-semibold text-heading mb-3">Aging Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {agingBreakdown.map((bucket, index) => {
              const agingConfig = agingBuckets.find(b => b.value === bucket.aging_bucket);
              return (
                <div key={index} className="text-center">
                  <div className={`text-xs font-medium px-2 py-1 rounded-full mb-1 ${
                    agingConfig?.color === 'green' ? 'bg-green-100 text-green-800' :
                    agingConfig?.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    agingConfig?.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    agingConfig?.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {agingConfig?.label || bucket.aging_bucket}
                  </div>
                  <div className="text-lg font-bold text-heading">{bucket.count}</div>
                  <div className="text-sm text-muted">{formatCurrency(bucket.amount)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="page-table-section">
        <TableLayout
          searchBar={
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search by booking number, customer, or amount"
            />
          }
          actions={
            <div className="page-actions">
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="page-btn-primary"
              >
                <Plus className="page-btn-icon" />
                Send Payment
              </button>
            </div>
          }
        >
          <AccountsReceivableTable
            data={arRecords}
            onMarkAsPaid={handleMarkAsPaid}
            onView={handleViewDetails}
            isLoading={isLoading}
          />
        </TableLayout>
      </div>

      {pagination.last_page > 1 && (
        <div className="page-pagination">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Send Payment Modal */}
      <SendTotalPayment
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handleSendPayment}
        isLoading={createAR.isPending}
        bookings={bookings}
      />
    </div>
  );
};

export default AccountsReceivable;