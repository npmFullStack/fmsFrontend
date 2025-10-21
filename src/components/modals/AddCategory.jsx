// src/components/modals/AddCategory.jsx
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
    <SharedModal isOpen={isOpen} onClose={onClose} title="Add Category" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-content mb-2">
            Name
          </label>
          <input
            type="text"
            placeholder="Type category name"
            className="w-full px-4 py-2.5 bg-surface border border-main rounded-lg text-content placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            {...register('name')}
          />
          {errors.name && <span className="text-red-400 text-sm mt-1 block">{errors.name.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-content mb-2">
            Price
          </label>
          <input
            type="text"
            placeholder="₱0.00"
            className="w-full px-4 py-2.5 bg-surface border border-main rounded-lg text-content placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            {...register('base_rate')}
          />
          {errors.base_rate && <span className="text-red-400 text-sm mt-1 block">{errors.base_rate.message}</span>}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2.5 bg-surface hover-surface border border-main text-content rounded-lg transition-colors font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 min-w-[100px] justify-center" 
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Add'
            )}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default AddCategory;