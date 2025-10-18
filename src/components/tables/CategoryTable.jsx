// components/tables/CategoryTable.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from '../ui/DataTable';
import BulkActionBar from '../ui/BulkActionBar';
import { ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, toUpperCase } from '../../utils/formatters';

const CategoryTable = ({
  data,
  onEdit,
  onDelete,
  onSortChange,
  sortField = 'id',
  sortDirection = 'asc',
  isLoading = false,
}) => {
  const [selected, setSelected] = useState([]);

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

  const handleBulkDelete = useCallback(async () => {
    if (!confirm(`Delete ${selected.length} selected categories?`)) return;
    try {
      await Promise.all(selected.map((id) => onDelete(id)));
      setSelected([]);
    } catch (err) {
      toast.error(err.message || 'Failed to delete categories');
    }
  }, [selected, onDelete]);

  const handleBulkEdit = useCallback(() => {
    if (selected.length === 1) {
      const item = data.find((d) => d.id === selected[0]);
      onEdit(item);
    } else {
      toast.error('Please select only one category to edit');
    }
  }, [selected, data, onEdit]);

  const handleBulkCancel = useCallback(() => {
    setSelected([]);
  }, []);

  const handleSort = useCallback((field) => {
    if (!onSortChange) return;
    const newDirection =
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newDirection);
  }, [sortField, sortDirection, onSortChange]);

  const getSortIcon = useCallback((field) => {
    if (sortField !== field) {
      return <ChevronUp className="w-3 h-3 text-gray-400 opacity-50" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-3 h-3 text-primary" /> : 
      <ChevronDown className="w-3 h-3 text-primary" />;
  }, [sortField, sortDirection]);

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={allSelected}
              onChange={toggleSelectAll}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={selected.includes(row.original.id)}
              onChange={() => toggleSelect(row.original.id)}
            />
          </div>
        ),
        meta: {
          headerClassName: 'w-12',
          cellClassName: 'w-12',
        },
      },
      {
        accessorKey: 'id',
        header: () => (
          <button 
            onClick={() => handleSort('id')} 
            className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
          >
            ID
            {getSortIcon('id')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-mono text-sm">{getValue()}</span>
        ),
        meta: {
          cellClassName: 'text-center',
        },
      },
      {
        accessorKey: 'name',
        header: () => (
          <button 
            onClick={() => handleSort('name')} 
            className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
          >
            NAME
            {getSortIcon('name')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-semibold">{toUpperCase(getValue())}</span>
        ),
      },
      {
        accessorKey: 'base_rate',
        header: () => (
          <button 
            onClick={() => handleSort('base_rate')} 
            className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
          >
            BASE RATE
            {getSortIcon('base_rate')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-semibold text-success">
            {formatCurrency(getValue())}
          </span>
        ),
      },
      // REMOVED ACTIONS COLUMN
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
      
      {/* Bulk Action Bar */}
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