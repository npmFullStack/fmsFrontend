import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';
import SharedModal from '../ui/SharedModal';
import { Loader2 } from 'lucide-react';

const containerTypeSchema = z.object({
  size: z.string().min(2, 'Size must be at least 2 characters'),
  load_type: z.enum(['LCL', 'FCL'], {
    required_error: 'Load type is required',
  }),
  max_weight: z.string()
    .min(1, 'Max weight is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number'),
  fcl_rate: z.string()
    .regex(/^\d*(\.\d{1,2})?$/, 'Must be a valid number')
    .optional()
    .or(z.literal('')),
});

const loadTypeOptions = [
  { value: 'LCL', label: 'LCL (Less than Container Load)' },
  { value: 'FCL', label: 'FCL (Full Container Load)' },
];

const AddContainerType = ({ isOpen, onClose, onSave, isLoading = false }) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(containerTypeSchema),
    mode: 'onChange',
  });

  const loadType = watch('load_type');
  const showFclRate = loadType === 'FCL';

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = (data) => {
    const containerTypeData = {
      ...data,
      max_weight: parseFloat(data.max_weight),
      fcl_rate: data.fcl_rate && loadType === 'FCL' ? parseFloat(data.fcl_rate) : null,
    };
    onSave(containerTypeData);
  };

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title="Add Container Type" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="modal-label">
            Size
          </label>
          <input
            type="text"
            placeholder="Type container type size"
            className="modal-input"
            {...register('size')}
          />
          {errors.size && <span className="modal-error">{errors.size.message}</span>}
        </div>

        <div>
          <label className="modal-label">
            Load Type
          </label>
          <Select
            options={loadTypeOptions}
            onChange={(selected) => setValue('load_type', selected?.value, { shouldValidate: true })}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select load type"
          />
          {errors.load_type && <span className="modal-error">{errors.load_type.message}</span>}
        </div>

        <div>
          <label className="modal-label">
            Max Weight (kg)
          </label>
          <input
            type="text"
            placeholder="0.00"
            className="modal-input"
            {...register('max_weight')}
          />
          {errors.max_weight && <span className="modal-error">{errors.max_weight.message}</span>}
        </div>

        {showFclRate && (
          <div>
            <label className="modal-label">
              FCL Rate
            </label>
            <input
              type="text"
              placeholder="0.00"
              className="modal-input"
              {...register('fcl_rate')}
            />
            {errors.fcl_rate && <span className="modal-error">{errors.fcl_rate.message}</span>}
          </div>
        )}

        {loadType === 'LCL' && (
          <div className="modal-info-box">
            <div className="modal-info-title">
              <span>LCL Mode</span>
              <span className="modal-info-badge">
                Per Item Pricing
              </span>
            </div>
            <p className="modal-info-text">
              FCL rate is not applicable for LCL shipments. Pricing will be calculated per item.
            </p>
          </div>
        )}

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

export default AddContainerType;