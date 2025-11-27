// src/components/pages/CustomerBookings.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, RefreshCw, Download } from 'lucide-react';
import toast from 'react-hot-toast';

import { useBooking } from '../hooks/useBooking';
import { useAuth } from '../hooks/useAuth';
import { usePayment } from '../hooks/usePayment';
import { useAR } from '../hooks/useAR';
import { useCargoMonitoring } from '../hooks/useCargoMonitoring'; // Add this import
import TableLayout from '../components/layout/TableLayout';
import CustomerBookingsTable from '../components/tables/CustomerBookingsTable';
import CreateBookingRequest from '../components/modals/CreateBookingRequest';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const CustomerBookings = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('desc');
  const [forceRefresh, setForceRefresh] = useState(0);

  const { userQuery } = useAuth();
  const { customerBookingsQuery, createCustomerBooking } = useBooking();
  const { createPaymentForBooking } = usePayment();
  const { paymentBreakdownQuery } = useAR();
  const { cargoMonitoringByBookingQuery } = useCargoMonitoring(); // Add this

  const currentUser = userQuery.data?.user;

  // Fetch customer bookings
  const { data, isLoading, isError, refetch } = customerBookingsQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort,
    direction,
    _refresh: forceRefresh
  });

  const bookings = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    from: data?.from || 0,
    to: data?.to || 0,
    total: data?.total || 0,
  };

  // Get cargo monitoring data for each booking
  const getCargoMonitoringData = useCallback((bookingId) => {
    if (!bookingId) return null;
    const { data } = cargoMonitoringByBookingQuery(bookingId);
    return data;
  }, [cargoMonitoringByBookingQuery]);

  // Handle payment
  const handlePay = useCallback(async (booking) => {
    try {
      const paymentData = {
        amount: booking.accounts_receivable?.collectible_amount || 0,
        payment_method: 'gcash',
        booking_id: booking.id,
        description: `Payment for booking ${booking.booking_number}`
      };

      await createPaymentForBooking.mutateAsync({
        bookingId: booking.id,
        ...paymentData
      });

      toast.success('Payment initiated successfully!');
      handleRefresh();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    }
  }, [createPaymentForBooking]);

  // Handle download statement
  const handleDownloadStatement = useCallback((statementData) => {
    console.log('Download billing statement:', statementData);
    // Implement PDF generation/download logic here
    toast.success('Billing statement downloaded');
  }, []);

  // Get charges breakdown for a booking
  const getChargesBreakdown = useCallback((bookingId) => {
    if (!bookingId) return null;
    const { data } = paymentBreakdownQuery(bookingId);
    return data;
  }, [paymentBreakdownQuery]);

  // Handle create booking
  const handleCreateBooking = useCallback(async (bookingData) => {
    try {
      if (!currentUser?.id) {
        toast.error('User not authenticated');
        return;
      }

      console.log('📝 Final booking data:', bookingData);
      
      await createCustomerBooking.mutateAsync(bookingData);
      toast.success('Booking request submitted successfully! Waiting for admin approval.');
      setIsCreateModalOpen(false);
      handleRefresh();
    } catch (error) {
      console.error('Create booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking request');
    }
  }, [createCustomerBooking, currentUser]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    setForceRefresh(prev => prev + 1);
    toast.success('Data refreshed');
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((field, dir) => {
    setSort(field);
    setDirection(dir);
  }, []);

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

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">My Bookings</h1>
            <p className="page-subtitle">Manage your shipping bookings and payments</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="page-btn-secondary flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="page-btn-primary flex items-center gap-2"
              disabled={createCustomerBooking.isPending}
            >
              <Plus className="w-4 h-4" />
              New Booking Request
            </button>
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
              placeholder="Search bookings by booking number, HWB, or VAN number"
            />
          }
          actions={
            <div className="text-sm text-muted">
              Showing {pagination.from}-{pagination.to} of {pagination.total} bookings
            </div>
          }
        >
          <CustomerBookingsTable
            data={bookings}
            onPay={handlePay}
            onDownloadStatement={handleDownloadStatement}
            getChargesBreakdown={getChargesBreakdown}
            getCargoMonitoringData={getCargoMonitoringData} // Add this prop
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

      {/* Create Booking Modal */}
      <CreateBookingRequest
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateBooking}
        isLoading={createCustomerBooking.isPending}
        currentUser={currentUser}
      />
    </div>
  );
};

export default CustomerBookings;