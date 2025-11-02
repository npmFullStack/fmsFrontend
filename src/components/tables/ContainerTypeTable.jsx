import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from '../ui/DataTable';
import BulkActionBar from '../ui/BulkActionBar';
import DeleteContainerType from '../modals/DeleteContainerType';
import { ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { toUpperCase } from '../../utils/formatters';

const ContainerTypeTable = ({
  data = [],
  onEdit,
  onDelete,
  onSortChange,
  sortField = 'id',
  sortDirection = 'asc',
  isLoading = false,
}) => {
  const [selected, setSelected] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingContainerTypes, setDeletingContainerTypes] = useState([]);

  useEffect(() => setSelected([]), [data]);

  const allSelected = selected.length === data.length && data.length > 0;

  const toggleSelect = useCallback((id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected(allSelected ? [] : data.map((item) => item.id));
  }, [allSelected, data]);

  const handleBulkDelete = useCallback(() => {
    if (!selected.length) return;
    const containerTypesToDelete = data.filter((item) =>
      selected.includes(item.id)
    );
    setDeletingContainerTypes(containerTypesToDelete);
    setDeleteModalOpen(true);
  }, [selected, data]);

  const handleConfirmDelete = useCallback(async () => {
    try {
      onDelete(deletingContainerTypes);
      setDeleteModalOpen(false);
      setDeletingContainerTypes([]);
    } catch (err) {
      toast.error(err.message || 'Failed to delete container types');
    }
  }, [deletingContainerTypes, onDelete]);

  const handleBulkEdit = useCallback(() => {
    if (selected.length === 1) {
      const containerTypeToEdit = data.find((item) => item.id === selected[0]);
      if (containerTypeToEdit && onEdit) {
        onEdit(containerTypeToEdit);
      }
    } else {
      toast.error('Please select only one container type to edit');
    }
  }, [selected, data, onEdit]);

  const handleBulkCancel = useCallback(() => setSelected([]), []);

  const handleSort = useCallback(
    (field) => {
      if (!onSortChange) return;
      const newDirection =
        sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
      onSortChange(field, newDirection);
    },
    [sortField, sortDirection, onSortChange]
  );

  const getSortIcon = useCallback(
    (field) => {
      const baseClass = 'table-sort-icon';
      if (sortField !== field) {
        return <ChevronUp className={`${baseClass} table-sort-inactive`} />;
      }
      return sortDirection === 'asc' ? (
        <ChevronUp className={`${baseClass} table-sort-active`} />
      ) : (
        <ChevronDown className={`${baseClass} table-sort-active`} />
      );
    },
    [sortField, sortDirection]
  );

  // ✅ Updated columns — only `id`, `size`, `max_weight`
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              className="table-checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              className="table-checkbox"
              checked={selected.includes(row.original.id)}
              onChange={() => toggleSelect(row.original.id)}
            />
          </div>
        ),
        meta: { headerClassName: 'w-12', cellClassName: 'w-12' },
      },
      {
        accessorKey: 'id',
        header: () => (
          <button onClick={() => handleSort('id')} className="table-header-button">
            ID {getSortIcon('id')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="table-cell-monospace table-cell-content">{getValue()}</span>
        ),
        meta: { cellClassName: 'table-cell-center' },
      },
      {
        accessorKey: 'size',
        header: () => (
          <button onClick={() => handleSort('size')} className="table-header-button">
            SIZE {getSortIcon('size')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="table-cell-heading">{toUpperCase(getValue())}</span>
        ),
      },
      {
        accessorKey: 'max_weight',
        header: () => (
          <button
            onClick={() => handleSort('max_weight')}
            className="table-header-button"
          >
            MAX WEIGHT {getSortIcon('max_weight')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="table-cell-content font-medium">{getValue()} kg</span>
        ),
      },
    ],
    [selected, allSelected, sortField, sortDirection, toggleSelectAll, toggleSelect, handleSort, getSortIcon]
  );

  return (
    <div className="table-container">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage="No container types found. Add your first container type above."
      />

      <DeleteContainerType
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingContainerTypes([]);
        }}
        onDelete={handleConfirmDelete}
        containerType={
          deletingContainerTypes.length === 1 ? deletingContainerTypes[0] : null
        }
        containerTypes={
          deletingContainerTypes.length > 1 ? deletingContainerTypes : null
        }
        isLoading={false}
      />

      <BulkActionBar
        selectedCount={selected.length}
        onEdit={handleBulkEdit}
        onDelete={handleBulkDelete}
        onCancel={handleBulkCancel}
        disableEdit={selected.length !== 1}
      />
    </div>
  );
};

export default ContainerTypeTable;
