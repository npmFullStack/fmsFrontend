// [file name]: CustomerBookings.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePayment } from '../hooks/usePayment';
import { useBooking } from '../hooks/useBooking';
import { useAR } from '../hooks/useAR';
import { useOptimizedApi } from '../hooks/useOptimizedApi';
import TableLayout from '../components/layout/TableLayout';
import CustomerBookingsTable from '../components/tables/CustomerBookingsTable';
import CustomerAddBooking from '../components/modals/CustomerAddBooking';
import PayBooking from '../components/modals/PayBooking';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const CustomerBookings = () => {
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [forceRefresh, setForceRefresh] = useState(0);

  // Optimized API hook
  const { optimizedRequest, cancelRequest, clearCache } = useOptimizedApi();

  const { customerBookingsQuery, checkPaymentStatus } = usePayment();
  const { createBooking } = useBooking();
  const { paymentBreakdownQuery } = useAR();

  // ✅ Enhanced bookings query with optimization
  const { data, isLoading, isError, refetch } = customerBookingsQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    with_ar: true,
    with_accounts_receivable: true,
    _refresh: forceRefresh // Add refresh trigger
  });

  const bookings = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    from: data?.from || 0,
    to: data?.to || 0,
    total: data?.total || 0,
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastRefreshed(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest('customer-bookings');
    };
  }, [cancelRequest]);

  // Refresh data function
  const handleRefresh = useCallback(() => {
    clearCache('customer-bookings');
    setForceRefresh(prev => prev + 1);
    setLastRefreshed(new Date());
    toast.success('Bookings refreshed');
  }, [clearCache]);

  const getChargesBreakdown = useCallback((bookingId) => {
    if (!bookingId) return null;
    
    const { data: breakdownData, isLoading: breakdownLoading } = paymentBreakdownQuery(bookingId);
    
    if (breakdownLoading) {
      return null;
    }
    
    if (!breakdownData) {
      return null;
    }
    
    return breakdownData;
  }, [paymentBreakdownQuery]);
  
  const handleAdd = useCallback(
    async (bookingData) => {
      try {
        await createBooking.mutateAsync(bookingData);
        // Clear cache after successful creation
        clearCache('customer-bookings');
        toast.success('Booking submitted successfully! Waiting for admin approval.');
        setIsAddModalOpen(false);
        refetch();
      } catch (error) {
        console.error('Add booking error:', error);
        toast.error(error.response?.data?.message || 'Failed to submit booking');
      }
    },
    [createBooking, clearCache, refetch]
  );

  const handlePayBooking = useCallback((booking) => {
    setSelectedBooking(booking);
    setIsPayModalOpen(true);
  }, []);

  const handleDownloadStatement = useCallback((statementData) => {
    generateBillingStatementPDF(statementData);
    toast.success('Billing statement downloaded successfully!');
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    toast.success('Payment initiated successfully! You will receive a confirmation soon.');
    // Clear cache and refresh data to show updated payment status
    clearCache('customer-bookings');
    setTimeout(() => {
      refetch();
    }, 2000);
  }, [clearCache, refetch]);

  const handleCloseModal = useCallback(() => {
    setIsPayModalOpen(false);
    setSelectedBooking(null);
  }, []);

  // Function to generate PDF billing statement using the HTML template
  const generateBillingStatementPDF = (statementData) => {
    const encodedData = encodeURIComponent(JSON.stringify(statementData));
    const printUrl = `/printBillingStatement.html?data=${encodedData}`;
    
    const printWindow = window.open(printUrl, '_blank');
    
    if (printWindow) {
      printWindow.focus();
    }
  };

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
          <p>Failed to load your bookings. Please try again.</p>
          <button 
            onClick={handleRefresh}
            className="page-btn-primary mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
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
            <h1 className="page-title">My Bookings</h1>
            <p className="page-subtitle">Manage your shipping bookings and requests</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleRefresh}
              className="page-btn-secondary flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="text-xs text-gray-500 text-right">
              <div>Last updated: {lastRefreshed.toLocaleTimeString()}</div>
              <div>Auto-refreshes every 30 seconds</div>
            </div>
          </div>
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
              placeholder="Search bookings by name, email, or tracking number"
            />
          }
          actions={
            <div className="page-actions flex gap-2">
              <span className="text-sm text-muted flex items-center">
                Showing {bookings.length} of {pagination.total} bookings
              </span>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="page-btn-primary"
                disabled={createBooking.isPending}
              >
                <Plus className="page-btn-icon" />
                Add Booking
              </button>
            </div>
          }
        >
          <CustomerBookingsTable
            data={bookings}
            onPay={handlePayBooking}
            onDownloadStatement={handleDownloadStatement}
            isLoading={isLoading}
            getChargesBreakdown={getChargesBreakdown}
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

      {/* Add Booking Modal */}
      <CustomerAddBooking
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
        isLoading={createBooking.isPending}
      />

      {/* Pay Booking Modal */}
      <PayBooking
        isOpen={isPayModalOpen}
        onClose={handleCloseModal}
        booking={selectedBooking}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CustomerBookings;