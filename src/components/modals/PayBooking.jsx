// [file name]: PayBooking.jsx
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Calculator,
  Shield
} from 'lucide-react';
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

  // Get actual amount due from AR data
  const actualAmountDue = booking?.accounts_receivable?.collectible_amount || 0;
  const totalPayment = booking?.accounts_receivable?.total_payment || 0;
  const totalExpenses = booking?.accounts_receivable?.total_expenses || 0;
  const profit = booking?.accounts_receivable?.profit || 0;
  const isFullyPaid = actualAmountDue === 0;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && booking) {
      // Set amount to the actual due amount, or allow partial payment
      setAmount(actualAmountDue > 0 ? actualAmountDue.toString() : '');
      setGcashMobile('');
      setPaymentMethod('gcash');
    }
  }, [isOpen, booking, actualAmountDue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking || !amount || (paymentMethod === 'gcash' && !gcashMobile)) return;

    const paymentAmount = parseFloat(amount);
    
    // Validate amount
    if (paymentAmount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (paymentAmount > actualAmountDue) {
      toast.error(`Payment amount cannot exceed ${formatCurrency(actualAmountDue)}`);
      return;
    }

    setIsSubmitting(true);

    try {
      await createPaymentForBooking.mutateAsync({
        bookingId: booking.id,
        payment_method: paymentMethod,
        amount: paymentAmount,
        gcash_mobile_number: paymentMethod === 'gcash' ? gcashMobile : undefined
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

  // Handle partial payment amount change
  const handleAmountChange = (value) => {
    const numValue = parseFloat(value) || 0;
    if (numValue > actualAmountDue) {
      setAmount(actualAmountDue.toString());
    } else {
      setAmount(value);
    }
  };

  // Quick payment buttons
  const quickPaymentOptions = [
    { label: 'Full Amount', amount: actualAmountDue },
    { label: '50%', amount: actualAmountDue * 0.5 },
    { label: '25%', amount: actualAmountDue * 0.25 },
  ].filter(option => option.amount > 0);

  if (!isOpen || !booking) return null;

  return (
    <SharedModal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Make Payment" 
      size="md"
    >
      <div className="space-y-4">
        {/* Booking Summary with Financial Details */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Booking & Payment Summary
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-600">Booking #:</span>
              <span className="font-medium text-blue-800">{booking.booking_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Route:</span>
              <span className="font-medium text-blue-800">
                {booking.origin?.name} → {booking.destination?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Container:</span>
              <span className="font-medium text-blue-800">
                {booking.container_quantity} x {booking.container_size?.size}
              </span>
            </div>
            
            {/* Financial Breakdown */}
            <div className="border-t border-blue-200 pt-2 mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-blue-600">Total Amount:</span>
                <span className="font-semibold text-blue-800">{formatCurrency(totalPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Amount Due:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(actualAmountDue)}</span>
              </div>
              {actualAmountDue > 0 && (
                <div className="flex justify-between">
                  <span className="text-blue-600">Already Paid:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(totalPayment - actualAmountDue)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Already Paid Notice */}
        {isFullyPaid && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">This booking is fully paid!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              No payment is required at this time.
            </p>
          </div>
        )}

        {/* Payment Method Selection */}
        {!isFullyPaid && (
          <>
            <div>
              <label className="modal-label text-heading flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('gcash')}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    paymentMethod === 'gcash'
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-25'
                  }`}
                >
                  <Smartphone className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium block">GCash</span>
                  <span className="text-xs text-gray-500 mt-1">Mobile Payment</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paymongo')}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    paymentMethod === 'paymongo'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-25'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium block">PayMongo</span>
                  <span className="text-xs text-gray-500 mt-1">Card/Bank Transfer</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount Input with Quick Options */}
              <div>
                <label htmlFor="amount" className="modal-label text-heading flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Payment Amount (PHP)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="modal-input pl-10 text-lg font-semibold"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={actualAmountDue}
                    required
                  />
                </div>
                
                {/* Quick Payment Options */}
                {quickPaymentOptions.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {quickPaymentOptions.map((option, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setAmount(option.amount.toFixed(2))}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors border border-blue-200"
                      >
                        {option.label} ({formatCurrency(option.amount)})
                      </button>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  Maximum amount: <span className="font-semibold text-orange-600">{formatCurrency(actualAmountDue)}</span>
                </p>
              </div>

              {/* GCash Mobile Number */}
              {paymentMethod === 'gcash' && (
                <div>
                  <label htmlFor="gcashMobile" className="modal-label text-heading flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    GCash Mobile Number
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      id="gcashMobile"
                      value={gcashMobile}
                      onChange={(e) => setGcashMobile(e.target.value)}
                      className="modal-input pl-10"
                      placeholder="09123456789"
                      pattern="[0-9]{11}"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your 11-digit GCash registered mobile number
                  </p>
                </div>
              )}

              {/* Payment Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h5 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Payment Summary
                </h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Due:</span>
                    <span className="font-medium">{formatCurrency(actualAmountDue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Payment:</span>
                    <span className="font-semibold text-green-600">
                      {amount ? formatCurrency(parseFloat(amount)) : '₱0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1">
                    <span className="text-gray-800 font-medium">Remaining Balance:</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(actualAmountDue - (parseFloat(amount) || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h5 className="font-semibold text-yellow-800 text-sm mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {paymentMethod === 'gcash' ? 'GCash Payment Instructions' : 'PayMongo Payment Instructions'}
                </h5>
                {paymentMethod === 'gcash' ? (
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Open your GCash app and go to "Send Money"</li>
                    <li>• Enter our GCash number: <strong>0917 123 4567</strong></li>
                    <li>• Enter the amount: <strong>{amount ? formatCurrency(parseFloat(amount)) : '₱0.00'}</strong></li>
                    <li>• Add your booking number in the notes: <strong>{booking.booking_number}</strong></li>
                    <li>• Take a screenshot of the transaction for verification</li>
                  </ul>
                ) : (
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• You will be redirected to PayMongo's secure payment page</li>
                    <li>• Choose your preferred payment method (Credit/Debit Card, Bank Transfer)</li>
                    <li>• Complete the payment process</li>
                    <li>• You will be automatically returned to this page</li>
                    <li>• Payment verification is automatic and instant</li>
                  </ul>
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-green-700">
                    <strong>Secure Payment:</strong> All transactions are encrypted and secure. 
                    We never store your payment details.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!amount || (paymentMethod === 'gcash' && !gcashMobile) || isSubmitting || parseFloat(amount) <= 0}
                  className="px-4 py-2.5 text-sm text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing Payment...
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
          </>
        )}

        {/* Close Button for Fully Paid Bookings */}
        {isFullyPaid && (
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </SharedModal>
  );
};

export default PayBooking;