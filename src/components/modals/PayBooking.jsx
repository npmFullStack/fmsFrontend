// [file name]: PayBooking.jsx
import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Smartphone, CheckCircle, XCircle } from 'lucide-react';
import SharedModal from '../ui/SharedModal';
import { formatCurrency } from '../../utils/formatters';
import { usePayment } from '../../hooks/usePayment';
import toast from 'react-hot-toast';

const PayBooking = ({ 
  isOpen, 
  onClose, 
  booking,
  onPaymentSuccess 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [amount, setAmount] = useState('');
  const [gcashMobile, setGcashMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createPaymentForBooking } = usePayment();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && booking) {
      // You can set a default amount based on AR data
      setAmount('');
      setGcashMobile('');
      setPaymentMethod('gcash');
    }
  }, [isOpen, booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking || !amount || !gcashMobile) return;

    setIsSubmitting(true);

    try {
      await createPaymentForBooking.mutateAsync({
        bookingId: booking.id,
        payment_method: paymentMethod,
        amount: parseFloat(amount),
        gcash_mobile_number: gcashMobile
      });

      toast.success('Payment initiated successfully!');
      onPaymentSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setGcashMobile('');
    setPaymentMethod('gcash');
    onClose();
  };

  if (!isOpen || !booking) return null;

  return (
    <SharedModal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Make Payment" 
      size="sm"
    >
      <div className="space-y-4">
        {/* Booking Summary */}
        <div className="bg-main rounded-lg p-3 border border-main">
          <h4 className="font-semibold text-heading mb-2">Booking Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Booking #:</span>
              <span className="font-medium">{booking.booking_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Route:</span>
              <span className="font-medium">
                {booking.origin?.name} → {booking.destination?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Container:</span>
              <span className="font-medium">
                {booking.container_quantity} x {booking.container_size?.size}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div>
          <label className="modal-label text-heading">Payment Method</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('gcash')}
              className={`p-3 border rounded-lg text-center transition-colors ${
                paymentMethod === 'gcash'
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-main bg-surface text-heading hover:bg-main'
              }`}
            >
              <Smartphone className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm font-medium">GCash</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('paymongo')}
              className={`p-3 border rounded-lg text-center transition-colors ${
                paymentMethod === 'paymongo'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-main bg-surface text-heading hover:bg-main'
              }`}
            >
              <CreditCard className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm font-medium">PayMongo</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="modal-label text-heading">
              Amount (PHP)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="modal-input pl-10"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          {/* GCash Mobile Number */}
          {paymentMethod === 'gcash' && (
            <div>
              <label htmlFor="gcashMobile" className="modal-label text-heading">
                GCash Mobile Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="tel"
                  id="gcashMobile"
                  value={gcashMobile}
                  onChange={(e) => setGcashMobile(e.target.value)}
                  className="modal-input pl-10"
                  placeholder="09XXXXXXXXX"
                  pattern="[0-9]{11}"
                  required
                />
              </div>
              <p className="text-xs text-muted mt-1">
                Enter your 11-digit GCash registered mobile number
              </p>
            </div>
          )}

          {/* Payment Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h5 className="font-semibold text-yellow-800 text-sm mb-2">
              Payment Instructions
            </h5>
            {paymentMethod === 'gcash' ? (
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>1. Open your GCash app</li>
                <li>2. Go to "Send Money"</li>
                <li>3. Enter our GCash number: 09XXXXXXX</li>
                <li>4. Enter the amount exactly as shown</li>
                <li>5. Add the reference number in the notes</li>
              </ul>
            ) : (
              <ul className="text-xs text-blue-700 space-y-1">
                <li>1. You will be redirected to PayMongo</li>
                <li>2. Complete the payment process</li>
                <li>3. Return to this page after payment</li>
                <li>4. Payment will be verified automatically</li>
              </ul>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-main">
            <button
              type="button"
              onClick={handleClose}
              className="modal-btn-cancel text-sm py-2 px-3"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!amount || !gcashMobile || isSubmitting}
              className="modal-btn-primary disabled:modal-btn-disabled flex items-center gap-2 text-sm py-2 px-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay {amount ? formatCurrency(parseFloat(amount)) : ''}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </SharedModal>
  );
};

export default PayBooking;