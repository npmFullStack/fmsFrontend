import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { useTruckComp } from '../hooks/useTruckComp';
import { useOptimizedApi } from '../hooks/useOptimizedApi';
import TableLayout from '../components/layout/TableLayout';
import TruckCompTable from '../components/tables/TruckCompTable';
import AddTruckComp from '../components/modals/AddTruckComp';
import UpdateTruckComp from '../components/modals/UpdateTruckComp';
import DeleteTruckComp from '../components/modals/DeleteTruckComp';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const TruckComp = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deletingTruckComp, setDeletingTruckComp] = useState(null);
  const [deletingTruckComps, setDeletingTruckComps] = useState([]);
  const [updatingTruckComp, setUpdatingTruckComp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');
  const [forceRefresh, setForceRefresh] = useState(0);

  // Optimized API hook
  const { optimizedRequest, cancelRequest, clearCache } = useOptimizedApi();

  const {
    truckCompsQuery,
    createTruckComp,
    updateTruckComp,
    deleteTruckComp,
    bulkDeleteTruckComps,
  } = useTruckComp();

  const { data, isLoading, isError, refetch } = truckCompsQuery({
    search: debouncedSearch,
    page,
    per_page: 10, 
    sort,
    direction,
    _refresh: forceRefresh // Add refresh trigger
  });

  const sortedTruckComps = useMemo(() => {
    if (!data?.data) return [];
    return [...data.data].sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      return direction === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });
  }, [data?.data, sort, direction]);

  const truckComps = sortedTruckComps;
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
    clearCache('truck_comps'); // Clear cache for fresh data
    setForceRefresh(prev => prev + 1);
    toast.success('Data refreshed');
  }, [clearCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest('truck_comps');
    };
  }, [cancelRequest]);

  const handleAdd = useCallback(
    async (truckCompData) => {
      try {
        await createTruckComp.mutateAsync(truckCompData);
        
        // Clear cache after successful creation
        clearCache('truck_comps');
        toast.success('Truck company added successfully');
        setIsAddModalOpen(false);
      } catch (error) {
        console.error('Add truck company error:', error);
        toast.error(error.response?.data?.message || 'Failed to add truck company');
      }
    },
    [createTruckComp, clearCache]
  );

  const handleUpdate = useCallback(
    async (id, truckCompData) => {
      try {
        await updateTruckComp.mutateAsync({ 
          id, 
          ...truckCompData 
        });
        
        // Clear cache after successful update
        clearCache('truck_comps');
        toast.success('Truck company updated successfully');
        setIsUpdateModalOpen(false);
        setUpdatingTruckComp(null);
      } catch (error) {
        console.error('Update truck company error:', error);
        toast.error(error.response?.data?.message || 'Failed to update truck company');
      }
    },
    [updateTruckComp, clearCache]
  );

  const handleDelete = useCallback(() => {
    if (deletingTruckComps.length > 0) {
      const ids = deletingTruckComps.map((tc) => tc.id);
      bulkDeleteTruckComps.mutate(ids, {
        onSuccess: (res) => {
          clearCache('truck_comps');
          toast.success(res?.message || 'Truck companies deleted successfully');
          setIsDeleteModalOpen(false);
          setDeletingTruckComp(null);
          setDeletingTruckComps([]);
        },
        onError: (error) => {
          console.error('Bulk delete error:', error);
          toast.error(error.response?.data?.message || 'Failed to delete truck companies');
        },
      });
    } else if (deletingTruckComp) {
      deleteTruckComp.mutate(deletingTruckComp.id, {
        onSuccess: () => {
          clearCache('truck_comps');
          toast.success('Truck company deleted successfully');
          setIsDeleteModalOpen(false);
          setDeletingTruckComp(null);
          setDeletingTruckComps([]);
        },
        onError: (error) => {
          console.error('Delete truck company error:', error);
          toast.error(error.response?.data?.message || 'Failed to delete truck company');
        },
      });
    } else {
      setIsDeleteModalOpen(false);
      setDeletingTruckComp(null);
      setDeletingTruckComps([]);
    }
  }, [deleteTruckComp, bulkDeleteTruckComps, deletingTruckComp, deletingTruckComps, clearCache]);

  const handleEditClick = useCallback((truckComp) => {
    setUpdatingTruckComp(truckComp);
    setIsUpdateModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((truckCompOrTruckComps) => {
    if (Array.isArray(truckCompOrTruckComps)) {
      setDeletingTruckComps(truckCompOrTruckComps);
      setDeletingTruckComp(null);
    } else {
      setDeletingTruckComp(truckCompOrTruckComps);
      setDeletingTruckComps([]);
    }
    setIsDeleteModalOpen(true);
  }, []);

  if (isLoading && !data)
    return (
      <div className="page-loading">
        <div className="page-loading-spinner"></div>
      </div>
    );

  if (isError)
    return (
      <div className="page-error">
        <div className="page-error-content">
          <p>Failed to load truck companies. Please try again.</p>
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">Truck Company Management</h1>
            <p className="page-subtitle">Manage your truck companies and their information</p>
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

      <div className="page-table-section">
        <TableLayout
          searchBar={
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search truck companies"
            />
          }
          actions={
            <div className="page-actions">
              <button 
                onClick={() => setIsAddModalOpen(true)} 
                className="page-btn-primary"
                disabled={createTruckComp.isPending}
              >
                <Plus className="page-btn-icon" /> Add Truck Company
              </button>
            </div>
          }
        >
          <TruckCompTable
            data={truckComps}
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
          <Pagination currentPage={pagination.current_page} totalPages={pagination.last_page} onPageChange={setPage} />
        </div>
      )}

      <AddTruckComp 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAdd} 
        isLoading={createTruckComp.isPending} 
      />

      <UpdateTruckComp
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdatingTruckComp(null);
        }}
        onUpdate={handleUpdate}
        truckComp={updatingTruckComp}
        isLoading={updateTruckComp.isPending}
      />

      <DeleteTruckComp
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTruckComp(null);
          setDeletingTruckComps([]);
        }}
        onDelete={handleDelete}
        truckComp={deletingTruckComp}
        truckComps={deletingTruckComps}
        isLoading={deleteTruckComp.isPending || bulkDeleteTruckComps.isPending}
      />
    </div>
  );
};

export default TruckComp;