// src/components/tables/CategoryTable.jsx
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import SharedTable from '../ui/SharedTable';
import toast from 'react-hot-toast';

const CategoryTable = ({ 
  data, 
  onEdit, 
  onDelete, 
  isLoading = false 
}) => {
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      await onDelete(id);
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const columns = [
    {
      key: 'index',
      header: '#',
      headerClassName: 'w-12',
      cellClassName: 'text-center',
      render: (_, index) => index + 1
    },
    {
      key: 'name',
      header: 'Name',
      headerClassName: 'font-semibold'
    },
    {
      key: 'base_rate',
      header: 'Base Rate',
      headerClassName: 'font-semibold',
      render: (item) => `₱${item.base_rate}`
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-center',
      cellClassName: 'text-center space-x-2',
      render: (item, index) => (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => onEdit(item)}
            className="btn btn-warning btn-sm"
            title="Edit category"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id, item.name)}
            className="btn btn-error btn-sm"
            title="Delete category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <SharedTable
      columns={columns}
      data={data.map((item, index) => ({ ...item, index }))}
      isLoading={isLoading}
      emptyMessage="No categories found. Add your first category above."
      zebra={true}
    />
  );
};

export default CategoryTable;