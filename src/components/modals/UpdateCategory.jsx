import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit } from 'lucide-react';
import SharedModal from '../ui/SharedModal';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  base_rate: z.string().min(1, 'Base rate is required').regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number'),
});

const UpdateCategory = ({ 
  isOpen, 
  onClose, 
  onUpdate, 
  category,
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
    if (category) {
      setValue('name', category.name);
      setValue('base_rate', category.base_rate.toString());
    } else {
      reset();
    }
  }, [category, reset, setValue]);

  const onSubmit = (data) => {
    console.log('Update form submitted with data:', data);
    const categoryData = {
      ...data,
      base_rate: parseFloat(data.base_rate)
    };
    console.log('Sending to onUpdate:', categoryData);
    onUpdate(category.id, categoryData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!category) return null;

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Category"
      size="sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <Edit className="w-5 h-5 text-primary" />
        <p className="text-base-content/70">
          Editing: <span className="font-semibold text-base-content">{category.name}</span>
        </p>
      </div>

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

        <div className="modal-action mt-6">
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
            {isLoading ? 'Updating...' : 'Update Category'}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default UpdateCategory;