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
          <label className="modal-label">
            Name
          </label>
          <input
            type="text"
            placeholder="Type category name"
            className="modal-input"
            {...register('name')}
          />
          {errors.name && <span className="modal-error">{errors.name.message}</span>}
        </div>

        <div>
          <label className="modal-label">
            Price
          </label>
          <input
            type="text"
            placeholder="₱0.00"
            className="modal-input"
            {...register('base_rate')}
          />
          {errors.base_rate && <span className="modal-error">{errors.base_rate.message}</span>}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="button" 
            onClick={onClose} 
            className={`modal-btn-cancel ${isLoading ? 'modal-btn-disabled' : ''}`}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={`modal-btn-primary ${(!isValid || isLoading) ? 'modal-btn-disabled' : ''}`}
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