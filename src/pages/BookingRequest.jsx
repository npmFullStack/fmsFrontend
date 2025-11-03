import React, { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Filter } from 'lucide-react';
import { useBooking } from '../hooks/useBooking';
import TableLayout from '../components/layout/TableLayout';
import BookingRequestTable from '../components/tables/BookingRequestTable';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';

const BookingRequest = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);

  const { 
    bookingsQuery, 
    approveBooking, 
    updateBookingStatus 
  } = useBooking();

  // Fetch bookings
  const { data, isLoading, isError } = bookingsQuery({
    search: debouncedSearch,
    page,
    per_page: 10
  });

  const bookings = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    from: data?.from || 0,
    to: data?.to || 0,
    total: data?.total || 0,
  };

  // Handlers
  const handleApprove = useCallback(
    async (booking) => {
      try {
        await approveBooking.mutateAsync(booking.id);
        toast.success('Booking approved! Password sent to customer.');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to approve booking');
      }
    },
    [approveBooking],
  );

  const handleReject = useCallback(
    async (booking) => {
      try {
        await updateBookingStatus.mutateAsync({ 
          id: booking.id, 
          status: 'rejected' 
        });
        toast.success('Booking rejected successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to reject booking');
      }
    },
    [updateBookingStatus],
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
          Failed to load booking requests. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Booking Requests</h1>
        <p className="page-subtitle">Manage and review shipping booking requests</p>
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
              <button className="page-btn-secondary">
                <Filter className="page-btn-icon" />
                Filter
              </button>
            </div>
          }
        >
          <BookingRequestTable
            data={bookings}
            onApprove={handleApprove}
            onReject={handleReject}
            isLoading={isLoading}
            isUpdating={approveBooking.isPending || updateBookingStatus.isPending}
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