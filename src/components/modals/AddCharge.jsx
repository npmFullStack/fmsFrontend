// src/components/modals/AddCharge.jsx
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select';
import DateTime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { 
  apSchema, 
  defaultAPValues, 
  chargeTypes, 
  truckingTypes, 
  portChargeTypes, 
  miscChargeTypes 
} from '../../schemas/apSchema';
import SharedModal from '../ui/SharedModal';
import { Loader2, Anchor, Plus, Trash2, DollarSign, FileText, Truck, Calendar, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const AddCharge = ({ isOpen, onClose, onSave, isLoading = false, bookings = [] }) => {
  const [activeTab, setActiveTab] = useState('freight');

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(apSchema),
    mode: 'onChange',
    defaultValues: defaultAPValues,
  });

  // Field arrays for array fields
  const {
    fields: truckingFields,
    append: appendTrucking,
    remove: removeTrucking,
  } = useFieldArray({
    control,
    name: 'trucking_charges',
  });

  const {
    fields: portFields,
    append: appendPort,
    remove: removePort,
  } = useFieldArray({
    control,
    name: 'port_charges',
  });

  const {
    fields: miscFields,
    append: appendMisc,
    remove: removeMisc,
  } = useFieldArray({
    control,
    name: 'misc_charges',
  });

  // Debug logging
  useEffect(() => {
    console.log('Form isValid:', isValid);
    console.log('Form errors:', errors);
    console.log('Booking ID:', watch('booking_id'));
  }, [isValid, errors, watch('booking_id')]);

  useEffect(() => {
    if (isOpen) {
      reset(defaultAPValues);
      setActiveTab('freight');
    }
  }, [isOpen, reset]);

  const onSubmit = (data) => {
    console.log('Submitting data:', data);
    // Filter out empty arrays and null values
    const formattedData = {
      booking_id: data.booking_id,
      freight_charge: data.freight_charge?.amount && data.freight_charge.amount > 0 ? data.freight_charge : null,
      trucking_charges: data.trucking_charges?.filter(charge => charge.amount > 0) || [],
      port_charges: data.port_charges?.filter(charge => charge.amount > 0) || [],
      misc_charges: data.misc_charges?.filter(charge => charge.amount > 0) || [],
    };
    console.log('Formatted data for API:', formattedData);
    onSave(formattedData);
  };

  const addTruckingCharge = () => {
    appendTrucking({ type: 'ORIGIN', amount: 0, check_date: '', voucher: '' });
  };

  const addPortCharge = () => {
    appendPort({ charge_type: 'CRAINAGE', payee: '', amount: 0, check_date: '', voucher: '' });
  };

  const addMiscCharge = () => {
    appendMisc({ charge_type: 'REBATES', payee: '', amount: 0, check_date: '', voucher: '' });
  };

  // Custom DateTime input component
  const DateTimeInput = ({ value, onChange, placeholder }) => (
    <div className="relative">
      <DateTime
        value={value}
        onChange={onChange}
        inputProps={{
          placeholder: placeholder,
          className: "modal-input pr-10 cursor-pointer w-full",
          readOnly: true
        }}
        timeFormat={false}
        closeOnSelect={true}
      />
      <button
        type="button"
        onClick={() => document.querySelector(`input[placeholder="${placeholder}"]`)?.focus()}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
        aria-label="open-calendar"
      >
        <Calendar className="w-5 h-5 text-muted" />
      </button>
    </div>
  );

  const TabButton = ({ tab, label, icon: Icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
        activeTab === tab
          ? 'bg-primary text-white border border-primary'
          : 'text-content hover:bg-main'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <SharedModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add Charges" 
      size="lg"
      className="h-[90vh]" // Add fixed height to parent
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        {/* Scrollable Content - Fixed height with overflow */}
        <div className="flex-1 overflow-y-auto max-h-[calc(90vh-120px)] pr-2 -mr-2">
          <div className="space-y-6">
            {/* Booking Selection */}
            <div>
              <label className="modal-label text-heading">Select Booking</label>
              <Select
                options={bookings.map(booking => ({
                  value: booking.id,
                  label: `${booking.booking_number} - ${booking.first_name} ${booking.last_name}`,
                }))}
                value={bookings.find(b => b.id === watch('booking_id')) ? 
                  { value: watch('booking_id'), label: `${bookings.find(b => b.id === watch('booking_id'))?.booking_number} - ${bookings.find(b => b.id === watch('booking_id'))?.first_name} ${bookings.find(b => b.id === watch('booking_id'))?.last_name}` } 
                  : null
                }
                onChange={(selected) => {
                  console.log('Selected booking:', selected?.value);
                  setValue('booking_id', selected?.value ? Number(selected.value) : undefined, { shouldValidate: true });
                }}
                className={`react-select-container ${errors.booking_id ? 'border-red-500' : ''}`}
                classNamePrefix="react-select"
                placeholder="Select a booking"
                isClearable
              />
              {errors.booking_id && (
                <span className="modal-error">{errors.booking_id.message}</span>
              )}
            </div>

            {/* Tab Navigation with Scroll */}
            <div className="relative">
              <div className="flex overflow-x-auto pb-2 space-x-2 scrollbar-hide bg-main rounded-lg p-2">
                <TabButton tab="freight" label="Freight" icon={DollarSign} />
                <TabButton tab="trucking" label="Trucking" icon={Truck} />
                <TabButton tab="port" label="Port Charges" icon={Anchor} />
                <TabButton tab="misc" label="Miscellaneous" icon={FileText} />
              </div>
              {/* Fade effect for scroll indication */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-main to-transparent pointer-events-none"></div>
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-main to-transparent pointer-events-none"></div>
            </div>

            {/* Freight Charges Tab */}
            {activeTab === 'freight' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-heading">Freight Charges</h3>
                <div className="email-notice border border-blue-700 bg-blue-900">
                  <div className="flex items-start gap-4 pl-4">
                    <AlertCircle className="email-notice-icon text-blue-100" />
                    <p className="email-notice-text text-blue-200">
                      <strong className="email-notice-heading text-blue-100">
                        Note:
                      </strong>{' '}
                      Add freight charges for the selected booking. Amount should be greater than 0.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="modal-label text-heading">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="modal-input"
                      {...register('freight_charge.amount', { 
                        valueAsNumber: true,
                        onChange: () => console.log('Freight amount changed')
                      })}
                    />
                    {errors.freight_charge?.amount && (
                      <span className="modal-error">{errors.freight_charge.amount.message}</span>
                    )}
                  </div>
                  <div>
                    <label className="modal-label text-heading">Check Date</label>
                    <DateTimeInput
                      value={watch('freight_charge.check_date')}
                      onChange={(date) => setValue('freight_charge.check_date', date, { shouldValidate: true })}
                      placeholder="Select check date"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Trucking Charges Tab */}
            {activeTab === 'trucking' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-heading">Trucking Charges</h3>
                  <button
                    type="button"
                    onClick={addTruckingCharge}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark"
                  >
                    <Plus className="w-4 h-4" />
                    Add Trucking Charge
                  </button>
                </div>

                {truckingFields.map((field, index) => (
                  <div key={field.id} className="bg-main border border-main rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-heading">
                        Trucking Charge {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeTrucking(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="modal-label text-heading">Type</label>
                        <Select
                          options={truckingTypes}
                          value={truckingTypes.find(opt => opt.value === watch(`trucking_charges.${index}.type`))}
                          onChange={(selected) => setValue(`trucking_charges.${index}.type`, selected?.value || '', { shouldValidate: true })}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Select type"
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="modal-input"
                          {...register(`trucking_charges.${index}.amount`, { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Check Date</label>
                        <DateTimeInput
                          value={watch(`trucking_charges.${index}.check_date`)}
                          onChange={(date) => setValue(`trucking_charges.${index}.check_date`, date, { shouldValidate: true })}
                          placeholder="Select check date"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {truckingFields.length === 0 && (
                  <div className="text-center py-8 text-muted border-2 border-dashed border-main rounded-lg">
                    No trucking charges added. Click "Add Trucking Charge" to get started.
                  </div>
                )}
              </div>
            )}

            {/* Port Charges Tab */}
            {activeTab === 'port' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-heading">Port Charges</h3>
                  <button
                    type="button"
                    onClick={addPortCharge}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark"
                  >
                    <Plus className="w-4 h-4" />
                    Add Port Charge
                  </button>
                </div>

                {portFields.map((field, index) => (
                  <div key={field.id} className="bg-main border border-main rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-heading">
                        Port Charge {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removePort(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="modal-label text-heading">Charge Type</label>
                        <Select
                          options={portChargeTypes}
                          value={portChargeTypes.find(opt => opt.value === watch(`port_charges.${index}.charge_type`))}
                          onChange={(selected) => setValue(`port_charges.${index}.charge_type`, selected?.value || '', { shouldValidate: true })}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Select charge type"
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Payee</label>
                        <input
                          type="text"
                          placeholder="Payee name"
                          className="modal-input"
                          {...register(`port_charges.${index}.payee`)}
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="modal-input"
                          {...register(`port_charges.${index}.amount`, { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Check Date</label>
                        <DateTimeInput
                          value={watch(`port_charges.${index}.check_date`)}
                          onChange={(date) => setValue(`port_charges.${index}.check_date`, date, { shouldValidate: true })}
                          placeholder="Select check date"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {portFields.length === 0 && (
                  <div className="text-center py-8 text-muted border-2 border-dashed border-main rounded-lg">
                    No port charges added. Click "Add Port Charge" to get started.
                  </div>
                )}
              </div>
            )}

            {/* Miscellaneous Charges Tab */}
            {activeTab === 'misc' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-heading">Miscellaneous Charges</h3>
                  <button
                    type="button"
                    onClick={addMiscCharge}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark"
                  >
                    <Plus className="w-4 h-4" />
                    Add Misc Charge
                  </button>
                </div>

                {miscFields.map((field, index) => (
                  <div key={field.id} className="bg-main border border-main rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-heading">
                        Misc Charge {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeMisc(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="modal-label text-heading">Charge Type</label>
                        <Select
                          options={miscChargeTypes}
                          value={miscChargeTypes.find(opt => opt.value === watch(`misc_charges.${index}.charge_type`))}
                          onChange={(selected) => setValue(`misc_charges.${index}.charge_type`, selected?.value || '', { shouldValidate: true })}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Select charge type"
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Payee</label>
                        <input
                          type="text"
                          placeholder="Payee name"
                          className="modal-input"
                          {...register(`misc_charges.${index}.payee`)}
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="modal-input"
                          {...register(`misc_charges.${index}.amount`, { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Check Date</label>
                        <DateTimeInput
                          value={watch(`misc_charges.${index}.check_date`)}
                          onChange={(date) => setValue(`misc_charges.${index}.check_date`, date, { shouldValidate: true })}
                          placeholder="Select check date"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {miscFields.length === 0 && (
                  <div className="text-center py-8 text-muted border-2 border-dashed border-main rounded-lg">
                    No miscellaneous charges added. Click "Add Misc Charge" to get started.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Buttons at Bottom */}
        <div className="flex justify-end gap-3 pt-6 border-t border-main mt-6 flex-shrink-0">
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
              'Add Charges'
            )}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default AddCharge;