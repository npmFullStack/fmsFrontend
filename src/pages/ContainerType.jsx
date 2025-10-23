import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Plus, Filter } from 'lucide-react';
import api from '../api';
import TableLayout from '../components/layout/TableLayout';
import ContainerTypeTable from '../components/tables/ContainerTypeTable';
import AddContainerType from '../components/modals/AddContainerType';
import DeleteContainerType from '../components/modals/DeleteContainerType';
import UpdateContainerType from '../components/modals/UpdateContainerType';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';

const ContainerType = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deletingContainerType, setDeletingContainerType] = useState(null);
  const [deletingContainerTypes, setDeletingContainerTypes] = useState(null);
  const [updatingContainerType, setUpdatingContainerType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');

  const queryClient = useQueryClient();

  // Fetch container types
  const { data, isLoading, isError } = useQuery({
    queryKey: ['containerTypes', debouncedSearch, page],
    queryFn: async () => {
      const res = await api.get('/container-types', {
        params: { search: debouncedSearch, page, per_page: 10 },
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
  });

  // Client-side sorting
  const sortedContainerTypes = useMemo(() => {
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

  // Mutations
  const addMutation = useMutation({
    mutationFn: async (containerTypeData) => (await api.post('/container-types', containerTypeData)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containerTypes'] });
      toast.success('Container type added successfully');
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add container type');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, containerTypeData }) =>
      (await api.put(`/container-types/${id}`, containerTypeData)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containerTypes'] });
      toast.success('Container type updated successfully');
      setIsUpdateModalOpen(false);
      setUpdatingContainerType(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update container type');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (containerType) => (await api.delete(`/container-types/${containerType.id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containerTypes'] });
      toast.success('Container type deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingContainerType(null);
      setDeletingContainerTypes(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete container type');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (containerTypeIds) => 
      (await api.post('/container-types/bulk-delete', { ids: containerTypeIds })).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['containerTypes'] });
      toast.success(data.message || 'Container types deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingContainerType(null);
      setDeletingContainerTypes(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete container types');
    },
  });

  // Handlers
  const handleAdd = useCallback(
    (containerTypeData) => addMutation.mutate(containerTypeData),
    [addMutation]
  );

  const handleUpdate = useCallback(
    (id, containerTypeData) => updateMutation.mutate({ id, containerTypeData }),
    [updateMutation]
  );

  const handleEditClick = useCallback((containerType) => {
    setUpdatingContainerType(containerType);
    setIsUpdateModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback(
    (containerTypeOrContainerTypes) => {
      if (Array.isArray(containerTypeOrContainerTypes)) {
        setDeletingContainerTypes(containerTypeOrContainerTypes);
        setDeletingContainerType(null);
        setIsDeleteModalOpen(true);
      } else {
        setDeletingContainerType(containerTypeOrContainerTypes);
        setDeletingContainerTypes(null);
        setIsDeleteModalOpen(true);
      }
    },
    []
  );

  const handleDelete = useCallback(() => {
    if (deletingContainerTypes) {
      const containerTypeIds = deletingContainerTypes.map((ct) => ct.id);
      bulkDeleteMutation.mutate(containerTypeIds);
    } else if (deletingContainerType) {
      deleteMutation.mutate(deletingContainerType);
    }
  }, [deleteMutation, bulkDeleteMutation, deletingContainerType, deletingContainerTypes]);

  // Loading & error states
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
          Failed to load container types. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Container Type Management</h1>
        <p className="page-subtitle">Manage your container types and their specifications</p>
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
              >
                <Plus className="page-btn-icon" />
                Add Container Type
              </button>
              <button className="page-btn-secondary">
                <Filter className="page-btn-icon" />
                Filter
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

      <AddContainerType
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
        isLoading={addMutation.isPending}
      />

      <UpdateContainerType
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdatingContainerType(null);
        }}
        onUpdate={handleUpdate}
        containerType={updatingContainerType}
        isLoading={updateMutation.isPending}
      />

      <DeleteContainerType
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingContainerType(null);
          setDeletingContainerTypes(null);
        }}
        onDelete={handleDelete}
        containerType={deletingContainerType}
        containerTypes={deletingContainerTypes}
        isLoading={deleteMutation.isPending || bulkDeleteMutation.isPending}
      />
    </div>
  );
};

export default ContainerType;