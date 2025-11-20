// src/components/modals/AddCharge.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select';
import DateTime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { 
  apSchema, 
  defaultAPValues, 
  truckingTypes, 
  portChargeTypes, 
  miscChargeTypes 
} from '../../schemas/apSchema';
import SharedModal from '../ui/SharedModal';
import { useAP } from '../../hooks/useAP';
import { Loader2, Anchor, Plus, Trash2, DollarSign, FileText, Truck, Calendar, AlertCircle } from 'lucide-react';

// Simple DateTime component
const DateTimeInput = React.memo(({ value, onChange, placeholder }) => {
  // Format date to remove time part (00:00:00)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // If it's already just a date (YYYY-MM-DD), return as is
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // If it has time part, extract just the date
    if (typeof dateString === 'string' && dateString.includes(' ')) {
      return dateString.split(' ')[0];
    }
    // If it's a Date object or other format, try to format it
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative">
      <DateTime
        value={formatDate(value)}
        onChange={(date) => {
          const dateString = typeof date === 'string' ? date : date?.format('YYYY-MM-DD') || '';
          onChange(dateString);
        }}
        inputProps={{
          placeholder: placeholder,
          className: "modal-input pr-10 cursor-pointer w-full",
          readOnly: true
        }}
        timeFormat={false}
        closeOnSelect={true}
        dateFormat="YYYY-MM-DD"
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
    </div>
  );
});

