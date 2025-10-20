// components/modals/AddCategory.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SharedModal from '../ui/SharedModal';
import { Loader2 } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  base_rate: z.string()
    .min(1, 'Base rate is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number'),
});

const AddCategory = ({ isOpen, onClose, onSave, isLoading = false }) => {
  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = (data) => {
    onSave({ ...data, base_rate: parseFloat(data.base_rate) });
  };

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title="Add New Category" size="sm">
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
          {errors.name && <span className="text-error text-sm mt-1">{errors.name.message}</span>}
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
          {errors.base_rate && <span className="text-error text-sm mt-1">{errors.base_rate.message}</span>}
        </div>

        <div className="modal-action mt-6">
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-ghost" 
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary gap-2 min-w-[120px]" 
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Add Category'
            )}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default AddCategory;