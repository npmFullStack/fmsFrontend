// components/modals/UpdateCategory.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit, X, Loader2 } from 'lucide-react';
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
    const categoryData = {
      ...data,
      base_rate: parseFloat(data.base_rate)
    };
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
      {/* Header with primary color */}
      <div className="flex items-center gap-3 mb-6 p-3 bg-primary bg-opacity-10 rounded-lg border border-primary border-opacity-20">
        <Edit className="w-5 h-5 text-primary" />
        <p className="text-base-content">
          Editing: <span className="font-semibold text-primary">{category.name}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold text-base-content">Category Name</span>
          </label>
          <input
            type="text"
            placeholder="Enter category name"
            className="input input-bordered w-full focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
            {...register('name')}
          />
          {errors.name && (
            <span className="text-error text-sm mt-2 flex items-center gap-1">
              {errors.name.message}
            </span>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold text-base-content">Base Rate (₱)</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="input input-bordered w-full focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
            {...register('base_rate')}
          />
          {errors.base_rate && (
            <span className="text-error text-sm mt-2 flex items-center gap-1">
              {errors.base_rate.message}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-base-300">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-ghost flex-1 gap-2 border border-base-300"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1 gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Update Category
              </>
            )}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default UpdateCategory;