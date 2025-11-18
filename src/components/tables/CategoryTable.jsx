// src/components/tables/CategoryTable
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from '../ui/DataTable';
import BulkActionBar from '../ui/BulkActionBar';
import DeleteCategory from '../modals/DeleteCategory';
import { ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { toUpperCase } from '../../utils/formatters';

const CategoryTable = ({
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
  const [deletingCategories, setDeletingCategories] = useState([]);

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
    const categoriesToDelete = data.filter((item) => selected.includes(item.id));
    setDeletingCategories(categoriesToDelete);
    setDeleteModalOpen(true);
  }, [selected, data]);

  const handleConfirmDelete = useCallback(async () => {
    try {
      onDelete(deletingCategories);
      setDeleteModalOpen(false);
      setDeletingCategories([]);
    } catch (err) {
      toast.error(err.message || 'Failed to delete categories');
    }
  }, [deletingCategories, onDelete]);

  const handleBulkEdit = useCallback(() => {
    if (selected.length === 1) {
      const categoryToEdit = data.find((item) => item.id === selected[0]);
      if (categoryToEdit && onEdit) {
        onEdit(categoryToEdit);
      }
    } else {
      toast.error('Please select only one category to edit');
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
          <span className="table-cell-monospace table-cell-content">
            {getValue()}
          </span>
        ),
        meta: { cellClassName: 'table-cell-center' },
      },
      {
        accessorKey: 'name',
        header: () => (
          <button onClick={() => handleSort('name')} className="table-header-button">
            CATEGORY {getSortIcon('name')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="table-cell-heading">{toUpperCase(getValue())}</span>
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
        emptyMessage="No categories found. Add your first category above."
      />

      <DeleteCategory
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingCategories([]);
        }}
        onDelete={handleConfirmDelete}
        category={deletingCategories.length === 1 ? deletingCategories[0] : null}
        categories={deletingCategories.length > 1 ? deletingCategories : null}
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

export default CategoryTable;
