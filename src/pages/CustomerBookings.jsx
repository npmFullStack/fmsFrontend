// [file name]: CustomerBookings.jsx
import React, { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePayment } from '../hooks/usePayment';
import { useBooking } from '../hooks/useBooking';
import { useAR } from '../hooks/useAR'; // Add this import
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

  const { customerBookingsQuery } = usePayment();
  const { createBooking } = useBooking();
  const { paymentBreakdownQuery } = useAR(); // Add this hook

  const { data, isLoading, isError } = customerBookingsQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    with_ar: true,
    with_accounts_receivable: true
  });

  const bookings = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    from: data?.from || 0,
    to: data?.to || 0,
    total: data?.total || 0,
  };

  // Function to get charges breakdown for a booking
  const getChargesBreakdown = useCallback((bookingId) => {
    if (!bookingId) return null;
    
    const { data: breakdownData } = paymentBreakdownQuery(bookingId);
    return breakdownData?.charges || null;
  }, [paymentBreakdownQuery]);

  const handleAdd = useCallback(
    async (bookingData) => {
      console.log('🎯 CUSTOMER: handleAdd called with data:', bookingData);
      try {
        console.log('🎯 CUSTOMER: Calling createBooking.mutateAsync...');
        await createBooking.mutateAsync(bookingData);
        console.log('🎯 CUSTOMER: createBooking completed successfully');
        toast.success('Booking submitted successfully! Waiting for admin approval.');
        setIsAddModalOpen(false);
      } catch (error) {
        console.error('🎯 CUSTOMER: Add booking error:', error);
        toast.error(error.response?.data?.message || 'Failed to submit booking');
      }
    },
    [createBooking]
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
  }, []);

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
          Failed to load your bookings. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
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
            getChargesBreakdown={getChargesBreakdown} // Pass the function to table
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