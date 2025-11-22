// src/pages/CargoMonitoring.jsx
import React, { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Calendar } from 'lucide-react';
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
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedRecords, setSelectedRecords] = useState([]);

  const {
    cargoMonitoringQuery,
    updateCargoStatus,
  } = useCargoMonitoring();

  // Fetch cargo monitoring data
  const { data, isLoading, isError } = cargoMonitoringQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    date_filter: dateFilter,
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
    async (id, status, timestamp) => { 
      try {
        await updateCargoStatus.mutateAsync({ id, status, timestamp });
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

  const handlePrintCargoMonitoring = useCallback((cargoData) => {
    // Prepare data for printing
    const printData = {
      bookingNumber: cargoData.booking?.booking_number || '',
      hwbNumber: cargoData.booking?.hwb_number || '',
      customerName: `${cargoData.booking?.first_name || ''} ${cargoData.booking?.last_name || ''}`.trim(),
      shipper: `${cargoData.booking?.shipper_first_name || ''} ${cargoData.booking?.shipper_last_name || ''}`.trim(),
      stuffingDate: cargoData.picked_up_at || '',
      containerSize: cargoData.booking?.container_size?.size || cargoData.booking?.container_size?.name || '',
      commodity: cargoData.booking?.items?.map(item => item.name).join(', ') || 'General Cargo',
      shippingLine: cargoData.booking?.shipping_line?.name || '',
      vanNumber: cargoData.booking?.van_number || '',
      pickupPoint: cargoData.booking?.origin?.route_name || cargoData.booking?.origin?.name || '',
      destination: cargoData.booking?.destination?.route_name || cargoData.booking?.destination?.name || '',
      modeOfService: cargoData.booking?.mode_of_service || '',
      atd: cargoData.origin_port_at || '',
      ata: cargoData.destination_port_at || '',
      truckerDest: cargoData.booking?.truck_comp?.name || '',
      deliveryDate: cargoData.delivered_at || '',
      status: cargoData.current_status || '',
      emptyContainerReturnDate: '',
      // Include all timestamps with time
      pending_at: cargoData.pending_at,
      picked_up_at: cargoData.picked_up_at,
      origin_port_at: cargoData.origin_port_at,
      in_transit_at: cargoData.in_transit_at,
      destination_port_at: cargoData.destination_port_at,
      out_for_delivery_at: cargoData.out_for_delivery_at,
      delivered_at: cargoData.delivered_at,
      // Date filter info for printing
      dateFilter: dateFilter
    };

    // Encode and open print window
    const encodedData = encodeURIComponent(JSON.stringify(printData));
    const printUrl = `/printCargoMonitoring.html?data=${encodedData}`;
    
    const printWindow = window.open(printUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
  }, [dateFilter]);

  const handleBulkPrint = useCallback((recordIds) => {
    if (recordIds.length === 0) {
      toast.error('Please select at least one record to print');
      return;
    }

    const selectedRecords = cargoMonitoring.filter(monitoring => recordIds.includes(monitoring.id));
    
    // Prepare bulk print data in the same format as individual print
    const printData = selectedRecords.map(monitoring => ({
      bookingNumber: monitoring.booking?.booking_number || '',
      hwbNumber: monitoring.booking?.hwb_number || '',
      customerName: `${monitoring.booking?.first_name || ''} ${monitoring.booking?.last_name || ''}`.trim(),
      shipper: `${monitoring.booking?.shipper_first_name || ''} ${monitoring.booking?.shipper_last_name || ''}`.trim(),
      stuffingDate: monitoring.picked_up_at || '',
      containerSize: monitoring.booking?.container_size?.size || monitoring.booking?.container_size?.name || '',
      commodity: monitoring.booking?.items?.map(item => item.name).join(', ') || 'General Cargo',
      shippingLine: monitoring.booking?.shipping_line?.name || '',
      vanNumber: monitoring.booking?.van_number || '',
      pickupPoint: monitoring.booking?.origin?.route_name || monitoring.booking?.origin?.name || '',
      destination: monitoring.booking?.destination?.route_name || monitoring.booking?.destination?.name || '',
      modeOfService: monitoring.booking?.mode_of_service || '',
      atd: monitoring.origin_port_at || '',
      ata: monitoring.destination_port_at || '',
      truckerDest: monitoring.booking?.truck_comp?.name || '',
      deliveryDate: monitoring.delivered_at || '',
      status: monitoring.current_status || '',
      emptyContainerReturnDate: '',
      // Date filter info for printing
      dateFilter: dateFilter
    }));

    // Encode and open print window with multiple parameter
    const encodedData = encodeURIComponent(JSON.stringify(printData));
    const printUrl = `/printCargoMonitoring.html?data=${encodedData}&multiple=true`;
    
    const printWindow = window.open(printUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
    
    toast.success(`Printing ${recordIds.length} records`);
  }, [cargoMonitoring, dateFilter]);

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

  const handleDateFilterChange = useCallback((filter) => {
    setDateFilter(filter);
    setPage(1);
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
              {/* Date filter will be handled in the table component */}
            </div>
          }
        >
          <CargoMonitoringTable
            data={cargoMonitoring}
            onUpdateStatus={handleUpdateStatus}
            onPrint={handlePrintCargoMonitoring}
            onBulkPrint={handleBulkPrint}
            dateFilter={dateFilter}
            onDateFilterChange={handleDateFilterChange}
            isLoading={isLoading}
            selectedRecords={selectedRecords}
            onSelectRecord={handleSelectRecord}
            onSelectAllRecords={handleSelectAllRecords}
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