import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shippingLineSchema } from '../../schemas/shippingLineSchema';
import { Loader2 } from 'lucide-react';
import SharedModal from '../ui/SharedModal';

const UpdateShippingLine = ({
  isOpen,
  onClose,
  onUpdate,
  shippingLine,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(shippingLineSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (shippingLine && isOpen) {
      reset({
        name: shippingLine.name || '',
      });
    } else if (!isOpen) {
      reset();
    }
  }, [shippingLine, isOpen, reset]);

  const onSubmit = (data) => {
    const updatedData = {
      name: data.name.trim(),
    };
    onUpdate(shippingLine.id, updatedData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!shippingLine) return null;

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Shipping Line"
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Shipping Line Name Field */}
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
            onClick={handleClose}
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
                Updating...
              </>
            ) : (
              'Update'
            )}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default UpdateShippingLine;