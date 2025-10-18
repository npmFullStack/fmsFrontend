// components/tables/CategoryTable.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from '../ui/DataTable';
import BulkActionBar from '../ui/BulkActionBar';
import { ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, toUpperCase } from '../../utils/formatters';

const CategoryTable = ({
  data,
  onEdit,
  onDelete,
  onSortChange,
  sortField = 'id',
  sortDirection = 'asc',
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
    }
  }, [selected, data, onEdit]);

  const handleSort = useCallback((field) => {
    if (!onSortChange) return;
    const newDirection =
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newDirection);
  }, [sortField, sortDirection, onSortChange]);

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
          <button onClick={() => handleSort('id')} className="table-sort-btn">
            ID
            <ArrowUpDown
              className={`w-3 h-3 ${
                sortField === 'id' ? 'text-primary' : 'text-gray-400'
              }`}
            />
          </button>
        ),
        cell: ({ getValue }) => getValue(),
        meta: {
          cellClassName: 'text-center',
        },
      },
      {
        accessorKey: 'name',
        header: () => (
          <button onClick={() => handleSort('name')} className="table-sort-btn">
            Name
            <ArrowUpDown
              className={`w-3 h-3 ${
                sortField === 'name' ? 'text-primary' : 'text-gray-400'
              }`}
            />
          </button>
        ),
        cell: ({ getValue }) => toUpperCase(getValue()),
      },
      {
        accessorKey: 'base_rate',
        header: () => (
          <button onClick={() => handleSort('base_rate')} className="table-sort-btn">
            Base Rate
            <ArrowUpDown
              className={`w-3 h-3 ${
                sortField === 'base_rate' ? 'text-primary' : 'text-gray-400'
              }`}
            />
          </button>
        ),
        cell: ({ getValue }) => formatCurrency(getValue()),
      },
    ],
    [selected, allSelected, sortField, sortDirection, toggleSelectAll, toggleSelect, handleSort]
  );

  return (
    <div className="relative">
      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No categories found. Add your first category above."
      />
      <BulkActionBar
        selectedCount={selected.length}
        onEdit={handleBulkEdit}
        onDelete={handleBulkDelete}
        onCancel={() => setSelected([])}
        disableEdit={selected.length !== 1}
      />
    </div>
  );
};

export default CategoryTable;