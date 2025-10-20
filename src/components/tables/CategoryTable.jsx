import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from '../ui/DataTable';
import BulkActionBar from '../ui/BulkActionBar';
import DeleteCategory from '../modals/DeleteCategory';
import { ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, toUpperCase } from '../../utils/formatters';

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
    const categoriesToDelete = data.filter(item => selected.includes(item.id));
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
      const categoryToEdit = data.find(item => item.id === selected[0]);
      if (categoryToEdit && onEdit) {
        onEdit(categoryToEdit);
      }
    } else {
      toast.error('Please select only one category to edit');
    }
  }, [selected, data, onEdit]);

  const handleBulkCancel = useCallback(() => setSelected([]), []);

  const handleSort = useCallback((field) => {
    if (!onSortChange) return;
    const newDirection =
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newDirection);
  }, [sortField, sortDirection, onSortChange]);

  const getSortIcon = useCallback(
    (field) =>
      sortField !== field ? (
        <ChevronUp className="w-3 h-3 text-gray-500 opacity-50" />
      ) : sortDirection === 'asc' ? (
        <ChevronUp className="w-3 h-3 text-blue-400" />
      ) : (
        <ChevronDown className="w-3 h-3 text-blue-400" />
      ),
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
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 focus:ring-2"
              checked={allSelected}
              onChange={toggleSelectAll}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 focus:ring-2"
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
          <button
            onClick={() => handleSort('id')}
            className="flex items-center gap-2 font-medium text-gray-400 hover:text-gray-200 transition"
          >
            ID {getSortIcon('id')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-mono text-sm text-gray-300">{getValue()}</span>
        ),
        meta: { cellClassName: 'text-center' },
      },
      {
        accessorKey: 'name',
        header: () => (
          <button
            onClick={() => handleSort('name')}
            className="flex items-center gap-2 font-medium text-gray-400 hover:text-gray-200 transition"
          >
            NAME {getSortIcon('name')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-200">
            {toUpperCase(getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'base_rate',
        header: () => (
          <button
            onClick={() => handleSort('base_rate')}
            className="flex items-center gap-2 font-medium text-gray-400 hover:text-gray-200 transition"
          >
            BASE RATE {getSortIcon('base_rate')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium text-blue-400">
            {formatCurrency(getValue())}
          </span>
        ),
      },
    ],
    [selected, allSelected, sortField, sortDirection, toggleSelectAll, toggleSelect, handleSort, getSortIcon]
  );

  return (
    <div className="relative">
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