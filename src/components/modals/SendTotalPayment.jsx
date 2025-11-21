// src/components/modals/SendTotalPayment.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select';
import { DollarSign, Calculator, AlertCircle, Loader2 } from 'lucide-react';
import { arSchema, defaultARValues } from '../../schemas/arSchema';
import SharedModal from '../ui/SharedModal';
import { useAR } from '../../hooks/useAR';
import { useAP } from '../../hooks/useAP';
import { formatCurrency } from '../../utils/formatters';

const SendTotalPayment = ({ isOpen, onClose, onSave, isLoading = false, bookings = [] }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { apByBookingQuery } = useAP();
  const { arByBookingQuery } = useAR();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(arSchema),
    mode: 'onChange',
    defaultValues: defaultARValues,
  });

  const watchedBookingId = watch('booking_id');
  const { data: existingAP, isLoading: isLoadingAP } = apByBookingQuery(watchedBookingId);
  const { data: existingAR, isLoading: isLoadingAR } = arByBookingQuery(watchedBookingId);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset(defaultARValues);
      setSelectedBooking(null);
    }
  }, [isOpen, reset]);

  // Update selected booking
  useEffect(() => {
    if (watchedBookingId) {
      const booking = bookings.find(b => b.id === watchedBookingId);
      setSelectedBooking(booking);
    } else {
      setSelectedBooking(null);
    }
  }, [watchedBookingId, bookings]);

  const bookingOptions = bookings.map(booking => ({
    value: booking.id,
    label: `${booking.booking_number} - ${booking.first_name} ${booking.last_name}`,
  }));

  const totalExpenses = existingAP?.total_expenses || 0;
  const existingTotalPayment = existingAR?.total_payment || 0;

  const onSubmit = (data) => {
    onSave(data);
  };

  const handleBookingChange = (selected) => {
    const bookingId = selected?.value ? Number(selected.value) : undefined;
    setValue('booking_id', bookingId, { shouldValidate: true });
    trigger('booking_id');
  };

  if (!isOpen) return null;

  return (
    <SharedModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Send Total Payment to Customer" 
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Booking Selection */}
        <div>
          <label className="modal-label text-heading">Select Booking</label>
          <Select
            options={bookingOptions}
            value={bookingOptions.find(option => option.value === watchedBookingId)}
            onChange={handleBookingChange}
            className={`react-select-container ${errors.booking_id ? 'border-red-500' : ''}`}
            classNamePrefix="react-select"
            placeholder="Select a booking"
            isClearable
          />
          {errors.booking_id && (
            <span className="modal-error">{errors.booking_id.message}</span>
          )}
        </div>

        {/* Financial Summary */}
        {watchedBookingId && (
          <div className="bg-main rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-heading flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Financial Summary
            </h3>
            
            {isLoadingAP ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading expenses...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted">Total Expenses:</div>
                  <div className="font-medium text-heading text-right">
                    {formatCurrency(totalExpenses)}
                  </div>
                  
                  {existingAR && (
                    <>
                      <div className="text-muted">Existing Payment:</div>
                      <div className="font-medium text-heading text-right">
                        {formatCurrency(existingTotalPayment)}
                      </div>
                    </>
                  )}
                </div>

                {existingAR && (
                  <div className="email-notice border border-blue-700 bg-blue-900">
                    <div className="flex items-start gap-4 pl-4">
                      <AlertCircle className="email-notice-icon text-blue-100" />
                      <p className="email-notice-text text-blue-200">
                        This booking already has a payment record. This will update the existing amount.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Total Payment Input */}
        <div>
          <label className="modal-label text-heading">Total Payment Amount</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="modal-input pl-10"
              {...register('total_payment', { valueAsNumber: true })}
            />
          </div>
          {errors.total_payment && (
            <span className="modal-error">{errors.total_payment.message}</span>
          )}
        </div>

        {/* Calculated Fields Preview */}
        {watchedBookingId && totalExpenses > 0 && (
          <div className="bg-main rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-heading text-sm">Projected Financials</h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="text-muted">Gross Income:</div>
              <div className="font-medium text-heading text-right">
                {formatCurrency(watch('total_payment') || 0)}
              </div>
              
              <div className="text-muted">Net Revenue:</div>
              <div className="font-medium text-heading text-right">
                {formatCurrency((watch('total_payment') || 0) - totalExpenses)}
              </div>
              
              <div className="text-muted">Profit:</div>
              <div className="font-medium text-heading text-right">
                {formatCurrency((watch('total_payment') || 0) - totalExpenses)}
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-main">
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
                Sending...
              </>
            ) : existingAR ? (
              'Update Payment'
            ) : (
              'Send Payment'
            )}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default React.memo(SendTotalPayment);