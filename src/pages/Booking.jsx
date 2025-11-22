import React, { useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

import { useBooking } from '../hooks/useBooking';
import { useCargoMonitoring } from '../hooks/useCargoMonitoring'; // NEW: Import cargo monitoring hook
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

  // useBooking hook handles everything
  const {
    bookingsQuery,
    createBooking,
    updateBooking,
    deleteBooking,
    bulkDeleteBookings,
    approveBooking,
  } = useBooking();

  // NEW: Fetch cargo monitoring data
  const { cargoMonitoringQuery } = useCargoMonitoring();
  const { data: cargoData, isLoading: isCargoLoading } = cargoMonitoringQuery();

  // Fetch bookings (server-side pagination & search)
  const { data, isLoading, isError } = bookingsQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort,
    direction
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

  /* ---
   * CRUD ACTIONS
   * --- */
  const handleAdd = useCallback(
  async (bookingData) => {
    console.log('🎯 PARENT: handleAdd called with data:', bookingData);
    try {
      console.log('🎯 PARENT: Calling createBooking.mutateAsync...');
      await createBooking.mutateAsync(bookingData);
      console.log('🎯 PARENT: createBooking completed successfully');
      toast.success('Booking added successfully');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('🎯 PARENT: Add booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to add booking');
    }
  },
  [createBooking]
);

  const handleUpdate = useCallback(
    async (id, bookingData) => {
      try {
        await updateBooking.mutateAsync({
          id, 
          ...bookingData 
        });
        toast.success('Booking updated successfully');
        setIsUpdateModalOpen(false);
        setUpdatingBooking(null);
      } catch (error) {
        console.error('Update booking error:', error);
        toast.error(error.response?.data?.message || 'Failed to update booking');
      }
    },
    [updateBooking]
  );

  const handleDelete = useCallback(() => {
    if (deletingBookings.length > 0) {
      const ids = deletingBookings.map((booking) => booking.id);
      bulkDeleteBookings.mutate(ids, {
        onSuccess: (res) => {
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
      // If neither condition is met, just close the modal
      setIsDeleteModalOpen(false);
      setDeletingBooking(null);
      setDeletingBookings([]);
    }
  }, [deleteBooking, bulkDeleteBookings, deletingBooking, deletingBookings]);

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
      toast.success('Booking approved successfully');
    } catch (error) {
      console.error('Approve booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve booking');
    }
  }, [approveBooking]);

  /*
   * STATES
   *
   *================================================*/
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
          Failed to load bookings. Please try again.
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
        <h1 className="page-title">Booking Management</h1>
        <p className="page-subtitle">Manage your shipping bookings and requests</p>
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
                disabled={createBooking.isPending} // Prevent opening while creating
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