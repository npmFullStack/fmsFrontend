// [file name]: AccountsReceivable.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAR } from '../hooks/useAR';
import { useOptimizedApi } from '../hooks/useOptimizedApi';
import TableLayout from '../components/layout/TableLayout';
import AccountsReceivableTable from '../components/tables/AccountsReceivableTable';
import SendTotalPayment from '../components/modals/SendTotalPayment';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const AccountsReceivable = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAR, setSelectedAR] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [selectedRecords, setSelectedRecords] = useState([]);

  // Optimized API hook
  const { optimizedRequest, cancelRequest, clearCache } = useOptimizedApi();

  // ✅ useAR hook with enhanced features
  const { 
    arQuery, 
    updateAR, 
    markAsPaid, 
    sendPaymentEmail,
    createAR 
  } = useAR();

  // ✅ Fetch AR records with optimization
  const { data, isLoading, isError, refetch } = arQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    _refresh: forceRefresh // Add refresh trigger
  });

  const arRecords = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    from: data?.from || 0,
    to: data?.to || 0,
    total: data?.total || 0,
  };

  // Refresh data function
  const handleRefresh = useCallback(() => {
    clearCache('accounts-receivables');
    setForceRefresh(prev => prev + 1);
    setSelectedRecords([]);
    toast.success('Data refreshed');
  }, [clearCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest('accounts-receivables');
    };
  }, [cancelRequest]);

const handlePrintInvoice = useCallback((arRecord) => {
  console.log('AR Record for printing:', arRecord);
  const statementData = generateBillingStatement(arRecord);
  
  // Encode data for URL
  const encodedData = encodeURIComponent(JSON.stringify(statementData));
  
  // Open print window
  const printWindow = window.open(`/printBillingStatement.html?data=${encodedData}`, '_blank');
  
  // Fallback if window.open is blocked
  if (!printWindow) {
    toast.error('Popup blocked! Please allow popups for this site to print.');
    return;
  }
}, []);

