// src/pages/AccountsPayable.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAP } from '../hooks/useAP';
import { useBooking } from '../hooks/useBooking';
import { useOptimizedApi } from '../hooks/useOptimizedApi';
import TableLayout from '../components/layout/TableLayout';
import AccountsPayableTable from '../components/tables/AccountsPayableTable';
import AddCharge from '../components/modals/AddCharge';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const AccountsPayable = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');
  const [forceRefresh, setForceRefresh] = useState(0);
  const [selectedRecords, setSelectedRecords] = useState([]); // Add selected records state

  // Optimized API hook
  const { optimizedRequest, cancelRequest, clearCache } = useOptimizedApi();

  // ✅ useAP hookhandles everything
  const {
    apQuery,
    createAP,
  } = useAP();

  // ✅ Add useBooking hook to get bookings for AddCharge
  const { bookingsQuery } = useBooking();
  const { data: bookingsData } = bookingsQuery({
    per_page: 1000, // Get all bookings for dropdown
    status: 'active' // Only active bookings
  });

  const bookings = useMemo(() => bookingsData?.data || [], [bookingsData]);

  // ✅ Fetch AP records with optimization
  const { data, isLoading, isError, refetch } = apQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort,
    direction,
    _refresh: forceRefresh // Add refresh trigger
  });

  const sortedRecords = useMemo(() => {
    if (!data?.data) return [];
    return [...data.data].sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      return direction === 'asc'
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
        ? 1
        : -1;
    });
  }, [data?.data, sort, direction]);

  const apRecords = sortedRecords;
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
    clearCache('accounts-payables'); // Clear cache for fresh data
    setForceRefresh(prev => prev + 1);
    setSelectedRecords([]); // Clear selection on refresh
    toast.success('Data refreshed');
  }, [clearCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest('accounts-payables');
    };
  }, [cancelRequest]);

  /* =========================
   * PRINT HANDLERS
   * ========================= */
  const handlePrintAccountsPayable = useCallback((apData) => {
    // Prepare data for printing
    const printData = {
      ...apData,
      // Ensure all charge arrays exist
      trucking_charges: apData.trucking_charges || [],
      port_charges: apData.port_charges || [],
      misc_charges: apData.misc_charges || [],
      freight_charge: apData.freight_charge || null,
      created_at: apData.created_at || new Date().toISOString(),
      total_expenses: apData.total_expenses || 0
    };

    // Encode and open print window
    const encodedData = encodeURIComponent(JSON.stringify(printData));
    const printUrl = `/printAccountsPayable.html?data=${encodedData}`;
    
    const printWindow = window.open(printUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
  }, []);

  const handleBulkPrint = useCallback((recordIds) => {
    if (recordIds.length === 0) {
      toast.error('Please select at least one record to print');
      return;
    }

    const selectedRecords = apRecords.filter(ap => recordIds.includes(ap.id));
    
    // Prepare bulk print data
    const printData = selectedRecords.map(ap => ({
      ...ap,
      trucking_charges: ap.trucking_charges || [],
      port_charges: ap.port_charges || [],
      misc_charges: ap.misc_charges || [],
      freight_charge: ap.freight_charge || null,
      created_at: ap.created_at || new Date().toISOString(),
      total_expenses: ap.total_expenses || 0
    }));

    // Encode and open print window with multiple parameter
    const encodedData = encodeURIComponent(JSON.stringify(printData));
    const printUrl = `/printAccountsPayable.html?data=${encodedData}&multiple=true`;
    
    const printWindow = window.open(printUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
    
    toast.success(`Printing ${recordIds.length} records`);
  }, [apRecords]);

  const handleSelectRecord = useCallback((recordId, isSelected) => {
    setSelectedRecords(prev => 
      isSelected 
        ? [...prev, recordId]
        : prev.filter(id => id !== recordId)
    );
  }, []);

  const handleSelectAllRecords = useCallback((recordIds) => {
    setSelectedRecords(recordIds);
  }, []);


const handlePrintBRFP = useCallback((apData) => {
  // Prepare data for BRFP printing
  const printData = {
    ...apData,
    booking: apData.booking || {},
    // Ensure all charge arrays exist
    trucking_charges: apData.trucking_charges || [],
    port_charges: apData.port_charges || [],
    misc_charges: apData.misc_charges || [],
    freight_charge: apData.freight_charge || null,
    created_at: apData.created_at || new Date().toISOString()
  };

  // Encode and open BRFP print window
  const encodedData = encodeURIComponent(JSON.stringify(printData));
  const printUrl = `/printBRFP.html?data=${encodedData}`;
  
  const printWindow = window.open(printUrl, '_blank');
  if (printWindow) {
    printWindow.focus();
  }
}, []);
  /* =========================
   * CRUD ACTIONS
   * ========================= */
  const handleAdd = useCallback(async (apData) => {
    try {
      await createAP.mutateAsync(apData);
      
      // Clear cache after successful creation
      clearCache('accounts-payables');
      toast.success('AP record added successfully');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Add AP record error:', error);
      toast.error(error.response?.data?.message || 'Failed to add AP record');
    }
  }, [createAP, clearCache]);

  /* =========================
   * STATES
   * ========================= */
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
          <p>Failed to load accounts payable records. Please try again.</p>
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

  /* =========================
   * UI
   * ========================= */
  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">Accounts Payable</h1>
            <p className="page-subtitle">Manage vendor payments and financial tracking</p>
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
              placeholder="Search by vendor, booking number, or amount"
            />
          }
          actions={
            <div className="page-actions">
              <button 
                onClick={() => setIsAddModalOpen(true)} 
                className="page-btn-primary"
                disabled={createAP.isPending}
              >
                <Plus className="page-btn-icon" />
                Add Charges
              </button>
            </div>
          }
        >
          <AccountsPayableTable
            data={apRecords}
            sortField={sort}
            sortDirection={direction}
            onSortChange={handleSortChange}
            onPrint={handlePrintAccountsPayable}
            onPrintBRFP={handlePrintBRFP}
            onBulkPrint={handleBulkPrint}
            selectedRecords={selectedRecords}
            onSelectRecord={handleSelectRecord}
            onSelectAllRecords={handleSelectAllRecords}
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

      {/* Add Charge Modal - Now with bookings prop */}
      <AddCharge
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
        isLoading={createAP.isPending}
        bookings={bookings} // Pass bookings to AddCharge
      />
    </div>
  );
};

export default AccountsPayable;