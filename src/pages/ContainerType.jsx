// src/pages/ContainerType.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { useContainer } from '../hooks/useContainer';
import { useOptimizedApi } from '../hooks/useOptimizedApi';
import TableLayout from '../components/layout/TableLayout';
import ContainerTypeTable from '../components/tables/ContainerTypeTable';
import AddContainerType from '../components/modals/AddContainerType';
import DeleteContainerType from '../components/modals/DeleteContainerType';
import UpdateContainerType from '../components/modals/UpdateContainerType';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const ContainerType = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deletingContainerType, setDeletingContainerType] = useState(null);
  const [deletingContainerTypes, setDeletingContainerTypes] = useState([]);
  const [updatingContainerType, setUpdatingContainerType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');
  const [forceRefresh, setForceRefresh] = useState(0);

  // Optimized API hook
  const { optimizedRequest, cancelRequest, clearCache } = useOptimizedApi();

  // ✅ useContainer hook handles everything
  const {
    containersQuery,
    createContainer,
    updateContainer,
    deleteContainer,
    bulkDeleteContainers,
  } = useContainer();

  // ✅ Fetch containers with optimization
  const { data, isLoading, isError, refetch } = containersQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort,
    direction,
    _refresh: forceRefresh // Add refresh trigger
  });

  // Client-side sorting (fallback if server-side sorting isn't working)
  const sortedContainerTypes = useMemo(() => {
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

  const containerTypes = sortedContainerTypes;
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
    clearCache('containers'); // Clear cache for fresh data
    setForceRefresh(prev => prev + 1);
    toast.success('Data refreshed');
  }, [clearCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest('containers');
    };
  }, [cancelRequest]);

  /* =========================
   * CRUD ACTIONS
   * ========================= */
  const handleAdd = useCallback(async (containerTypeData) => {
    try {
      await createContainer.mutateAsync(containerTypeData);
      
      // Clear cache after successful creation
      clearCache('containers');
      toast.success('Container type added successfully');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Add container type error:', error);
      toast.error(error.response?.data?.message || 'Failed to add container type');
    }
  }, [createContainer, clearCache]);

  const handleUpdate = useCallback(async (id, containerTypeData) => {
    try {
      await updateContainer.mutateAsync({ 
        id, 
        ...containerTypeData 
      });
      
      // Clear cache after successful update
      clearCache('containers');
      toast.success('Container type updated successfully');
      setIsUpdateModalOpen(false);
      setUpdatingContainerType(null);
    } catch (error) {
      console.error('Update container type error:', error);
      toast.error(error.response?.data?.message || 'Failed to update container type');
    }
  }, [updateContainer, clearCache]);

  const handleDelete = useCallback(() => {
    if (deletingContainerTypes.length > 0) {
      const ids = deletingContainerTypes.map((ct) => ct.id);
      bulkDeleteContainers.mutate(ids, {
        onSuccess: (res) => {
          clearCache('containers');
          toast.success(res?.message || 'Container types deleted successfully');
          setIsDeleteModalOpen(false);
          setDeletingContainerType(null);
          setDeletingContainerTypes([]);
        },
        onError: (error) => {
          console.error('Bulk delete error:', error);
          toast.error(error.response?.data?.message || 'Failed to delete container types');
        },
      });
    } else if (deletingContainerType) {
      deleteContainer.mutate(deletingContainerType.id, {
        onSuccess: () => {
          clearCache('containers');
          toast.success('Container type deleted successfully');
          setIsDeleteModalOpen(false);
          setDeletingContainerType(null);
          setDeletingContainerTypes([]);
        },
        onError: (error) => {
          console.error('Delete container type error:', error);
          toast.error(error.response?.data?.message || 'Failed to delete container type');
        },
      });
    } else {
      setIsDeleteModalOpen(false);
      setDeletingContainerType(null);
      setDeletingContainerTypes([]);
    }
  }, [deleteContainer, bulkDeleteContainers, deletingContainerType, deletingContainerTypes, clearCache]);

  const handleEditClick = useCallback((containerType) => {
    setUpdatingContainerType(containerType);
    setIsUpdateModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((containerTypeOrContainerTypes) => {
    if (Array.isArray(containerTypeOrContainerTypes)) {
      setDeletingContainerTypes(containerTypeOrContainerTypes);
      setDeletingContainerType(null);
    } else {
      setDeletingContainerType(containerTypeOrContainerTypes);
      setDeletingContainerTypes([]);
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
          <p>Failed to load container types. Please try again.</p>
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
            <h1 className="page-title">Container Type Management</h1>
            <p className="page-subtitle">Manage your container types and their specifications</p>
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
              placeholder="Search container types"
            />
          }
          actions={
            <div className="page-actions">
              <button 
                onClick={() => setIsAddModalOpen(true)} 
                className="page-btn-primary"
                disabled={createContainer.isPending}
              >
                <Plus className="page-btn-icon" />
                Add Container Type
              </button>
            </div>
          }
        >
          <ContainerTypeTable
            data={containerTypes}
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
      <AddContainerType
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
        isLoading={createContainer.isPending}
      />

      <UpdateContainerType
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdatingContainerType(null);
        }}
        onUpdate={handleUpdate}
        containerType={updatingContainerType}
        isLoading={updateContainer.isPending}
      />

      <DeleteContainerType
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingContainerType(null);
          setDeletingContainerTypes([]);
        }}
        onDelete={handleDelete}
        containerType={deletingContainerType}
        containerTypes={deletingContainerTypes}
        isLoading={deleteContainer.isPending || bulkDeleteContainers.isPending}
      />
    </div>
  );
};

export default ContainerType;