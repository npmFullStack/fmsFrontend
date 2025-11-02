import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { containerSchema, defaultContainerValues } from '../../schemas/containerSchema';
import SharedModal from '../ui/SharedModal';
import { Loader2 } from 'lucide-react';

const AddContainerType = ({ isOpen, onClose, onSave, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(containerSchema),
    mode: 'onChange',
    defaultValues: defaultContainerValues,
  });

  useEffect(() => {
    if (isOpen) reset(defaultContainerValues);
  }, [isOpen, reset]);

  const onSubmit = (data) => {
    // Convert string inputs to numeric values properly
    const formattedData = {
      size: data.size.trim(),
      max_weight: Number(data.max_weight),
    };
    onSave(formattedData);
  };

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title="Add Container Type" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Container Size */}
        <div>
          <label className="modal-label">Size</label>
          <input
            type="text"
            placeholder="e.g. 20FT or 40FT"
            className="modal-input"
            {...register('size')}
          />
          {errors.size && <span className="modal-error">{errors.size.message}</span>}
        </div>

        {/* Max Weight */}
        <div>
          <label className="modal-label">Max Weight (kg)</label>
          <input
            type="number"
            step="0.01"
            placeholder="Enter maximum weight"
            className="modal-input"
            {...register('max_weight', { valueAsNumber: true })}
          />
          {errors.max_weight && (
            <span className="modal-error">{errors.max_weight.message}</span>
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
            disabled={!isValid || isLoading}
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

export default AddContainerType;
