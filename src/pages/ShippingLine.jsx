// src/pages/ShippingLine.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { useShippingLine } from '../hooks/useShippingLine';
import { useOptimizedApi } from '../hooks/useOptimizedApi';
import TableLayout from '../components/layout/TableLayout';
import ShippingLineTable from '../components/tables/ShippingLineTable';
import AddShippingLine from '../components/modals/AddShippingLine';
import DeleteShippingLine from '../components/modals/DeleteShippingLine';
import UpdateShippingLine from '../components/modals/UpdateShippingLine';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const ShippingLine = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deletingShippingLine, setDeletingShippingLine] = useState(null);
  const [deletingShippingLines, setDeletingShippingLines] = useState([]);
  const [updatingShippingLine, setUpdatingShippingLine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');
  const [forceRefresh, setForceRefresh] = useState(0);

  // Optimized API hook
  const { optimizedRequest, cancelRequest, clearCache } = useOptimizedApi();

  // ✅ useShippingLine hook handles everything
  const {
    shippingLinesQuery,
    createShippingLine,
    updateShippingLine,
    deleteShippingLine,
    bulkDeleteShippingLines,
  } = useShippingLine();

  // ✅ Fetch shipping lines with optimization
  const { data, isLoading, isError, refetch } = shippingLinesQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort,
    direction,
    _refresh: forceRefresh // Add refresh trigger
  });

  const sortedShippingLines = useMemo(() => {
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

  const shippingLines = sortedShippingLines;
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
    clearCache('shipping_lines'); // Clear cache for fresh data
    setForceRefresh(prev => prev + 1);
    toast.success('Data refreshed');
  }, [clearCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest('shipping_lines');
    };
  }, [cancelRequest]);

  /* =========================
   * CRUD ACTIONS
   * ========================= */
  const handleAdd = useCallback(async (shippingLineData) => {
    try {
      await createShippingLine.mutateAsync(shippingLineData);
      
      // Clear cache after successful creation
      clearCache('shipping_lines');
      toast.success('Shipping line added successfully');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Add shipping line error:', error);
      toast.error(error.response?.data?.message || 'Failed to add shipping line');
    }
  }, [createShippingLine, clearCache]);

  const handleUpdate = useCallback(async (id, shippingLineData) => {
    try {
      await updateShippingLine.mutateAsync({ 
        id, 
        ...shippingLineData 
      });
      
      // Clear cache after successful update
      clearCache('shipping_lines');
      toast.success('Shipping line updated successfully');
      setIsUpdateModalOpen(false);
      setUpdatingShippingLine(null);
    } catch (error) {
      console.error('Update shipping line error:', error);
      toast.error(error.response?.data?.message || 'Failed to update shipping line');
    }
  }, [updateShippingLine, clearCache]);

  const handleDelete = useCallback(() => {
    if (deletingShippingLines.length > 0) {
      const ids = deletingShippingLines.map((sl) => sl.id);
      bulkDeleteShippingLines.mutate(ids, {
        onSuccess: (res) => {
          clearCache('shipping_lines');
          toast.success(res?.message || 'Shipping lines deleted successfully');
          setIsDeleteModalOpen(false);
          setDeletingShippingLine(null);
          setDeletingShippingLines([]);
        },
        onError: (error) => {
          console.error('Bulk delete error:', error);
          toast.error(error.response?.data?.message || 'Failed to delete shipping lines');
        },
      });
    } else if (deletingShippingLine) {
      deleteShippingLine.mutate(deletingShippingLine.id, {
        onSuccess: () => {
          clearCache('shipping_lines');
          toast.success('Shipping line deleted successfully');
          setIsDeleteModalOpen(false);
          setDeletingShippingLine(null);
          setDeletingShippingLines([]);
        },
        onError: (error) => {
          console.error('Delete shipping line error:', error);
          toast.error(error.response?.data?.message || 'Failed to delete shipping line');
        },
      });
    } else {
      setIsDeleteModalOpen(false);
      setDeletingShippingLine(null);
      setDeletingShippingLines([]);
    }
  }, [deleteShippingLine, bulkDeleteShippingLines, deletingShippingLine, deletingShippingLines, clearCache]);

  const handleEditClick = useCallback((shippingLine) => {
    setUpdatingShippingLine(shippingLine);
    setIsUpdateModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((shippingLineOrShippingLines) => {
    if (Array.isArray(shippingLineOrShippingLines)) {
      setDeletingShippingLines(shippingLineOrShippingLines);
      setDeletingShippingLine(null);
    } else {
      setDeletingShippingLine(shippingLineOrShippingLines);
      setDeletingShippingLines([]);
    }
    setIsDeleteModalOpen(true);
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
          <p>Failed to load shipping lines. Please try again.</p>
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
            <h1 className="page-title">Shipping Line Management</h1>
            <p className="page-subtitle">Manage your shipping lines and their information</p>
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
              placeholder="Search shipping lines"
            />
          }
          actions={
            <div className="page-actions">
              <button 
                onClick={() => setIsAddModalOpen(true)} 
                className="page-btn-primary"
                disabled={createShippingLine.isPending}
              >
                <Plus className="page-btn-icon" />
                Add Shipping Line
              </button>
            </div>
          }
        >
          <ShippingLineTable
            data={shippingLines}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            sortField={sort}
            sortDirection={direction}
            onSortChange={handleSortChange}
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

      {/* Modals */}
      <AddShippingLine
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
        isLoading={createShippingLine.isPending}
      />

      <UpdateShippingLine
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdatingShippingLine(null);
        }}
        onUpdate={handleUpdate}
        shippingLine={updatingShippingLine}
        isLoading={updateShippingLine.isPending}
      />

      <DeleteShippingLine
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingShippingLine(null);
          setDeletingShippingLines([]);
        }}
        onDelete={handleDelete}
        shippingLine={deletingShippingLine}
        shippingLines={deletingShippingLines}
        isLoading={deleteShippingLine.isPending || bulkDeleteShippingLines.isPending}
      />
    </div>
  );
};

export default ShippingLine;