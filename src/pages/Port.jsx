import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Plus, Filter } from 'lucide-react';
import api from '../api';
import TableLayout from '../components/layout/TableLayout';
import PortTable from '../components/tables/PortTable';
import AddPort from '../components/modals/AddPort';
import DeletePort from '../components/modals/DeletePort';
import UpdatePort from '../components/modals/UpdatePort';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';

const Port = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deletingPort, setDeletingPort] = useState(null);
  const [deletingPorts, setDeletingPorts] = useState(null);
  const [updatingPort, setUpdatingPort] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');

  const queryClient = useQueryClient();

  // Fetch ports
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ports', debouncedSearch, page],
    queryFn: async () => {
      const res = await api.get('/ports', {
        params: { search: debouncedSearch, page, per_page: 10 },
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
  });

  // Client-side sorting
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

  // Mutations
  const addMutation = useMutation({
    mutationFn: async (portData) => (await api.post('/ports', portData)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ports'] });
      toast.success('Port added successfully');
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add port');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, portData }) =>
      (await api.put(`/ports/${id}`, portData)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ports'] });
      toast.success('Port updated successfully');
      setIsUpdateModalOpen(false);
      setUpdatingPort(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update port');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (port) => (await api.delete(`/ports/${port.id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ports'] });
      toast.success('Port deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingPort(null);
      setDeletingPorts(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete port');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (portIds) => 
      (await api.post('/ports/bulk-delete', { ids: portIds })).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ports'] });
      toast.success(data.message || 'Ports deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingPort(null);
      setDeletingPorts(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete ports');
    },
  });

  // Handlers
  const handleAdd = useCallback(
    (portData) => addMutation.mutate(portData),
    [addMutation]
  );

  const handleUpdate = useCallback(
    (id, portData) => updateMutation.mutate({ id, portData }),
    [updateMutation]
  );

  const handleEditClick = useCallback((port) => {
    setUpdatingPort(port);
    setIsUpdateModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback(
    (portOrPorts) => {
      if (Array.isArray(portOrPorts)) {
        setDeletingPorts(portOrPorts);
        setDeletingPort(null);
        setIsDeleteModalOpen(true);
      } else {
        setDeletingPort(portOrPorts);
        setDeletingPorts(null);
        setIsDeleteModalOpen(true);
      }
    },
    []
  );

  const handleDelete = useCallback(() => {
    if (deletingPorts) {
      const portIds = deletingPorts.map((port) => port.id);
      bulkDeleteMutation.mutate(portIds);
    } else if (deletingPort) {
      deleteMutation.mutate(deletingPort);
    }
  }, [deleteMutation, bulkDeleteMutation, deletingPort, deletingPorts]);

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
          Failed to load ports. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Port Management</h1>
        <p className="page-subtitle">Manage your shipping ports and their locations</p>
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
              >
                <Plus className="page-btn-icon" />
                Add Port
              </button>
              <button className="page-btn-secondary">
                <Filter className="page-btn-icon" />
                Filter
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

      <AddPort
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
        isLoading={addMutation.isPending}
      />

      <UpdatePort
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdatingPort(null);
        }}
        onUpdate={handleUpdate}
        port={updatingPort}
        isLoading={updateMutation.isPending}
      />

      <DeletePort
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingPort(null);
          setDeletingPorts(null);
        }}
        onDelete={handleDelete}
        port={deletingPort}
        ports={deletingPorts}
        isLoading={deleteMutation.isPending || bulkDeleteMutation.isPending}
      />
    </div>
  );
};

export default Port;