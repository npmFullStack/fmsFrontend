import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SharedModal from '../ui/SharedModal';
import { Loader2 } from 'lucide-react';

// ✅ Schema validation
const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  base_rate: z.string()
    .min(1, 'Base rate is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number'),
  weight_multiplier: z.string()
    .min(1, 'Weight rate is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number'),
  surcharge_percentage: z.string()
    .regex(/^\d*(\.\d{1,2})?$/, 'Must be a valid number')
    .optional()
    .or(z.literal('')),
});

const AddCategory = ({ isOpen, onClose, onSave, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = (data) => {
    const formatted = {
      ...data,
      base_rate: parseFloat(data.base_rate),
      weight_multiplier: parseFloat(data.weight_multiplier),
      surcharge_percentage: data.surcharge_percentage
        ? parseFloat(data.surcharge_percentage)
        : 0,
    };
    onSave(formatted);
  };

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title="Add Category" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Category Name */}
        <div>
          <label className="modal-label">Category Name</label>
          <input
            type="text"
            placeholder="e.g. Fragile, Electronics, Perishable"
            className="modal-input"
            {...register('name')}
          />
          {errors.name && <span className="modal-error">{errors.name.message}</span>}
        </div>

        {/* Base Rate */}
        <div>
          <label className="modal-label">Base Rate (₱)</label>
          <input
            type="text"
            placeholder="0.00"
            className="modal-input"
            {...register('base_rate')}
          />
          {errors.base_rate && <span className="modal-error">{errors.base_rate.message}</span>}
        </div>

        {/* Weight Multiplier */}
        <div>
          <label className="modal-label">Weight Rate (₱/kg)</label>
          <input
            type="text"
            placeholder="0.00"
            className="modal-input"
            {...register('weight_multiplier')}
          />
          {errors.weight_multiplier && (
            <span className="modal-error">{errors.weight_multiplier.message}</span>
          )}
        </div>

        {/* Surcharge Percentage */}
        <div>
          <label className="modal-label">Surcharge (%)</label>
          <input
            type="text"
            placeholder="Optional (e.g. 5, 10, 15)"
            className="modal-input"
            {...register('surcharge_percentage')}
          />
          {errors.surcharge_percentage && (
            <span className="modal-error">{errors.surcharge_percentage.message}</span>
          )}
        </div>

        {/* Buttons */}
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
