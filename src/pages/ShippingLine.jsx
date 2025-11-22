// src/pages/ShippingLine.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

import { useShippingLine } from '../hooks/useShippingLine';
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
  const [deletingShippingLines, setDeletingShippingLines] = useState(null);
  const [updatingShippingLine, setUpdatingShippingLine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');

  // ✅ useShippingLine hook handles everything
  const {
    shippingLinesQuery,
    createShippingLine,
    updateShippingLine,
    deleteShippingLine,
    bulkDeleteShippingLines,
  } = useShippingLine();

  // ✅ Fetch shipping lines (server-side pagination & search)
  // ✅ Call the query with parameters
const { data, isLoading, isError } = shippingLinesQuery({
  search: debouncedSearch,
  page,
  per_page: 10,
  sort,
  direction
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

  /* =========================
   * CRUD ACTIONS
   * ========================= */
  const handleAdd = useCallback(
    async (shippingLineData) => {
      try {
        await createShippingLine.mutateAsync(shippingLineData);
        toast.success('Shipping line added successfully');
        setIsAddModalOpen(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to add shipping line');
      }
    },
    [createShippingLine]
  );

  const handleUpdate = useCallback(
    async (id, shippingLineData) => {
      try {
        await updateShippingLine.mutateAsync({ id, ...shippingLineData });
        toast.success('Shipping line updated successfully');
        setIsUpdateModalOpen(false);
        setUpdatingShippingLine(null);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update shipping line');
      }
    },
    [updateShippingLine]
  );

  const handleDelete = useCallback(() => {
    if (deletingShippingLines) {
      const ids = deletingShippingLines.map((sl) => sl.id);
      bulkDeleteShippingLines.mutate(ids, {
        onSuccess: (res) => {
          toast.success(res?.message || 'Shipping lines deleted successfully');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to delete shipping lines');
        },
      });
    } else if (deletingShippingLine) {
      deleteShippingLine.mutate(deletingShippingLine.id, {
        onSuccess: () => {
          toast.success('Shipping line deleted successfully');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to delete shipping line');
        },
      });
    }
    setIsDeleteModalOpen(false);
    setDeletingShippingLine(null);
    setDeletingShippingLines(null);
  }, [deleteShippingLine, bulkDeleteShippingLines, deletingShippingLine, deletingShippingLines]);

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
      setDeletingShippingLines(null);
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
          Failed to load shipping lines. Please try again.
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
        <h1 className="page-title">Shipping Line Management</h1>
        <p className="page-subtitle">Manage your shipping lines and their information</p>
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
              <button onClick={() => setIsAddModalOpen(true)} className="page-btn-primary">
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
          setDeletingShippingLines(null);
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