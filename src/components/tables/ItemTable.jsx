import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from '../ui/DataTable';
import BulkActionBar from '../ui/BulkActionBar';
import DeleteItem from '../modals/DeleteItem';
import { ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, toUpperCase } from '../../utils/formatters';

// Category color generator (theme-matching palette)
const getCategoryColor = (categoryName = '') => {
  const colorVariants = [
    'bg-blue-600 border-blue-700 text-white',
    'bg-emerald-600 border-emerald-700 text-white',
    'bg-amber-500 border-amber-600 text-white',
    'bg-violet-600 border-violet-700 text-white',
    'bg-pink-600 border-pink-700 text-white',
    'bg-orange-500 border-orange-600 text-white',
    'bg-teal-600 border-teal-700 text-white',
    'bg-rose-600 border-rose-700 text-white',
  ];
  const index = categoryName.charCodeAt(0) % colorVariants.length;
  return colorVariants[index];
};

const ItemTable = ({
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
  const [deletingItems, setDeletingItems] = useState([]);

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
    const itemsToDelete = data.filter((item) => selected.includes(item.id));
    setDeletingItems(itemsToDelete);
    setDeleteModalOpen(true);
  }, [selected, data]);

  const handleConfirmDelete = useCallback(() => {
    onDelete(deletingItems);
    setDeleteModalOpen(false);
    setDeletingItems([]);
  }, [deletingItems, onDelete]);

  const handleBulkEdit = useCallback(() => {
    if (selected.length === 1) {
      const itemToEdit = data.find((item) => item.id === selected[0]);
      if (itemToEdit && onEdit) onEdit(itemToEdit);
    } else {
      toast.error('Please select only one item to edit');
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
          <span className="table-cell-monospace table-cell-content">{getValue()}</span>
        ),
        meta: { cellClassName: 'table-cell-center' },
      },
      {
        accessorKey: 'name',
        header: () => (
          <button onClick={() => handleSort('name')} className="table-header-button">
            ITEM {getSortIcon('name')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="table-cell-heading">{toUpperCase(getValue())}</span>
        ),
      },
      {
        accessorKey: 'category.name',
        header: () => (
          <button
            onClick={() => handleSort('category_id')}
            className="table-header-button"
          >
            CATEGORY {getSortIcon('category_id')}
          </button>
        ),
        cell: ({ row }) => {
          const category = row.original.category?.name || 'Uncategorized';
          const badgeColor = getCategoryColor(category);
          return (
            <span
              className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border shadow-sm ${badgeColor}`}
            >
              {category}
            </span>
          );
        },
      },
      {
        accessorKey: 'weight',
        header: () => (
          <button onClick={() => handleSort('weight')} className="table-header-button">
            WEIGHT (kg) {getSortIcon('weight')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium text-emerald-500">{getValue()} kg</span>
        ),
      },
      {
        accessorKey: 'base_price',
        header: () => (
          <button
            onClick={() => handleSort('base_price')}
            className="table-header-button"
          >
            BASE PRICE {getSortIcon('base_price')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium text-amber-500">
            {formatCurrency(getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'calculated_price',
        header: () => (
          <button
            onClick={() => handleSort('calculated_price')}
            className="table-header-button"
          >
            TOTAL PRICE {getSortIcon('calculated_price')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-bold text-blue-500">
            {formatCurrency(getValue())}
          </span>
        ),
      },
    ],
    [
      selected,
      allSelected,
      sortField,
      sortDirection,
      toggleSelectAll,
      toggleSelect,
      handleSort,
      getSortIcon,
    ]
  );

  return (
    <div className="table-container">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage="No items found. Add your first item above."
      />

      <DeleteItem
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingItems([]);
        }}
        onDelete={handleConfirmDelete}
        item={deletingItems.length === 1 ? deletingItems[0] : null}
        items={deletingItems.length > 1 ? deletingItems : null}
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

export default ItemTable;
