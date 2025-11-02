import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { containerSchema } from '../../schemas/containerSchema';
import { Loader2 } from 'lucide-react';
import SharedModal from '../ui/SharedModal';

const UpdateContainerType = ({
  isOpen,
  onClose,
  onUpdate,
  containerType,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(containerSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (containerType && isOpen) {
      reset({
        size: containerType.size || '',
        max_weight: containerType.max_weight || 0,
      });
    } else if (!isOpen) {
      reset();
    }
  }, [containerType, isOpen, reset]);

  const onSubmit = (data) => {
    const updatedData = {
      size: data.size.trim(),
      max_weight: Number(data.max_weight),
    };
    onUpdate(containerType.id, updatedData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!containerType) return null;

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Container Type"
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Size Field */}
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

        {/* Max Weight Field */}
        <div>
          <label className="modal-label">Max Weight (kg)</label>
          <input
            type="number"
            step="0.01"
            placeholder="Enter max weight"
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

export default UpdateContainerType;