const AddCharge = ({ isOpen, onClose, onSave, isLoading = false, bookings = [] }) => {
  const [activeTab, setActiveTab] = useState('freight');
  const [truckingCharges, setTruckingCharges] = useState([]);
  const [portCharges, setPortCharges] = useState([]);
  const [miscCharges, setMiscCharges] = useState([]);
  
  // Refs for auto-scrolling to newly added charges
  const truckingChargesEndRef = useRef(null);
  const portChargesEndRef = useRef(null);
  const miscChargesEndRef = useRef(null);
  
  const { apByBookingQuery } = useAP();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(apSchema),
    mode: 'onChange',
    defaultValues: defaultAPValues,
  });

  const watchedBookingId = watch('booking_id');
  const { data: existingCharges, isLoading: isLoadingExisting } = apByBookingQuery(watchedBookingId);

  // Memoized booking options
  const bookingOptions = useMemo(() => 
    bookings.map(booking => ({
      value: booking.id,
      label: `${booking.booking_number} - ${booking.first_name} ${booking.last_name}`,
    })),
    [bookings]
  );

  const selectedBooking = useMemo(() => 
    bookingOptions.find(option => option.value === watchedBookingId),
    [bookingOptions, watchedBookingId]
  );

  // Reset everything when modal opens
  useEffect(() => {
    if (isOpen) {
      // Completely reset the form
      reset(defaultAPValues);
      setTruckingCharges([]);
      setPortCharges([]);
      setMiscCharges([]);
      setActiveTab('freight');
    }
  }, [isOpen, reset]);

  // Auto-scroll to newly added charges
  useEffect(() => {
    if (truckingCharges.length > 0 && truckingChargesEndRef.current) {
      truckingChargesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [truckingCharges.length]);

  useEffect(() => {
    if (portCharges.length > 0 && portChargesEndRef.current) {
      portChargesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [portCharges.length]);

  useEffect(() => {
    if (miscCharges.length > 0 && miscChargesEndRef.current) {
      miscChargesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [miscCharges.length]);

  // Simple population of existing charges - FIXED: Prevent duplicates
  useEffect(() => {
    if (existingCharges && isOpen) {
      // Reset all charges first
      setTruckingCharges([]);
      setPortCharges([]);
      setMiscCharges([]);
      
      // Populate freight charge
      if (existingCharges.freight_charge) {
        setValue('freight_charge.amount', existingCharges.freight_charge.amount);
        setValue('freight_charge.check_date', existingCharges.freight_charge.check_date || '');
      }

      // Populate other charges - use unique types only
      if (existingCharges.trucking_charges) {
        const uniqueTruckingCharges = [];
        const seenTypes = new Set();
        
        existingCharges.trucking_charges.forEach(charge => {
          if (!seenTypes.has(charge.type)) {
            seenTypes.add(charge.type);
            uniqueTruckingCharges.push({
              ...charge,
              id: Math.random().toString(36).substr(2, 9)
            });
          }
        });
        setTruckingCharges(uniqueTruckingCharges);
      }

      if (existingCharges.port_charges) {
        const uniquePortCharges = [];
        const seenTypes = new Set();
        
        existingCharges.port_charges.forEach(charge => {
          if (!seenTypes.has(charge.charge_type)) {
            seenTypes.add(charge.charge_type);
            uniquePortCharges.push({
              ...charge,
              id: Math.random().toString(36).substr(2, 9)
            });
          }
        });
        setPortCharges(uniquePortCharges);
      }

      if (existingCharges.misc_charges) {
        const uniqueMiscCharges = [];
        const seenTypes = new Set();
        
        existingCharges.misc_charges.forEach(charge => {
          if (!seenTypes.has(charge.charge_type)) {
            seenTypes.add(charge.charge_type);
            uniqueMiscCharges.push({
              ...charge,
              id: Math.random().toString(36).substr(2, 9)
            });
          }
        });
        setMiscCharges(uniqueMiscCharges);
      }

      setTimeout(() => trigger(), 100);
    }
  }, [existingCharges, isOpen, setValue, trigger]);

  // Format date to remove time part
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  // Simple charge management functions
  const addTruckingCharge = useCallback(() => {
    const usedTypes = truckingCharges.map(c => c.type);
    const availableType = truckingTypes.find(t => !usedTypes.includes(t.value));
    if (availableType) {
      setTruckingCharges(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        type: availableType.value,
        amount: '',
        check_date: '',
        voucher: ''
      }]);
    }
  }, [truckingCharges]);

  const removeTruckingCharge = useCallback((index) => {
    setTruckingCharges(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateTruckingCharge = useCallback((index, field, value) => {
    setTruckingCharges(prev => prev.map((charge, i) => 
      i === index ? { ...charge, [field]: value } : charge
    ));
  }, []);

  const addPortCharge = useCallback(() => {
    const usedTypes = portCharges.map(c => c.charge_type);
    const availableType = portChargeTypes.find(t => !usedTypes.includes(t.value));
    if (availableType) {
      setPortCharges(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        charge_type: availableType.value,
        payee: '',
        amount: '',
        check_date: '',
        voucher: ''
      }]);
    }
  }, [portCharges]);

  const removePortCharge = useCallback((index) => {
    setPortCharges(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updatePortCharge = useCallback((index, field, value) => {
    setPortCharges(prev => prev.map((charge, i) => 
      i === index ? { ...charge, [field]: value } : charge
    ));
  }, []);

  const addMiscCharge = useCallback(() => {
    const usedTypes = miscCharges.map(c => c.charge_type);
    const availableType = miscChargeTypes.find(t => !usedTypes.includes(t.value));
    if (availableType) {
      setMiscCharges(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        charge_type: availableType.value,
        payee: '',
        amount: '',
        check_date: '',
        voucher: ''
      }]);
    }
  }, [miscCharges]);

  const removeMiscCharge = useCallback((index) => {
    setMiscCharges(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateMiscCharge = useCallback((index, field, value) => {
    setMiscCharges(prev => prev.map((charge, i) => 
      i === index ? { ...charge, [field]: value } : charge
    ));
  }, []);

  // Handle amount input change - allow empty and proper number parsing
  const handleAmountChange = useCallback((index, value, updateFunction) => {
    // Allow empty string for better UX
    if (value === '') {
      updateFunction(index, 'amount', '');
      return;
    }
    
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return; // Invalid input, don't update
    }
    
    // Parse as float, but keep as string if it ends with decimal point
    if (cleanValue.endsWith('.')) {
      updateFunction(index, 'amount', cleanValue);
    } else {
      const numValue = parseFloat(cleanValue);
      if (!isNaN(numValue)) {
        updateFunction(index, 'amount', numValue);
      }
    }
  }, []);

  const onSubmit = useCallback((data) => {
    const formattedData = {
      booking_id: data.booking_id,
      freight_charge: data.freight_charge?.amount > 0 ? {
        ...data.freight_charge,
        amount: parseFloat(data.freight_charge.amount) || 0
      } : null,
      trucking_charges: truckingCharges
        .filter(charge => charge.amount && charge.amount !== '')
        .map(charge => ({
          ...charge,
          amount: parseFloat(charge.amount) || 0
        })),
      port_charges: portCharges
        .filter(charge => charge.amount && charge.amount !== '')
        .map(charge => ({
          ...charge,
          amount: parseFloat(charge.amount) || 0
        })),
      misc_charges: miscCharges
        .filter(charge => charge.amount && charge.amount !== '')
        .map(charge => ({
          ...charge,
          amount: parseFloat(charge.amount) || 0
        })),
    };
    
    onSave(formattedData);
  }, [truckingCharges, portCharges, miscCharges, onSave]);

  const handleBookingChange = useCallback((selected) => {
    const bookingId = selected?.value ? Number(selected.value) : undefined;
    setValue('booking_id', bookingId, { shouldValidate: true });
    trigger('booking_id');
  }, [setValue, trigger]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Memoized can add checks
  const canAddTruckingCharge = useMemo(() => {
    const usedTypes = truckingCharges.map(c => c.type);
    return truckingTypes.some(t => !usedTypes.includes(t.value));
  }, [truckingCharges]);

  const canAddPortCharge = useMemo(() => {
    const usedTypes = portCharges.map(c => c.charge_type);
    return portChargeTypes.some(t => !usedTypes.includes(t.value));
  }, [portCharges]);

  const canAddMiscCharge = useMemo(() => {
    const usedTypes = miscCharges.map(c => c.charge_type);
    return miscChargeTypes.some(t => !usedTypes.includes(t.value));
  }, [miscCharges]);

  // Simple tab button component
  const TabButton = useCallback(({ tab, label, icon: Icon }) => (
    <button
      type="button"
      onClick={() => handleTabChange(tab)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
        activeTab === tab
          ? 'bg-primary text-white border border-primary'
          : 'text-content hover:bg-main'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  ), [activeTab, handleTabChange]);

  if (!isOpen) return null;

  return (
    <SharedModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add Charges" 
      size="lg"
      className="h-[90vh]"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto max-h-[calc(90vh-120px)] pr-2 -mr-2">
          <div className="space-y-6">
            {/* Booking Selection */}
            <div>
              <label className="modal-label text-heading">Select Booking</label>
              <Select
                options={bookingOptions}
                value={selectedBooking}
                onChange={handleBookingChange}
                className={`react-select-container ${errors.booking_id ? 'border-red-500' : ''}`}
                classNamePrefix="react-select"
                placeholder="Select a booking"
                isClearable
              />
              {errors.booking_id && (
                <span className="modal-error">{errors.booking_id.message}</span>
              )}
              {isLoadingExisting && (
                <div className="text-sm text-blue-600 mt-1">Loading existing charges...</div>
              )}
            </div>

            {existingCharges && (
              <div className="email-notice border border-blue-700 bg-blue-900">
                <div className="flex items-start gap-4 pl-4">
                  <AlertCircle className="email-notice-icon text-blue-100" />
                  <p className="email-notice-text text-blue-200">
                    This booking already has existing charges. Adding new charges will accumulate with existing ones.
                  </p>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="relative">
              <div className="flex overflow-x-auto pb-2 space-x-2 scrollbar-hide bg-main rounded-lg p-2">
                <TabButton tab="freight" label="Freight" icon={DollarSign} />
                <TabButton tab="trucking" label="Trucking" icon={Truck} />
                <TabButton tab="port" label="Port Charges" icon={Anchor} />
                <TabButton tab="misc" label="Miscellaneous" icon={FileText} />
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-main to-transparent pointer-events-none"></div>
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-main to-transparent pointer-events-none"></div>
            </div>

            {/* Freight Charges */}
            {activeTab === 'freight' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-heading">Freight Charges</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="modal-label text-heading">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="modal-input"
                      {...register('freight_charge.amount', { valueAsNumber: true })}
                    />
                    {errors.freight_charge?.amount && (
                      <span className="modal-error">{errors.freight_charge.amount.message}</span>
                    )}
                  </div>
                  <div>
                    <label className="modal-label text-heading">Check Date</label>
                    <DateTimeInput
                      value={watch('freight_charge.check_date') || ''}
                      onChange={(date) => setValue('freight_charge.check_date', date)}
                      placeholder="Select check date"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Trucking Charges */}
            {activeTab === 'trucking' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-heading">Trucking Charges</h3>
                  <button
                    type="button"
                    onClick={addTruckingCharge}
                    disabled={!canAddTruckingCharge}
                    className={`flex items-center gap-2 text-sm ${
                      canAddTruckingCharge ? 'text-primary hover:text-primary-dark' : 'text-muted cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Trucking Charge
                  </button>
                </div>

                {truckingCharges.map((charge, index) => (
                  <div key={charge.id} className="bg-main border border-main rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-heading">Trucking Charge {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeTruckingCharge(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="modal-label text-heading">Type</label>
                        <Select
                          options={truckingTypes.filter(t => 
                            !truckingCharges.some((c, i) => i !== index && c.type === t.value)
                          )}
                          value={truckingTypes.find(t => t.value === charge.type)}
                          onChange={(selected) => updateTruckingCharge(index, 'type', selected?.value)}
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Amount</label>
                        <input
                          type="text"
                          placeholder="0.00"
                          value={charge.amount}
                          onChange={(e) => handleAmountChange(index, e.target.value, updateTruckingCharge)}
                          className="modal-input"
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Check Date</label>
                        <DateTimeInput
                          value={formatDateForDisplay(charge.check_date)}
                          onChange={(date) => updateTruckingCharge(index, 'check_date', date)}
                          placeholder="Select check date"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Auto-scroll anchor for trucking charges */}
                <div ref={truckingChargesEndRef} />

                {truckingCharges.length === 0 && (
                  <div className="text-center py-8 text-muted border-2 border-dashed border-main rounded-lg">
                    {canAddTruckingCharge 
                      ? 'No trucking charges added. Click "Add Trucking Charge" to get started.'
                      : 'All trucking charge types have been added.'
                    }
                  </div>
                )}
              </div>
            )}

            {/* Port Charges */}
            {activeTab === 'port' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-heading">Port Charges</h3>
                  <button
                    type="button"
                    onClick={addPortCharge}
                    disabled={!canAddPortCharge}
                    className={`flex items-center gap-2 text-sm ${
                      canAddPortCharge ? 'text-primary hover:text-primary-dark' : 'text-muted cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Port Charge
                  </button>
                </div>

                {portCharges.map((charge, index) => (
                  <div key={charge.id} className="bg-main border border-main rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-heading">Port Charge {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removePortCharge(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="modal-label text-heading">Charge Type</label>
                        <Select
                          options={portChargeTypes.filter(t => 
                            !portCharges.some((c, i) => i !== index && c.charge_type === t.value)
                          )}
                          value={portChargeTypes.find(t => t.value === charge.charge_type)}
                          onChange={(selected) => updatePortCharge(index, 'charge_type', selected?.value)}
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Payee</label>
                        <input
                          type="text"
                          placeholder="Payee name"
                          value={charge.payee}
                          onChange={(e) => updatePortCharge(index, 'payee', e.target.value)}
                          className="modal-input"
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Amount</label>
                        <input
                          type="text"
                          placeholder="0.00"
                          value={charge.amount}
                          onChange={(e) => handleAmountChange(index, e.target.value, updatePortCharge)}
                          className="modal-input"
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Check Date</label>
                        <DateTimeInput
                          value={formatDateForDisplay(charge.check_date)}
                          onChange={(date) => updatePortCharge(index, 'check_date', date)}
                          placeholder="Select check date"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Auto-scroll anchor for port charges */}
                <div ref={portChargesEndRef} />

                {portCharges.length === 0 && (
                  <div className="text-center py-8 text-muted border-2 border-dashed border-main rounded-lg">
                    {canAddPortCharge 
                      ? 'No port charges added. Click "Add Port Charge" to get started.'
                      : 'All port charge types have been added.'
                    }
                  </div>
                )}
              </div>
            )}

            {/* Miscellaneous Charges */}
            {activeTab === 'misc' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-heading">Miscellaneous Charges</h3>
                  <button
                    type="button"
                    onClick={addMiscCharge}
                    disabled={!canAddMiscCharge}
                    className={`flex items-center gap-2 text-sm ${
                      canAddMiscCharge ? 'text-primary hover:text-primary-dark' : 'text-muted cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Misc Charge
                  </button>
                </div>

                {miscCharges.map((charge, index) => (
                  <div key={charge.id} className="bg-main border border-main rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-heading">Misc Charge {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeMiscCharge(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="modal-label text-heading">Charge Type</label>
                        <Select
                          options={miscChargeTypes.filter(t => 
                            !miscCharges.some((c, i) => i !== index && c.charge_type === t.value)
                          )}
                          value={miscChargeTypes.find(t => t.value === charge.charge_type)}
                          onChange={(selected) => updateMiscCharge(index, 'charge_type', selected?.value)}
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Payee</label>
                        <input
                          type="text"
                          placeholder="Payee name"
                          value={charge.payee}
                          onChange={(e) => updateMiscCharge(index, 'payee', e.target.value)}
                          className="modal-input"
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Amount</label>
                        <input
                          type="text"
                          placeholder="0.00"
                          value={charge.amount}
                          onChange={(e) => handleAmountChange(index, e.target.value, updateMiscCharge)}
                          className="modal-input"
                        />
                      </div>
                      <div>
                        <label className="modal-label text-heading">Check Date</label>
                        <DateTimeInput
                          value={formatDateForDisplay(charge.check_date)}
                          onChange={(date) => updateMiscCharge(index, 'check_date', date)}
                          placeholder="Select check date"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Auto-scroll anchor for misc charges */}
                <div ref={miscChargesEndRef} />

                {miscCharges.length === 0 && (
                  <div className="text-center py-8 text-muted border-2 border-dashed border-main rounded-lg">
                    {canAddMiscCharge 
                      ? 'No miscellaneous charges added. Click "Add Misc Charge" to get started.'
                      : 'All miscellaneous charge types have been added.'
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-main mt-6">
          <button
            type="button"
            onClick={onClose}
            className="modal-btn-cancel"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`modal-btn-primary ${!isValid || isLoading ? 'modal-btn-disabled' : ''}`}
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

export default React.memo(AddCharge);