import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { truckCompSchema, defaultTruckCompValues } from '../../schemas/truckCompSchema';
import SharedModal from '../ui/SharedModal';
import { Loader2 } from 'lucide-react';

const AddTruckComp = ({ isOpen, onClose, onSave, isLoading = false }) => {
  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(truckCompSchema),
    mode: 'onChange',
    defaultValues: defaultTruckCompValues,
  });

  useEffect(() => {
    if (isOpen) reset(defaultTruckCompValues);
  }, [isOpen, reset]);

  const onSubmit = (data) => onSave({ name: data.name.trim() });

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title="Add Truck Company" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="modal-label">Truck Company Name</label>
          <input type="text" placeholder="e.g. ABC Logistics" className="modal-input" {...register('name')} />
          {errors.name && <span className="modal-error">{errors.name.message}</span>}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="modal-btn-cancel" disabled={isLoading}>Cancel</button>
          <button type="submit" className="modal-btn-primary" disabled={!isValid || isLoading}>
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Add'}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default AddTruckComp;
