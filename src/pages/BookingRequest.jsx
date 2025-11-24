// src/pages/BookingRequest.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Filter, RefreshCw } from 'lucide-react';
import { useBooking } from '../hooks/useBooking';
import { useOptimizedApi } from '../hooks/useOptimizedApi';
import TableLayout from '../components/layout/TableLayout';
import BookingRequestTable from '../components/tables/BookingRequestTable';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';

const BookingRequest = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [forceRefresh, setForceRefresh] = useState(0);

  // Optimized API hook
  const { optimizedRequest, cancelRequest, clearCache } = useOptimizedApi();

  const { 
    bookingsQuery, 
    approveBooking, 
    updateBookingStatus 
  } = useBooking();

  // ✅ Enhanced bookings query with optimization
  const { data, isLoading, isError, refetch } = bookingsQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort_by: sortField,
    sort_order: sortDirection,
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest('booking-requests');
    };
  }, [cancelRequest]);

  // Refresh data function
  const handleRefresh = useCallback(() => {
    clearCache('booking-requests');
    setForceRefresh(prev => prev + 1);
    toast.success('Booking requests refreshed');
  }, [clearCache]);

  const handleSortChange = useCallback((field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  // Handlers
  const handleApprove = useCallback(
    async (booking) => {
      try {
        await approveBooking.mutateAsync(booking.id);
        // Clear cache after successful approval
        clearCache('booking-requests');
        toast.success('Booking approved! Password sent to customer.');
      } catch (error) {
        console.error('Approve booking error:', error);
        toast.error(error.response?.data?.message || 'Failed to approve booking');
      }
    },
    [approveBooking, clearCache],
  );

  const handleReject = useCallback(
    async (booking) => {
      try {
        await updateBookingStatus.mutateAsync({ 
          id: booking.id, 
          status: 'rejected' 
        });
        // Clear cache after successful rejection
        clearCache('booking-requests');
        toast.success('Booking rejected successfully');
      } catch (error) {
        console.error('Reject booking error:', error);
        toast.error(error.response?.data?.message || 'Failed to reject booking');
      }
    },
    [updateBookingStatus, clearCache],
  );

  // Loading & error states
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
          <p>Failed to load booking requests. Please try again.</p>
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
            <h1 className="page-title">Booking Requests</h1>
            <p className="page-subtitle">Manage and review shipping booking requests</p>
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
              placeholder="Search bookings by name, email, or route"
            />
          }
          actions={
            <div className="page-actions">
              <span className="text-sm text-muted">
                Showing {bookings.length} of {pagination.total} requests
              </span>
            </div>
          }
        >
          <BookingRequestTable
            data={bookings}
            onApprove={handleApprove}
            onReject={handleReject}
            isLoading={isLoading}
            isUpdating={approveBooking.isPending || updateBookingStatus.isPending}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
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
    </div>
  );
};

export default BookingRequest;