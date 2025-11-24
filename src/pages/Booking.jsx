// src/components/pages/Booking.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, Filter, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { useBooking } from '../hooks/useBooking';
import { useCargoMonitoring } from '../hooks/useCargoMonitoring';
import { useOptimizedApi } from '../hooks/useOptimizedApi';
import TableLayout from '../components/layout/TableLayout';
import BookingTable from '../components/tables/BookingTable';
import AddBooking from '../components/modals/AddBooking';
import DeleteBooking from '../components/modals/DeleteBooking';
import UpdateBooking from '../components/modals/UpdateBooking';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const Booking = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deletingBooking, setDeletingBooking] = useState(null);
  const [deletingBookings, setDeletingBookings] = useState([]);
  const [updatingBooking, setUpdatingBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('desc');
  const [forceRefresh, setForceRefresh] = useState(0);

  // Optimized API hook
  const { optimizedRequest, cancelRequest, clearCache } = useOptimizedApi();

  // useBooking hook handles everything
  const {
    bookingsQuery,
    createBooking,
    updateBooking,
    deleteBooking,
    bulkDeleteBookings,
    approveBooking,
  } = useBooking();

  // NEW: Fetch cargo monitoring data with optimization
  const { cargoMonitoringQuery } = useCargoMonitoring();
  const { data: cargoData, isLoading: isCargoLoading } = cargoMonitoringQuery();

  // Optimized bookings query
  const { data, isLoading, isError, refetch } = bookingsQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort,
    direction,
    _refresh: forceRefresh // Add refresh trigger
  });

  // NEW: Merge booking data with cargo monitoring data
  const bookingsWithCargo = useMemo(() => {
    if (!data?.data || !cargoData?.data) return data?.data || [];
    
    return data.data.map(booking => {
      // Find matching cargo monitoring record for this booking
      const cargoRecord = cargoData.data.find(cargo => cargo.booking_id === booking.id);
      
      return {
        ...booking,
        cargo_monitoring: cargoRecord || null
      };
    });
  }, [data?.data, cargoData?.data]);

  // Client-side sorting (fallback if server-side sorting isn't working)
  const sortedBookings = useMemo(() => {
    if (!bookingsWithCargo) return [];
    return [...bookingsWithCargo].sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      return direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [bookingsWithCargo, sort, direction]);

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

  // Refresh data function
  const handleRefresh = useCallback(() => {
    clearCache('bookings'); // Clear cache for fresh data
    setForceRefresh(prev => prev + 1);
    toast.success('Data refreshed');
  }, [clearCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest('bookings');
      cancelRequest('cargo-monitoring');
    };
  }, [cancelRequest]);

  /* ---
   * CRUD ACTIONS
   * --- */
  const handleAdd = useCallback(async (bookingData) => {
    console.log('🎯 PARENT: handleAdd called with data:', bookingData);
    try {
      console.log('🎯 PARENT: Calling createBooking.mutateAsync...');
      await createBooking.mutateAsync(bookingData);
      console.log('🎯 PARENT: createBooking completed successfully');
      
      // Clear cache after successful creation
      clearCache('bookings');
      toast.success('Booking added successfully');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('🎯 PARENT: Add booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to add booking');
    }
  }, [createBooking, clearCache]);

  const handleUpdate = useCallback(async (id, bookingData) => {
    try {
      await updateBooking.mutateAsync({
        id, 
        ...bookingData 
      });
      
      // Clear cache after successful update
      clearCache('bookings');
      toast.success('Booking updated successfully');
      setIsUpdateModalOpen(false);
      setUpdatingBooking(null);
    } catch (error) {
      console.error('Update booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to update booking');
    }
  }, [updateBooking, clearCache]);

  const handleDelete = useCallback(() => {
    if (deletingBookings.length > 0) {
      const ids = deletingBookings.map((booking) => booking.id);
      bulkDeleteBookings.mutate(ids, {
        onSuccess: (res) => {
          clearCache('bookings');
          toast.success(res?.message || 'Bookings deleted successfully');
          setIsDeleteModalOpen(false);
          setDeletingBooking(null);
          setDeletingBookings([]);
        },
        onError: (error) => {
          console.error('Bulk delete error:', error);
          toast.error(error.response?.data?.message || 'Failed to delete bookings');
        },
      });
    } else if (deletingBooking) {
      deleteBooking.mutate(deletingBooking.id, {
        onSuccess: () => {
          clearCache('bookings');
          toast.success('Booking deleted successfully');
          setIsDeleteModalOpen(false);
          setDeletingBooking(null);
          setDeletingBookings([]);
        },
        onError: (error) => {
          console.error('Delete booking error:', error);
          toast.error(error.response?.data?.message || 'Failed to delete booking');
        },
      });
    } else {
      setIsDeleteModalOpen(false);
      setDeletingBooking(null);
      setDeletingBookings([]);
    }
  }, [deleteBooking, bulkDeleteBookings, deletingBooking, deletingBookings, clearCache]);

  const handleEditClick = useCallback((booking) => {
    setUpdatingBooking(booking);
    setIsUpdateModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((bookingOrBookings) => {
    if (Array.isArray(bookingOrBookings)) {
      setDeletingBookings(bookingOrBookings);
      setDeletingBooking(null);
    } else {
      setDeletingBooking(bookingOrBookings);
      setDeletingBookings([]);
    }
    setIsDeleteModalOpen(true);
  }, []);

  const handleApprove = useCallback(async (booking) => {
    try {
      await approveBooking.mutateAsync(booking.id);
      clearCache('bookings');
      toast.success('Booking approved successfully');
    } catch (error) {
      console.error('Approve booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve booking');
    }
  }, [approveBooking, clearCache]);

  /*
   * STATES
   */
  const isLoadingCombined = isLoading || isCargoLoading;

  if (isLoadingCombined && !data) {
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
          <p>Failed to load bookings. Please try again.</p>
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

  /* ---
   * UI
   * --- */
  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">Booking Management</h1>
            <p className="page-subtitle">Manage your shipping bookings and requests</p>
          </div>
          <button
            onClick={handleRefresh}
            className="page-btn-secondary flex items-center gap-2"
            disabled={isLoadingCombined}
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingCombined ? 'animate-spin' : ''}`} />
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
              placeholder="Search bookings by name, email, or tracking number"
            />
          }
          actions={
            <div className="page-actions">
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
          <BookingTable
            data={bookings}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onApprove={handleApprove}
            sortField={sort}
            sortDirection={direction}
            onSortChange={handleSortChange}
            isLoading={isLoadingCombined}
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

      {/* Modals */}
      <AddBooking
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
        isLoading={createBooking.isPending}
      />

      <UpdateBooking
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdatingBooking(null);
        }}
        onUpdate={handleUpdate}
        booking={updatingBooking}
        isLoading={updateBooking.isPending}
      />

      <DeleteBooking
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingBooking(null);
          setDeletingBookings([]);
        }}
        onDelete={handleDelete}
        booking={deletingBooking}
        bookings={deletingBookings}
        isLoading={deleteBooking.isPending || bulkDeleteBookings.isPending}
      />
    </div>
  );
};

export default Booking;