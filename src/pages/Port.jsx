import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { usePort } from '../hooks/usePort';
import { useOptimizedApi } from '../hooks/useOptimizedApi';
import TableLayout from '../components/layout/TableLayout';
import PortTable from '../components/tables/PortTable';
import AddPort from '../components/modals/AddPort';
import DeletePort from '../components/modals/DeletePort';
import UpdatePort from '../components/modals/UpdatePort';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const Port = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deletingPort, setDeletingPort] = useState(null);
  const [deletingPorts, setDeletingPorts] = useState([]);
  const [updatingPort, setUpdatingPort] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');
  const [forceRefresh, setForceRefresh] = useState(0);

  // Optimized API hook
  const { optimizedRequest, cancelRequest, clearCache } = useOptimizedApi();

  // ✅ usePort hook handles everything
  const {
    portsQuery,
    createPort,
    updatePort,
    deletePort,
    bulkDeletePorts,
  } = usePort();

  // ✅ Fetch ports with optimization
  const { data, isLoading, isError, refetch } = portsQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort,
    direction,
    _refresh: forceRefresh // Add refresh trigger
  });

  // Client-side sorting (fallback if server-side sorting isn't working)
  const sortedPorts = useMemo(() => {
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

  const ports = sortedPorts;
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
    clearCache('ports'); // Clear cache for fresh data
    setForceRefresh(prev => prev + 1);
    toast.success('Data refreshed');
  }, [clearCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest('ports');
    };
  }, [cancelRequest]);

  /* =========================
   * CRUD ACTIONS
   * ========================= */
  const handleAdd = useCallback(async (portData) => {
    try {
      await createPort.mutateAsync(portData);
      
      // Clear cache after successful creation
      clearCache('ports');
      toast.success('Port added successfully');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Add port error:', error);
      toast.error(error.response?.data?.message || 'Failed to add port');
    }
  }, [createPort, clearCache]);

  const handleUpdate = useCallback(async (id, portData) => {
    try {
      await updatePort.mutateAsync({ 
        id, 
        ...portData 
      });
      
      // Clear cache after successful update
      clearCache('ports');
      toast.success('Port updated successfully');
      setIsUpdateModalOpen(false);
      setUpdatingPort(null);
    } catch (error) {
      console.error('Update port error:', error);
      toast.error(error.response?.data?.message || 'Failed to update port');
    }
  }, [updatePort, clearCache]);

  const handleDelete = useCallback(() => {
    if (deletingPorts.length > 0) {
      const ids = deletingPorts.map((port) => port.id);
      bulkDeletePorts.mutate(ids, {
        onSuccess: (res) => {
          clearCache('ports');
          toast.success(res?.message || 'Ports deleted successfully');
          setIsDeleteModalOpen(false);
          setDeletingPort(null);
          setDeletingPorts([]);
        },
        onError: (error) => {
          console.error('Bulk delete error:', error);
          toast.error(error.response?.data?.message || 'Failed to delete ports');
        },
      });
    } else if (deletingPort) {
      deletePort.mutate(deletingPort.id, {
        onSuccess: () => {
          clearCache('ports');
          toast.success('Port deleted successfully');
          setIsDeleteModalOpen(false);
          setDeletingPort(null);
          setDeletingPorts([]);
        },
        onError: (error) => {
          console.error('Delete port error:', error);
          toast.error(error.response?.data?.message || 'Failed to delete port');
        },
      });
    } else {
      setIsDeleteModalOpen(false);
      setDeletingPort(null);
      setDeletingPorts([]);
    }
  }, [deletePort, bulkDeletePorts, deletingPort, deletingPorts, clearCache]);

  const handleEditClick = useCallback((port) => {
    setUpdatingPort(port);
    setIsUpdateModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((portOrPorts) => {
    if (Array.isArray(portOrPorts)) {
      setDeletingPorts(portOrPorts);
      setDeletingPort(null);
    } else {
      setDeletingPort(portOrPorts);
      setDeletingPorts([]);
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
          <p>Failed to load ports. Please try again.</p>
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
            <h1 className="page-title">Port Management</h1>
            <p className="page-subtitle">Manage your shipping ports and their locations</p>
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
              placeholder="Search ports"
            />
          }
          actions={
            <div className="page-actions">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="page-btn-primary"
                disabled={createPort.isPending}
              >
                <Plus className="page-btn-icon" />
                Add Port
              </button>
            </div>
          }
        >
          <PortTable
            data={ports}
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
      <AddPort
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
        isLoading={createPort.isPending}
      />

      <UpdatePort
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdatingPort(null);
        }}
        onUpdate={handleUpdate}
        port={updatingPort}
        isLoading={updatePort.isPending}
      />

      <DeletePort
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingPort(null);
          setDeletingPorts([]);
        }}
        onDelete={handleDelete}
        port={deletingPort}
        ports={deletingPorts}
        isLoading={deletePort.isPending || bulkDeletePorts.isPending}
      />
    </div>
  );
};

export default Port;