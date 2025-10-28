import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SharedModal from '../ui/SharedModal';
import { Loader2 } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const UpdateCategory = ({ isOpen, onClose, onUpdate, category, isLoading = false }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (category) {
      setValue('name', category.name);
    } else {
      reset();
    }
  }, [category, reset, setValue]);

  const onSubmit = (data) => onUpdate(category.id, data);

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!category) return null;

  return (
    <SharedModal isOpen={isOpen} onClose={handleClose} title="Update Category" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="modal-label">Name</label>
          <input
            type="text"
            placeholder="Type category name"
            className="modal-input"
            {...register('name')}
          />
          {errors.name && <span className="modal-error">{errors.name.message}</span>}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={handleClose} className="modal-btn-cancel" disabled={isLoading}>
            Cancel
          </button>
          <button
            type="submit"
            className={`modal-btn-primary ${(!isValid || isLoading) ? 'modal-btn-disabled' : ''}`}
            disabled={isLoading || !isValid}
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update'}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default UpdateCategory;
