import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Filter } from 'lucide-react';
import api from '../api';
import TableLayout from '../components/layout/TableLayout';
import BookingRequestTable from '../components/tables/BookingRequestTable';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';

const BookingRequest = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');

  const queryClient = useQueryClient();

  // Fetch bookings
  const { data, isLoading, isError } = useQuery({
    queryKey: ['bookings', debouncedSearch, page],
    queryFn: async () => {
      const res = await api.get('/bookings', {
        params: { search: debouncedSearch, page, per_page: 10 },
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
  });

  // Client-side sorting
  const sortedBookings = useMemo(() => {
    if (!data?.data) return [];
    return [...data.data].sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      return direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [data?.data, sort, direction]);

  const bookings = sortedBookings;
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

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await api.put(`/bookings/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking status updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update booking status');
    },
  });

  // Handlers
  const handleApprove = useCallback(
    (booking) => {
      updateStatusMutation.mutate({ id: booking.id, status: 'approved' });
    },
    [updateStatusMutation],
  );

  const handleReject = useCallback(
    (booking) => {
      updateStatusMutation.mutate({ id: booking.id, status: 'rejected' });
    },
    [updateStatusMutation],
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
            sortField={sort}
            sortDirection={direction}
            onSortChange={handleSortChange}
            isLoading={isLoading}
            isUpdating={updateStatusMutation.isPending}
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