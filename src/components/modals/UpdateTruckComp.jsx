import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { truckCompSchema } from '../../schemas/truckCompSchema';
import { Loader2 } from 'lucide-react';
import SharedModal from '../ui/SharedModal';

const UpdateTruckComp = ({ isOpen, onClose, onUpdate, truckComp, isLoading = false }) => {
  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(truckCompSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (truckComp && isOpen) reset({ name: truckComp.name });
    else if (!isOpen) reset();
  }, [truckComp, isOpen, reset]);

  const onSubmit = (data) => onUpdate(truckComp.id, { name: data.name.trim() });

  if (!truckComp) return null;

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title="Update Truck Company" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="modal-label">Truck Company Name</label>
          <input type="text" className="modal-input" {...register('name')} />
          {errors.name && <span className="modal-error">{errors.name.message}</span>}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="modal-btn-cancel" disabled={isLoading}>Cancel</button>
          <button type="submit" className="modal-btn-primary" disabled={!isValid || isLoading}>
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update'}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default UpdateTruckComp;
