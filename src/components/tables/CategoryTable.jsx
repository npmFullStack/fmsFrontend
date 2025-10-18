import React, { useState, useEffect, useMemo } from 'react';
import SharedTable from '../ui/SharedTable';
import BulkActionBar from '../ui/BulkActionBar';
import toast from 'react-hot-toast';

const CategoryTable = ({ data, onEdit, onDelete, isLoading = false }) => {
  const [selected, setSelected] = useState([]);

  // 🧹 Reset selection when data changes
  useEffect(() => setSelected([]), [data]);

  const allSelected = selected.length === data.length && data.length > 0;

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );

  const toggleSelectAll = () =>
    setSelected(allSelected ? [] : data.map((item) => item.id));

  /** 🔹 Delete multiple categories */
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} selected categories?`)) return;
    try {
      await Promise.all(selected.map((id) => onDelete(id)));
      toast.success(`${selected.length} categories deleted`);
      setSelected([]);
    } catch (err) {
      toast.error(err.message || 'Failed to delete categories');
    }
  };

  /** 🔹 Edit one selected category */
  const handleBulkEdit = () => {
    if (selected.length === 1) {
      const item = data.find((d) => d.id === selected[0]);
      onEdit(item);
    }
  };

  /** 🔹 Table columns (no "Actions" column) */
  const columns = useMemo(
    () => [
      {
        key: 'select',
        header: (
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={allSelected}
            onChange={toggleSelectAll}
          />
        ),
        cellClassName: 'text-center',
        render: (item) => (
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={selected.includes(item.id)}
            onChange={() => toggleSelect(item.id)}
          />
        ),
      },
      {
        key: 'index',
        header: '#',
        headerClassName: 'w-12 text-center',
        cellClassName: 'text-center',
        render: (_, index) => index + 1,
      },
      {
        key: 'name',
        header: 'Name',
        headerClassName: 'font-semibold',
      },
      {
        key: 'base_rate',
        header: 'Base Rate',
        headerClassName: 'font-semibold',
        render: (item) => `₱${item.base_rate}`,
      },
    ],
    [selected, allSelected]
  );

  return (
    <div className="relative">
      <SharedTable
        columns={columns}
        data={data.map((item, index) => ({ ...item, index }))}
        isLoading={isLoading}
        emptyMessage="No categories found. Add your first category above."
        zebra
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
