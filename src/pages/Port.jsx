import React, { useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

import { usePort } from '../hooks/usePort';
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
  const [deletingPorts, setDeletingPorts] = useState(null);
  const [updatingPort, setUpdatingPort] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');

  // ✅ usePort hook handles everything
  const {
    portsQuery,
    createPort,
    updatePort,
    deletePort,
    bulkDeletePorts,
  } = usePort();

  // ✅ Fetch ports (server-side pagination & search)
  const { data, isLoading, isError } = portsQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort,
    direction
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

  /* =========================
   * CRUD ACTIONS
   * ========================= */
  const handleAdd = useCallback(
    async (portData) => {
      try {
        await createPort.mutateAsync(portData);
        toast.success('Port added successfully');
        setIsAddModalOpen(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to add port');
      }
    },
    [createPort]
  );

  const handleUpdate = useCallback(
    async (id, portData) => {
      try {
        await updatePort.mutateAsync({ id, ...portData });
        toast.success('Port updated successfully');
        setIsUpdateModalOpen(false);
        setUpdatingPort(null);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update port');
      }
    },
    [updatePort]
  );

  const handleDelete = useCallback(() => {
    if (deletingPorts) {
      const ids = deletingPorts.map((port) => port.id);
      bulkDeletePorts.mutate(ids, {
        onSuccess: (res) => {
          toast.success(res?.message || 'Ports deleted successfully');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to delete ports');
        },
      });
    } else if (deletingPort) {
      deletePort.mutate(deletingPort.id, {
        onSuccess: () => {
          toast.success('Port deleted successfully');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to delete port');
        },
      });
    }
    setIsDeleteModalOpen(false);
    setDeletingPort(null);
    setDeletingPorts(null);
  }, [deletePort, bulkDeletePorts, deletingPort, deletingPorts]);

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
      setDeletingPorts(null);
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
          Failed to load ports. Please try again.
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
          setDeletingPorts(null);
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