// Add this function to generate complete billing statement data
const generateBillingStatement = useCallback((arRecord) => {
  const booking = arRecord.booking || {};
  
  // Calculate due date based on delivery date and terms
  const getDueDate = () => {
    if (!arRecord.terms) return null;
    
    let deliveryDate = null;
    
    // Check cargo monitoring first
    if (booking.cargo_monitoring && booking.cargo_monitoring.delivered_at) {
      deliveryDate = new Date(booking.cargo_monitoring.delivered_at);
    } 
    // Fallback to booking delivery date
    else if (booking.delivery_date) {
      deliveryDate = new Date(booking.delivery_date);
    }
    // If no delivery date yet, no due date
    else {
      return null;
    }
    
    const terms = arRecord.terms || 0;
    const dueDate = new Date(deliveryDate);
    dueDate.setDate(dueDate.getDate() + terms);
    
    return dueDate;
  };

  const dueDate = getDueDate();
  
  const statementData = {
    // Basic info
    bookingNumber: booking.booking_number || arRecord.booking_number || '',
    hwbNumber: booking.booking_number || arRecord.booking_number || '', // Using booking number as HWB
    customerName: `${booking.first_name || ''} ${booking.last_name || ''}`.trim() || 'Customer',
    bookingDate: new Date(arRecord.created_at || booking.created_at).toLocaleDateString(),
    
    // Route info
    route: `${booking.origin?.route_name || booking.origin?.name || booking.origin || 'N/A'} → ${booking.destination?.route_name || booking.destination?.name || booking.destination || 'N/A'}`,
    
    // Container info
    containerInfo: `${booking.container_quantity || 1} x ${booking.container_size?.size || booking.container_size?.name || booking.container_size || '20FT'}`,
    vanNumber: booking.van_number || '',
    
    // Items
    items: booking.items || [],
    totalWeight: booking.items ? booking.items.reduce((sum, i) => sum + (i.weight || 0) * (i.quantity || 0), 0) : 0,
    totalItems: booking.items ? booking.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : 0,
    
    // Payment info
    totalAmount: arRecord.total_payment || 0,
    balanceDue: arRecord.collectible_amount || 0,
    
    // Additional details
    mode: booking.mode_of_service || 'PORT TO PORT',
    commodity: booking.commodity || 'General Cargo',
    shippingLine: booking.shipping_line?.name || 'Not specified',
    truckingCompany: booking.truck_comp?.name || 'Not specified',
    shipper: `${booking.shipper_first_name || ''} ${booking.shipper_last_name || ''}`.trim() || 'Not specified',
    consignee: `${booking.consignee_first_name || ''} ${booking.consignee_last_name || ''}`.trim() || 'Not specified',
    departureDate: booking.departure_date ? new Date(booking.departure_date).toLocaleDateString() : 'Not specified',
    deliveryDate: booking.delivery_date ? new Date(booking.delivery_date).toLocaleDateString() : 'Not specified',
    dueDate: dueDate ? dueDate.toLocaleDateString() : 'Not specified',
    isOverdue: dueDate ? new Date() > dueDate : false,
    isFullyPaid: arRecord.is_paid || arRecord.collectible_amount === 0
  };
  
  console.log('Generated statement data:', statementData);
  return statementData;
}, []);

  // Bulk print function
  const handleBulkPrint = useCallback((recordIds) => {
    if (!recordIds || recordIds.length === 0) {
      toast.error('No records selected for printing');
      return;
    }

    // Get selected records data
    const selectedRecordsData = arRecords.filter(ar => recordIds.includes(ar.id));
    
    // Print each record individually
    selectedRecordsData.forEach((arRecord, index) => {
      setTimeout(() => {
        handlePrintInvoice(arRecord);
      }, index * 1000); // Stagger prints by 1 second
    });

    toast.success(`Printing ${selectedRecordsData.length} billing statement(s)`);
  }, [arRecords, handlePrintInvoice]);

  // Handle record selection
  const handleSelectRecord = useCallback((recordId, isSelected) => {
    setSelectedRecords(prev => {
      if (isSelected) {
        return [...prev, recordId];
      } else {
        return prev.filter(id => id !== recordId);
      }
    });
  }, []);

  // Handle select all records
  const handleSelectAllRecords = useCallback((recordIds) => {
    setSelectedRecords(recordIds);
  }, []);

  // CRUD Actions
  const handleSendPayment = useCallback(
    async (paymentData) => {
      try {
        console.log('Sending payment data:', paymentData);
        
        if (selectedAR && selectedAR.id) {
          // Use the createAR mutation instead of direct api call
          await createAR.mutateAsync(paymentData);
          
          // Send payment email using the mutation
          try {
            await sendPaymentEmail.mutateAsync(selectedAR.id);
            toast.success('Payment request sent to customer successfully');
          } catch (emailError) {
            console.error('Email sending failed:', emailError);
            toast.success('Payment amount set successfully, but email failed to send');
          }
        }
        
        setIsPaymentModalOpen(false);
        setSelectedAR(null);
        // Clear cache and refresh
        clearCache('accounts-receivables');
        refetch();
      } catch (error) {
        console.error('Payment error:', error);
        toast.error(error.response?.data?.message || 'Failed to send payment request');
      }
    },
    [selectedAR, createAR, sendPaymentEmail, clearCache, refetch]
  );

  const handleMarkAsPaid = useCallback(
    async (arId) => {
      try {
        await markAsPaid.mutateAsync(arId);
        // Clear cache after successful mutation
        clearCache('accounts-receivables');
        toast.success('Record marked as paid successfully');
        refetch();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to mark as paid');
      }
    },
    [markAsPaid, clearCache, refetch]
  );

  // Handle opening payment modal for specific AR record
  const handleOpenPaymentModal = useCallback((arRecord) => {
    if (!arRecord.total_expenses || arRecord.total_expenses === 0) {
      toast.error('Please add charges in Accounts Payable first');
      return;
    }
    
    setSelectedAR(arRecord);
    setIsPaymentModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsPaymentModalOpen(false);
    setSelectedAR(null);
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
          <p>Failed to load accounts receivable records. Please try again.</p>
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
      {/* Page Header - Enhanced with refresh */}
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">Accounts Receivable</h1>
            <p className="page-subtitle">Manage customer payments and financial tracking</p>
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
              placeholder="Search by booking number, customer, or amount"
            />
          }
          actions={
            <div className="page-actions">
              <span className="text-sm text-muted">
                Showing {arRecords.length} of {pagination.total} records
              </span>
            </div>
          }
        >
          <AccountsReceivableTable
            data={arRecords}
            onMarkAsPaid={handleMarkAsPaid}
            onSendPayment={handleOpenPaymentModal}
            onPrint={handlePrintInvoice}
            onBulkPrint={handleBulkPrint}
            onSelectRecord={handleSelectRecord}
            onSelectAllRecords={handleSelectAllRecords}
            selectedRecords={selectedRecords}
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

      {/* Send Payment Modal */}
      <SendTotalPayment
        isOpen={isPaymentModalOpen}
        onClose={handleCloseModal}
        onSave={handleSendPayment}
        isLoading={createAR.isPending || sendPaymentEmail.isPending}
        selectedAR={selectedAR}
      />
    </div>
  );
};

export default AccountsReceivable;