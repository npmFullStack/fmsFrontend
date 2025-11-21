// src/pages/AccountsReceivable.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
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
  const [selectedAR, setSelectedAR] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('desc');

  // Hooks
  const { arQuery, arSummaryQuery, updateAR, markAsPaid } = useAR();
  const { bookingsQuery } = useBooking();

  // Fetch AR records
  const { data, isLoading, isError, refetch } = arQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort,
    direction
  });

  // Fetch financial summary
  const { data: summaryData, isLoading: summaryLoading } = arSummaryQuery();

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
      if (selectedAR && selectedAR.id) {
        // First update the AR record with payment amount
        await updateAR.mutateAsync({
          id: selectedAR.id,
          total_payment: arData.total_payment
        });
        
        // Then send the payment request email
        try {
          await api.post(`/accounts-receivables/${selectedAR.id}/send-payment-email`);
          toast.success('Payment request sent to customer successfully');
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          toast.success('Payment amount set successfully, but email failed to send');
        }
      } else {
        toast.error('No AR record found. Please add charges in Accounts Payable first.');
      }
      
      setIsPaymentModalOpen(false);
      setSelectedAR(null);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send payment request');
    }
  },
  [updateAR, selectedAR, refetch]
);

  const handleMarkAsPaid = useCallback(
    async (arId) => {
      try {
        await markAsPaid.mutateAsync(arId);
        toast.success('Record marked as paid successfully');
        refetch(); // Refresh the data
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to mark as paid');
      }
    },
    [markAsPaid, refetch]
  );

  // Handle opening payment modal for specific AR record
  const handleOpenPaymentModal = useCallback((arRecord) => {
    // Only allow sending payment if expenses are set (AP charges exist)
    if (!arRecord.total_expenses || arRecord.total_expenses === 0) {
      toast.error('Please add charges in Accounts Payable first');
      return;
    }
    
    setSelectedAR(arRecord);
    setIsPaymentModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsPaymentModalOpen(false);
    setSelectedAR(null);
  }, []);

  // Filter records that are ready for payment (have expenses but no payment set)
  const recordsReadyForPayment = useMemo(() => {
    return arRecords.filter(ar => 
      ar.total_expenses > 0 && 
      (!ar.total_payment || ar.total_payment === 0) &&
      !ar.is_paid
    );
  }, [arRecords]);

  // Summary cards data
  const summaryCards = useMemo(() => [
    {
      title: 'Total Collectible',
      value: summary.total_collectible || 0,
      icon: DollarSign,
      color: 'red',
      format: 'currency',
      description: 'Amount pending from customers'
    },
    {
      title: 'Total Gross Income',
      value: summary.total_gross_income || 0,
      icon: TrendingUp,
      color: 'green',
      format: 'currency',
      description: 'Total revenue from all bookings'
    },
    {
      title: 'Total Profit',
      value: summary.total_profit || 0,
      icon: CheckCircle,
      color: summary.total_profit >= 0 ? 'green' : 'red',
      format: 'currency',
      description: 'Net profit after expenses'
    },
    {
      title: 'Pending Payments',
      value: recordsReadyForPayment.length || 0,
      icon: AlertTriangle,
      color: 'blue',
      format: 'number',
      description: 'Ready to send to customers'
    }
  ], [summary, recordsReadyForPayment]);

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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">Accounts Receivable</h1>
            <p className="page-subtitle">Manage customer payments, aging, and financial tracking</p>
          </div>
          {recordsReadyForPayment.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">
                  {recordsReadyForPayment.length} booking(s) ready for payment
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary */}
      {!summaryLoading && summary.total_records > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-surface rounded-lg border border-main p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
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
                <p className="text-xs text-muted mt-2">{card.description}</p>
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
              <span className="text-sm text-muted">
                Showing {arRecords.length} of {pagination.total} records
                {recordsReadyForPayment.length > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    • {recordsReadyForPayment.length} ready for payment
                  </span>
                )}
              </span>
            </div>
          }
        >
          <AccountsReceivableTable
            data={arRecords}
            onMarkAsPaid={handleMarkAsPaid}
            onSendPayment={handleOpenPaymentModal}
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
        onClose={handleCloseModal}
        onSave={handleSendPayment}
        isLoading={updateAR.isPending}
        selectedAR={selectedAR}
      />
    </div>
  );
};

export default AccountsReceivable;