// src/pages/ManagePayments.jsx
import React, { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { RefreshCw, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

import { usePayment } from '../hooks/usePayment';
import TableLayout from '../components/layout/TableLayout';
import ManagePaymentsTable from '../components/tables/ManagePaymentsTable';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const ManagePayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const {
    paymentsQuery,
    updatePaymentStatus,
  } = usePayment();

  // Fetch payments with filters
  const { data, isLoading, isError, refetch } = paymentsQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    payment_method: methodFilter !== 'all' ? methodFilter : undefined,
    _refresh: forceRefresh
  });

  const payments = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    from: data?.from || 0,
    to: data?.to || 0,
    total: data?.total || 0,
  };

  // Handle payment verification
  const handleVerifyPayment = useCallback(async (paymentId, action) => {
    try {
      const adminNotes = action === 'approve' 
        ? 'Payment verified and approved by admin' 
        : 'Payment rejected by admin';
      
      await updatePaymentStatus.mutateAsync({
        id: paymentId,
        status: action === 'approve' ? 'approved' : 'rejected',
        admin_notes: adminNotes
      });
      
      // Refresh data
      setForceRefresh(prev => prev + 1);
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }, [updatePaymentStatus]);

  // Handle view details
  const handleViewDetails = useCallback((payment) => {
    // You can implement a modal or expanded view here
    console.log('View payment details:', payment);
    toast.success('Payment details loaded');
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setForceRefresh(prev => prev + 1);
    toast.success('Payments refreshed');
  }, []);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setStatusFilter('all');
    setMethodFilter('all');
    toast.success('Filters reset');
  }, []);

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner"></div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="page-error">
        <div className="page-error-content">
          <p>Failed to load payments. Please try again.</p>
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
            <h1 className="page-title">Payment Management</h1>
            <p className="page-subtitle">Verify and manage customer payments</p>
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

      {/* Filters Section */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Verification</option>
                  <option value="verified">Verified</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Methods</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="gcash">GCash</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="page-table-section">
        <TableLayout
          searchBar={
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search payments by booking number, client name, or reference number"
            />
          }
          actions={
            <div className="text-sm text-gray-500">
              Showing {pagination.from}-{pagination.to} of {pagination.total} payments
            </div>
          }
        >
          <ManagePaymentsTable
            data={payments}
            onVerify={handleVerifyPayment}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />
        </TableLayout>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="page-pagination">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            onPageChange={setPage}
          />
        </div>
      )}


    </div>
  );
};

export default ManagePayments;