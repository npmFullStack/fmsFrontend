// src/components/modals/AddCategory.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SharedModal from '../ui/SharedModal';
import toast from 'react-hot-toast';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  base_rate: z.string().min(1, 'Base rate is required').regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number'),
});

const AddCategory = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingCategory,
  isLoading = false 
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(categorySchema)
  });

  useEffect(() => {
    if (editingCategory) {
      setValue('name', editingCategory.name);
      setValue('base_rate', editingCategory.base_rate.toString());
    } else {
      reset();
    }
  }, [editingCategory, reset, setValue]);

  const onSubmit = async (data) => {
    try {
      await onSave({
        ...data,
        base_rate: parseFloat(data.base_rate)
      });
      toast.success(editingCategory ? 'Category updated successfully' : 'Category added successfully');
      reset();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingCategory ? 'Edit Category' : 'Add New Category'}
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Category Name</span>
          </label>
          <input
            type="text"
            placeholder="Enter category name"
            className="input input-bordered w-full"
            {...register('name')}
          />
          {errors.name && (
            <span className="text-error text-sm mt-1">{errors.name.message}</span>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Base Rate (₱)</span>
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="input input-bordered w-full"
            {...register('base_rate')}
          />
          {errors.base_rate && (
            <span className="text-error text-sm mt-1">{errors.base_rate.message}</span>
          )}
        </div>

        <div className="modal-action">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-ghost"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : editingCategory ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default AddCategory;