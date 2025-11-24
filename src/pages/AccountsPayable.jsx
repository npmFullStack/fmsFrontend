// src/pages/AccountsPayable.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query'; // ✅ ADD THIS IMPORT

import { useAP } from '../hooks/useAP';
import { useBooking } from '../hooks/useBooking';
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
  const [direction, setDirection] = useState('desc');
  const [selectedRecords, setSelectedRecords] = useState([]);

  // ✅ ADD QUERY CLIENT
  const queryClient = useQueryClient();

  // ✅ Hooks
  const { apQuery, createAP } = useAP();
  const { bookingsQuery } = useBooking();

  // ✅ Fetch AP records
  const { data, isLoading, isError, refetch } = apQuery({ // ✅ ADD refetch
    search: debouncedSearch,
    page,
    per_page: 10,
    sort,
    direction
  });

  // ✅ Fetch bookings for the dropdown
  const { data: bookingsData, isLoading: bookingsLoading } = bookingsQuery({
    per_page: 100,
    status: 'approved'
  });

  const bookings = bookingsData?.data || [];

  // Client-side sorting (fallback)
  const sortedAP = useMemo(() => {
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

  const apRecords = sortedAP;
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

  /* =========================
   * UPDATED CRUD ACTIONS
   * ========================= */
  const handleAdd = useCallback(
    async (apData) => {
      try {
        const response = await createAP.mutateAsync(apData);
        toast.success('Charges added successfully');
        setIsAddModalOpen(false);
        
        // ✅ FORCE REFRESH ALL RELATED DATA
        console.log('Refreshing data after adding charges...');
        
        // Invalidate AP queries
        queryClient.invalidateQueries(['accounts-payables']);
        
        // Invalidate AR queries
        queryClient.invalidateQueries(['accounts-receivables']);
        
        // Invalidate payable charges queries
        queryClient.invalidateQueries(['pay-charges']);
        
        // Manually refetch current AP data
        await refetch();
        
        console.log('Data refresh completed');
        
      } catch (error) {
        console.error('Failed to add charges:', error);
        toast.error(error.response?.data?.message || 'Failed to add charges');
      }
    },
    [createAP, queryClient, refetch] // ✅ ADD DEPENDENCIES
  );

  const handleViewDetails = useCallback((apRecord) => {
    console.log('View AP details:', apRecord);
    toast.success(`Viewing details for ${apRecord.voucher_number}`);
  }, []);

  const handlePrint = useCallback((apRecord) => {
    console.log('Print AP record:', apRecord);
    toast.success(`Printing ${apRecord.voucher_number}`);
  }, []);

  const handleBulkPrint = useCallback((recordIds) => {
    console.log('Bulk print records:', recordIds);
    toast.success(`Printing ${recordIds.length} records`);
  }, []);

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
          Failed to load accounts payable records. Please try again.
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
        <h1 className="page-title">Accounts Payable</h1>
        <p className="page-subtitle">Manage freight, trucking, port, and miscellaneous charges</p>
      </div>

      {/* Table Section */}
      <div className="page-table-section">
        <TableLayout
          searchBar={
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search by voucher, booking number, or customer"
            />
          }
          actions={
            <div className="page-actions">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="page-btn-primary"
              >
                <Plus className="page-btn-icon" />
                Add Charges
              </button>
            </div>
          }
        >
          <AccountsPayableTable
            data={apRecords}
            onView={handleViewDetails}
            onPrint={handlePrint}
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

      {/* Add Charges Modal */}
      <AddCharge
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
        isLoading={createAP.isPending}
        bookings={bookings}
      />
    </div>
  );
};

export default AccountsPayable;