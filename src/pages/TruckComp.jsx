import React, { useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

import { useTruckComp } from '../hooks/useTruckComp';
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
  const [deletingTruckComps, setDeletingTruckComps] = useState(null);
  const [updatingTruckComp, setUpdatingTruckComp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');

  const {
    truckCompsQuery,
    createTruckComp,
    updateTruckComp,
    deleteTruckComp,
    bulkDeleteTruckComps,
  } = useTruckComp();

  const { data, isLoading, isError } = truckCompsQuery({
    search: debouncedSearch,
    page,
    per_page: 10, 
    sort,
    direction
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

  const handleAdd = useCallback(
    async (truckCompData) => {
      try {
        await createTruckComp.mutateAsync(truckCompData);
        toast.success('Truck company added successfully');
        setIsAddModalOpen(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to add truck company');
      }
    },
    [createTruckComp]
  );

  const handleUpdate = useCallback(
    async (id, truckCompData) => {
      try {
        await updateTruckComp.mutateAsync({ id, ...truckCompData });
        toast.success('Truck company updated successfully');
        setIsUpdateModalOpen(false);
        setUpdatingTruckComp(null);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update truck company');
      }
    },
    [updateTruckComp]
  );

  const handleDelete = useCallback(() => {
    if (deletingTruckComps) {
      const ids = deletingTruckComps.map((tc) => tc.id);
      bulkDeleteTruckComps.mutate(ids, {
        onSuccess: (res) => toast.success(res?.message || 'Truck companies deleted'),
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete'),
      });
    } else if (deletingTruckComp) {
      deleteTruckComp.mutate(deletingTruckComp.id, {
        onSuccess: () => toast.success('Truck company deleted'),
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete'),
      });
    }
    setIsDeleteModalOpen(false);
    setDeletingTruckComp(null);
    setDeletingTruckComps(null);
  }, [deleteTruckComp, bulkDeleteTruckComps, deletingTruckComp, deletingTruckComps]);

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
      setDeletingTruckComps(null);
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
        <div className="page-error-content">Failed to load truck companies.</div>
      </div>
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Truck Company Management</h1>
        <p className="page-subtitle">Manage your truck companies and their information</p>
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
              <button onClick={() => setIsAddModalOpen(true)} className="page-btn-primary">
                <Plus className="page-btn-icon" /> Add Truck Company
              </button>
              <button className="page-btn-secondary">
                <Filter className="page-btn-icon" /> Filter
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

      <AddTruckComp isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAdd} isLoading={createTruckComp.isPending} />

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
          setDeletingTruckComps(null);
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
