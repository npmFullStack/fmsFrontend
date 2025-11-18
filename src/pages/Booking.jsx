import React, { useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

import { useBooking } from '../hooks/useBooking';
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

  // Fetch bookings (server-side pagination & search)
  const { data, isLoading, isError } = bookingsQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort,
    direction
  });

  // Client-side sorting (fallback if server-side sorting isn't working)
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

  /* ---
   * CRUD ACTIONS
   * --- */
  const handleAdd = useCallback(
    async (bookingData) => {
      try {
        await createBooking.mutateAsync(bookingData);
        toast.success('Booking added successfully');
        setIsAddModalOpen(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to add booking');
      }
    },
    [createBooking]
  );

  const handleUpdate = useCallback(
    async (id, bookingData) => {
      try {
        await updateBooking.mutateAsync({
          id, ...bookingData 
        });
        toast.success('Booking updated successfully');
        setIsUpdateModalOpen(false);
        setUpdatingBooking(null);
      } catch (error) {
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
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to delete bookings');
        },
      });
    } else if (deletingBooking) {
      deleteBooking.mutate(deletingBooking.id, {
        onSuccess: () => {
          toast.success('Booking deleted successfully');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to delete booking');
        },
      });
    }
    setIsDeleteModalOpen(false);
    setDeletingBooking(null);
    setDeletingBookings([]);
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
      toast.error(error.response?.data?.message || 'Failed to approve booking');
    }
  }, [approveBooking]);

  /*
   * STATES
   *
   *================================================*/
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
              >
                <Plus className="page-btn-icon" />
                Add Booking
              </button>
              <button className="page-btn-secondary">
                <Filter className="page-btn-icon" />
                Filter
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