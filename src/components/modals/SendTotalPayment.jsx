// src/components/modals/SendTotalPayment.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, Calculator, AlertCircle, Loader2, User, Package, TrendingUp, CreditCard } from 'lucide-react';
import { arSchema } from '../../schemas/arSchema';
import SharedModal from '../ui/SharedModal';
import { useAR } from '../../hooks/useAR';
import { useAP } from '../../hooks/useAP';
import { formatCurrency } from '../../utils/formatters';

const SendTotalPayment = ({ isOpen, onClose, onSave, isLoading = false, selectedAR = null }) => {
  const { apByBookingQuery } = useAP();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(arSchema),
    mode: 'onChange',
  });

  // Get booking ID from selected AR record
  const bookingId = selectedAR?.booking_id;
  
  // Fetch AP data for this booking to show expenses
  const { data: existingAP, isLoading: isLoadingAP } = apByBookingQuery(bookingId);
  
  // Calculate suggested price based on AP expenses
  const totalExpenses = existingAP?.total_expenses || 0;
  const suggestedPrice = totalExpenses * 1.30; // 30% markup

  // Reset form when modal opens with selected AR record
  useEffect(() => {
    if (isOpen && selectedAR) {
      reset({
        booking_id: selectedAR.booking_id,
        total_payment: selectedAR.total_payment || suggestedPrice,
      });
    } else if (isOpen) {
      reset({
        booking_id: '',
        total_payment: 0,
      });
    }
  }, [isOpen, selectedAR, suggestedPrice, reset]);

  const onSubmit = (data) => {
    onSave(data);
  };

  const currentTotalPayment = watch('total_payment') || 0;
  const profit = currentTotalPayment - totalExpenses;
  const profitMargin = totalExpenses > 0 ? (profit / totalExpenses) * 100 : 0;

  if (!isOpen) return null;

  return (
    <SharedModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Send Payment Request" 
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Selected Booking Info - Compact */}
        {selectedAR && selectedAR.booking && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-3 h-3 text-blue-600" />
              <span className="font-medium text-blue-800 text-sm">Booking #{selectedAR.booking.booking_number}</span>
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              <div><strong>{selectedAR.booking.first_name} {selectedAR.booking.last_name}</strong></div>
              <div>{selectedAR.booking.origin?.name || 'N/A'} → {selectedAR.booking.destination?.name || 'N/A'}</div>
            </div>
            <input type="hidden" {...register('booking_id')} />
          </div>
        )}

        {/* Cost Breakdown - Compact */}
        <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-3 h-3 text-gray-600" />
            <span className="font-medium text-gray-800 text-sm">Cost Breakdown</span>
          </div>
          
          {isLoadingAP ? (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading costs...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-600">Expenses:</div>
              <div className="font-medium text-gray-800 text-right">
                {formatCurrency(totalExpenses)}
              </div>
              
              <div className="text-gray-600">Suggested (30%):</div>
              <div className="font-medium text-green-600 text-right">
                {formatCurrency(suggestedPrice)}
              </div>
            </div>
          )}
        </div>

        {/* Total Payment Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-heading">
            Payment Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              {...register('total_payment', { valueAsNumber: true })}
            />
          </div>
          {errors.total_payment && (
            <span className="text-xs text-red-600">{errors.total_payment.message}</span>
          )}
          
          {/* Quick Price Suggestions */}
          <div className="flex gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setValue('total_payment', suggestedPrice, { shouldValidate: true })}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
            >
              30%
            </button>
            <button
              type="button"
              onClick={() => setValue('total_payment', totalExpenses * 1.2, { shouldValidate: true })}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
            >
              20%
            </button>
            <button
              type="button"
              onClick={() => setValue('total_payment', totalExpenses * 1.5, { shouldValidate: true })}
              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
            >
              50%
            </button>
          </div>
        </div>

        {/* Profit Calculation - Compact */}
        {totalExpenses > 0 && (
          <div className="bg-gray-50 rounded p-3 space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-gray-600" />
              <span className="font-medium text-heading text-sm">Profit</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-600">Amount:</div>
              <div className={`font-semibold text-right ${
                profit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(profit)}
              </div>
              
              <div className="text-gray-600">Margin:</div>
              <div className={`font-semibold text-right ${
                profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {profitMargin.toFixed(1)}%
              </div>
            </div>
            
            {profit < 0 && (
              <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-red-700">Warning: Price is below cost</span>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-3 py-2 text-sm text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 ${
              !isValid || isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <DollarSign className="w-3 h-3" />
                Send
              </>
            )}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default React.memo(SendTotalPayment);