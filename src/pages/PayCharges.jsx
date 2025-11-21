// src/pages/PayCharges.jsx
import React, { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAP } from '../hooks/useAP';
import { useBooking } from '../hooks/useBooking';
import TableLayout from '../components/layout/TableLayout';
import PayChargesTable from '../components/tables/PayChargesTable';
import PaidCharges from '../components/modals/PaidCharges';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const PayCharges = () => {
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [selectedAP, setSelectedAP] = useState(null);

  // ✅ Hooks
  const { apQuery, updateChargeStatus } = useAP();
  const { bookingsQuery } = useBooking();

  // ✅ Fetch AP records (unpaid only by default)
  const { data, isLoading, isError } = apQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    status: 'unpaid'
  });

  // ✅ Fetch bookings for the dropdown
  const { data: bookingsData } = bookingsQuery({
    per_page: 100,
    status: 'approved'
  });

  const bookings = bookingsData?.data || [];
  const apRecords = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    from: data?.from || 0,
    to: data?.to || 0,
    total: data?.total || 0,
  };

  /* =========================
   * CRUD ACTIONS
   * ========================= */
  const handlePayCharges = useCallback((apRecord) => {
    setSelectedAP(apRecord);
    setIsPayModalOpen(true);
  }, []);

  const handleMarkAsPaid = useCallback(
    async (apId, chargeType, chargeId, paymentData) => {
      try {
        await updateChargeStatus.mutateAsync({
          apId,
          chargeType,
          chargeId,
          payload: {
            is_paid: true,
            voucher: paymentData.voucher,
            check_date: paymentData.check_date
          }
        });
        toast.success('Charge marked as paid successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to mark charge as paid');
      }
    },
    [updateChargeStatus]
  );

  const handleCloseModal = useCallback(() => {
    setIsPayModalOpen(false);
    setSelectedAP(null);
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
          Failed to load payable charges. Please try again.
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
        <h1 className="page-title">Pay Charges</h1>
        <p className="page-subtitle">Mark freight, trucking, port, and miscellaneous charges as paid</p>
      </div>

      {/* Table Section */}
      <div className="page-table-section">
        <TableLayout
          searchBar={
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search by booking number, customer, or voucher"
            />
          }
          actions={
            <div className="page-actions">
              <span className="text-sm text-muted">
                Showing {apRecords.length} unpaid records
              </span>
            </div>
          }
        >
          <PayChargesTable
            data={apRecords}
            onPayCharges={handlePayCharges}
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

      {/* Pay Charges Modal */}
      <PaidCharges
        isOpen={isPayModalOpen}
        onClose={handleCloseModal}
        apRecord={selectedAP}
        onMarkAsPaid={handleMarkAsPaid}
        isLoading={updateChargeStatus.isPending}
        bookings={bookings}
      />
    </div>
  );
};

export default PayCharges;