// [file name]: PayBooking.jsx
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  TrendingUp,
  Calculator,
  Shield,
  Clipboard,
  SmartphoneIcon
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
  const [paymentData, setPaymentData] = useState(null);

  const { createPaymentForBooking } = usePayment();

  // Get actual amount due from AR data
  const actualAmountDue = booking?.accounts_receivable?.collectible_amount || 0;
  const totalPayment = booking?.accounts_receivable?.total_payment || 0;
  const isFullyPaid = actualAmountDue === 0;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && booking) {
      setAmount(actualAmountDue > 0 ? actualAmountDue.toString() : '');
      setGcashMobile('');
      setPaymentMethod('gcash');
      setPaymentData(null);
    }
  }, [isOpen, booking, actualAmountDue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking || !amount || (paymentMethod === 'gcash' && !gcashMobile)) return;

    const paymentAmount = parseFloat(amount);
    
    // Validation
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (paymentAmount < 1) {
      toast.error('Minimum payment amount is ₱1.00');
      return;
    }

    if (paymentAmount > actualAmountDue) {
      toast.error(`Payment amount cannot exceed ${formatCurrency(actualAmountDue)}`);
      return;
    }

    const formattedAmount = parseFloat(paymentAmount.toFixed(2));
    setIsSubmitting(true);

    try {
      const result = await createPaymentForBooking.mutateAsync({
        bookingId: booking.id,
        payment_method: paymentMethod,
        amount: formattedAmount,
        gcash_mobile_number: paymentMethod === 'gcash' ? gcashMobile : undefined
      });

      console.log('🔍 PAYMENT RESPONSE DATA:', result);

      // Handle different payment methods
      if (paymentMethod === 'paymongo') {
        if (result?.checkout_url) {
          // If there's a checkout URL, redirect to it
          window.open(result.checkout_url, '_blank', 'noopener,noreferrer');
          toast.success('Redirecting to payment gateway...');
          onPaymentSuccess?.();
          onClose();
        } else if (result?.client_key && result?.payment_intent_id) {
          // Show instructions instead of a non-working URL
          setPaymentData(result);
          toast.success('Payment intent created! Complete payment using the instructions below.');
        } else {
          toast.success('Payment intent created!');
          onPaymentSuccess?.();
          onClose();
        }
      } else {
        // GCash payment
        toast.success('GCash payment initiated successfully! Please complete the payment in your GCash app.');
        onPaymentSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setGcashMobile('');
    setPaymentMethod('gcash');
    setPaymentData(null);
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

  // Copy reference number to clipboard
  const copyReferenceNumber = () => {
    if (paymentData?.payment_intent_id) {
      navigator.clipboard.writeText(paymentData.payment_intent_id);
      toast.success('Reference number copied to clipboard!');
    }
  };

  // Quick payment buttons - fixed to ensure numbers
  const quickPaymentOptions = [
    { label: 'Full Amount', amount: Number(actualAmountDue) },
    { label: '50%', amount: Number(actualAmountDue * 0.5) },
    { label: '25%', amount: Number(actualAmountDue * 0.25) },
  ].filter(option => option.amount >= 1);

  if (!isOpen || !booking) return null;

  return (
    <SharedModal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Make Payment" 
      size="md"
    >
      <div className="max-h-[80vh] overflow-y-auto space-y-4">
        {/* Debug Info - Remove after testing */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Payment Method: {paymentMethod}</p>
            <p>Payment Data: {paymentData ? JSON.stringify(paymentData) : 'null'}</p>
          </div>
        )}

        {/* PayMongo Instructions Section */}
        {paymentData && paymentMethod === 'paymongo' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <SmartphoneIcon className="w-6 h-6 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-800">Complete GCash Payment</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your payment intent has been created. Please follow these steps to complete your payment:
                </p>
              </div>
            </div>
            
            <div className="bg-white border border-blue-300 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Clipboard className="w-4 h-4" />
                GCash Payment Instructions:
              </h5>
              <ol className="list-decimal list-inside space-y-3 text-sm text-blue-800">
                <li className="font-medium">Open your GCash app</li>
                <li className="font-medium">Go to "Pay Bills" section</li>
                <li className="font-medium">Select "Other Bills" or "Online Payment"</li>
                <li className="font-medium">
                  Look for <span className="font-bold">PayMongo</span> in your recent transactions or billers
                </li>
                <li className="font-medium">Enter the amount: <span className="font-bold">{formatCurrency(parseFloat(amount))}</span></li>
                <li className="font-medium">Complete the payment in the GCash app</li>
                <li className="font-medium">Return here and click "I've Completed Payment"</li>
              </ol>

              {/* Reference Number */}
              {paymentData?.payment_intent_id && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Reference Number:</p>
                      <p className="font-mono text-sm text-gray-800">{paymentData.payment_intent_id}</p>
                    </div>
                    <button
                      onClick={copyReferenceNumber}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Keep this reference number for your records.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  toast.success('Thank you! We will verify your payment shortly.');
                  onPaymentSuccess?.();
                  onClose();
                }}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                I've Completed Payment
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Booking Summary */}
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

        {/* Payment Method Selection - Only show if no payment data and not fully paid */}
        {!isFullyPaid && !paymentData && (
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
                  <span className="text-xs text-gray-500 mt-1">Card/Bank/GCash</span>
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
                    min="1"
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
                        onClick={() => setAmount(Number(option.amount).toFixed(2))}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors border border-blue-200"
                      >
                        {option.label} ({formatCurrency(Number(option.amount))})
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
                    <li>• Payment will be processed through PayMongo</li>
                    <li>• You'll receive instructions to complete payment in GCash</li>
                    <li>• Payment verification is automatic</li>
                    <li>• Keep your reference number for tracking</li>
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