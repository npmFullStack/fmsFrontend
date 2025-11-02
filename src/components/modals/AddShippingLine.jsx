import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shippingLineSchema, defaultShippingLineValues } from '../../schemas/shippingLineSchema';
import SharedModal from '../ui/SharedModal';
import { Loader2 } from 'lucide-react';

const AddShippingLine = ({ isOpen, onClose, onSave, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(shippingLineSchema),
    mode: 'onChange',
    defaultValues: defaultShippingLineValues,
  });

  useEffect(() => {
    if (isOpen) reset(defaultShippingLineValues);
  }, [isOpen, reset]);

  const onSubmit = (data) => {
    // Trim the name before saving
    const formattedData = {
      name: data.name.trim(),
    };
    onSave(formattedData);
  };

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title="Add Shipping Line" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Shipping Line Name */}
        <div>
          <label className="modal-label">Shipping Line Name</label>
          <input
            type="text"
            placeholder="e.g. Maersk, MSC, CMA CGM"
            className="modal-input"
            {...register('name')}
          />
          {errors.name && <span className="modal-error">{errors.name.message}</span>}
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

export default AddShippingLine;