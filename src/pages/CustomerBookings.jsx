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
    // Generate PDF billing statement
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

  // Function to generate PDF billing statement
  const generateBillingStatementPDF = (statementData) => {
    // You can use libraries like jsPDF, pdfmake, or generate a printable HTML page
    // Here's a simple implementation using window.print() for a printable version
    
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Billing Statement - ${statementData.bookingNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #333; }
          .document-title { font-size: 20px; margin: 10px 0; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .grid-item { margin-bottom: 10px; }
          .label { font-weight: bold; color: #666; }
          .value { margin-left: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .total-section { text-align: right; margin-top: 20px; }
          .amount { font-size: 18px; font-weight: bold; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Your Shipping Company</div>
          <div class="document-title">BILLING STATEMENT</div>
          <div>Date: ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="grid-2">
          <div class="section">
            <div class="section-title">Booking Information</div>
            <div class="grid-item"><span class="label">Booking #:</span><span class="value">${statementData.bookingNumber}</span></div>
            <div class="grid-item"><span class="label">HWB #:</span><span class="value">${statementData.hwbNumber}</span></div>
            <div class="grid-item"><span class="label">Customer:</span><span class="value">${statementData.customerName}</span></div>
            <div class="grid-item"><span class="label">Booking Date:</span><span class="value">${statementData.bookingDate}</span></div>
            <div class="grid-item"><span class="label">Status:</span><span class="value">${statementData.status}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Shipping Details</div>
            <div class="grid-item"><span class="label">Route:</span><span class="value">${statementData.route}</span></div>
            <div class="grid-item"><span class="label">Container:</span><span class="value">${statementData.containerInfo}</span></div>
            <div class="grid-item"><span class="label">VAN #:</span><span class="value">${statementData.vanNumber}</span></div>
            <div class="grid-item"><span class="label">Shipping Line:</span><span class="value">${statementData.shippingLine}</span></div>
            <div class="grid-item"><span class="label">Trucking:</span><span class="value">${statementData.truckingCompany}</span></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Items Summary</div>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Weight (kg)</th>
                <th>Total Weight (kg)</th>
              </tr>
            </thead>
            <tbody>
              ${statementData.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.category}</td>
                  <td>${item.quantity}</td>
                  <td>${item.weight}</td>
                  <td>${(item.weight * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2"><strong>Total</strong></td>
                <td><strong>${statementData.totalItems}</strong></td>
                <td></td>
                <td><strong>${statementData.totalWeight.toFixed(2)} kg</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Payment Summary</div>
          <div class="total-section">
            <div class="grid-item">
              <span class="label">Total Amount:</span>
              <span class="value amount">${formatCurrency(statementData.totalAmount)}</span>
            </div>
            <div class="grid-item">
              <span class="label">Balance Due:</span>
              <span class="value amount">${formatCurrency(statementData.balanceDue)}</span>
            </div>
          </div>
        </div>

        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Statement
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>

        <script>
          function formatCurrency(amount) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(amount);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
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

// Helper function for currency formatting in the PDF
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export default CustomerBookings;