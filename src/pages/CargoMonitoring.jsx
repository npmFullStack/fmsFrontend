// src/pages/CargoMonitoring.jsx
import React, { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Filter } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCargoMonitoring } from '../hooks/useCargoMonitoring';
import TableLayout from '../components/layout/TableLayout';
import CargoMonitoringTable from '../components/tables/CargoMonitoringTable';
import UpdateCargoStatus from '../components/modals/UpdateCargoStatus';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const CargoMonitoring = () => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatingCargo, setUpdatingCargo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);

  const {
    cargoMonitoringQuery,
    updateCargoStatus,
  } = useCargoMonitoring();

  // Fetch cargo monitoring data
  const { data, isLoading, isError } = cargoMonitoringQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
  });

  const cargoMonitoring = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    from: data?.from || 0,
    to: data?.to || 0,
    total: data?.total || 0,
  };

  const handleUpdateStatus = useCallback(async (cargoMonitoring) => {
    setUpdatingCargo(cargoMonitoring);
    setIsUpdateModalOpen(true);
  }, []);

  const handleStatusUpdate = useCallback(
    async (id, status) => {
      try {
        await updateCargoStatus.mutateAsync({ id, status });
        toast.success('Cargo status updated successfully');
        setIsUpdateModalOpen(false);
        setUpdatingCargo(null);
      } catch (error) {
        console.error('Update cargo status error:', error);
        toast.error(error.response?.data?.message || 'Failed to update cargo status');
        throw error;
      }
    },
    [updateCargoStatus]
  );

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
          Failed to load cargo monitoring data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Cargo Monitoring</h1>
        <p className="page-subtitle">Track and update cargo shipping status</p>
      </div>

      {/* Table Section */}
      <div className="page-table-section">
        <TableLayout
          searchBar={
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search by booking number, customer name, or VAN number"
            />
          }
          actions={
            <div className="page-actions">
              <button className="page-btn-secondary">
                <Filter className="page-btn-icon" />
                Filter
              </button>
            </div>
          }
        >
          <CargoMonitoringTable
            data={cargoMonitoring}
            onUpdateStatus={handleUpdateStatus}
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

      {/* Update Status Modal */}
      <UpdateCargoStatus
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdatingCargo(null);
        }}
        onUpdate={handleStatusUpdate}
        cargoMonitoring={updatingCargo}
        isLoading={updateCargoStatus.isPending}
      />
    </div>
  );
};

export default CargoMonitoring;