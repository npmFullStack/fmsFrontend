// [file name]: CustomerBookings.jsx
import React, { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Package, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePayment } from '../hooks/usePayment';
import TableLayout from '../components/layout/TableLayout';
import CustomerBookingsTable from '../components/tables/CustomerBookingsTable';
import PayBooking from '../components/modals/PayBooking';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const CustomerBookings = () => {
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);

  const { customerBookingsQuery } = usePayment();

  // ✅ FIXED: Use the hook properly with params
  const { data, isLoading, isError } = customerBookingsQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    with_ar: true, // Tell backend to include AR data
    with_accounts_receivable: true
  });

  // ✅ FIXED: Use data from the hook response
  const bookings = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    from: data?.from || 0,
    to: data?.to || 0,
    total: data?.total || 0,
  };

  const handlePayBooking = useCallback((booking) => {
    setSelectedBooking(booking);
    setIsPayModalOpen(true);
  }, []);

  const handleDownloadStatement = useCallback((statementData) => {
    // Open the printBillingStatement.html with data as URL parameters
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
    // Encode the statement data to pass as URL parameters
    const encodedData = encodeURIComponent(JSON.stringify(statementData));
    const printUrl = `/printBillingStatement.html?data=${encodedData}`;
    
    // Open in new window for printing
    const printWindow = window.open(printUrl, '_blank');
    
    // Focus the window for better UX
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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="page-title">My Bookings</h1>
            <p className="page-subtitle">View and manage your shipping bookings</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface rounded-lg border border-main p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted">Total Bookings</p>
              <p className="text-2xl font-bold text-heading">{pagination.total}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-surface rounded-lg border border-main p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted">In Transit</p>
              <p className="text-2xl font-bold text-heading">
                {bookings.filter(b => b.booking_status === 'in_transit').length}
              </p>
            </div>
            <Package className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-surface rounded-lg border border-main p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted">Delivered</p>
              <p className="text-2xl font-bold text-heading">
                {bookings.filter(b => b.booking_status === 'delivered').length}
              </p>
            </div>
            <Package className="w-8 h-8 text-green-600" />
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
              placeholder="Search by booking number, route, or status"
            />
          }
          actions={
            <div className="page-actions">
              <span className="text-sm text-muted">
                Showing {bookings.length} of {pagination.total} bookings
              </span>
            </div>
          }
        >
          <CustomerBookingsTable
            data={bookings}
            onPay={handlePayBooking}
            onDownloadStatement={handleDownloadStatement}
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