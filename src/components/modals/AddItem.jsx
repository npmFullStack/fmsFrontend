import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';
import SharedModal from '../ui/SharedModal';
import { Loader2 } from 'lucide-react';

// ✅ Schema validation
const itemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  category_id: z.number({ required_error: 'Category is required' }),
  weight: z
    .string()
    .min(1, 'Weight is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number'),
  base_price: z
    .string()
    .min(1, 'Base price is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number'),
});

const AddItem = ({ isOpen, onClose, onSave, categories = [], isLoading = false }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(itemSchema),
    mode: 'onChange',
  });

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = (data) => {
    const formatted = {
      ...data,
      category_id: Number(data.category_id),
      weight: parseFloat(data.weight),
      base_price: parseFloat(data.base_price),
    };
    onSave(formatted);
  };

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title="Add Item" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Item Name */}
        <div>
          <label className="modal-label">Item Name</label>
          <input
            type="text"
            placeholder="Enter item name"
            className="modal-input"
            {...register('name')}
          />
          {errors.name && <span className="modal-error">{errors.name.message}</span>}
        </div>

        {/* Category */}
        <div>
          <label className="modal-label">Category</label>
          <Select
            options={categoryOptions}
            onChange={(selected) =>
              setValue('category_id', selected?.value, { shouldValidate: true })
            }
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select category"
          />
          {errors.category_id && (
            <span className="modal-error">{errors.category_id.message}</span>
          )}
        </div>

        {/* Weight */}
        <div>
          <label className="modal-label">Weight (kg)</label>
          <input
            type="text"
            placeholder="0.00"
            className="modal-input"
            {...register('weight')}
          />
          {errors.weight && <span className="modal-error">{errors.weight.message}</span>}
        </div>

        {/* Base Price */}
        <div>
          <label className="modal-label">Base Price (₱)</label>
          <input
            type="text"
            placeholder="0.00"
            className="modal-input"
            {...register('base_price')}
          />
          {errors.base_price && (
            <span className="modal-error">{errors.base_price.message}</span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
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
            className={`modal-btn-primary ${
              (!isValid || isLoading) ? 'modal-btn-disabled' : ''
            }`}
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

export default AddItem;
