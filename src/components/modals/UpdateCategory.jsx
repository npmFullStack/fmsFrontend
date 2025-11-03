import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, defaultCategoryValues } from '../../schemas/categorySchema';
import SharedModal from '../ui/SharedModal';
import { Loader2 } from 'lucide-react';

const UpdateCategory = ({ isOpen, onClose, onUpdate, category, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
    defaultValues: defaultCategoryValues,
  });

  useEffect(() => {
    if (category) {
      setValue('name', category.name);
    } else {
      reset(defaultCategoryValues);
    }
  }, [category, reset, setValue]);

  const onSubmit = (data) => {
    // Trim the name and send the data
    const formattedData = {
      name: data.name.trim(),
    };
    onUpdate(category.id, formattedData);
  };

  const handleClose = () => {
    reset(defaultCategoryValues);
    onClose();
  };

  if (!category) return null;

  return (
    <SharedModal isOpen={isOpen} onClose={handleClose} title="Update Category" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Category Name */}
        <div>
          <label className="modal-label">Category Name</label>
          <input
            type="text"
            placeholder="e.g. Electronics, Fragile"
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

export default UpdateCategory;