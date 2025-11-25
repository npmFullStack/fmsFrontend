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
  ChevronDown,
  ChevronUp,
  Building,
  ExternalLink
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
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createPaymentForBooking } = usePayment();

  // Get actual amount due from AR data
  const actualAmountDue = booking?.accounts_receivable?.collectible_amount || 0;
  const totalPayment = booking?.accounts_receivable?.total_payment || 0;
  const isFullyPaid = actualAmountDue === 0;

  // Payment methods configuration - only GCash, PayMongo, Bank Transfer
  const paymentMethods = [
    {
      value: 'gcash',
      label: 'GCash',
      description: 'Pay via GCash checkout',
      icon: Smartphone,
      color: 'text-green-600'
    },
    {
      value: 'paymongo',
      label: 'PayMongo',
      description: 'Card/Bank/GCash checkout',
      icon: CreditCard,
      color: 'text-blue-600'
    },
    {
      value: 'bank_transfer',
      label: 'Bank Transfer',
      description: 'Manual bank transfer',
      icon: Building,
      color: 'text-purple-600'
    }
  ];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && booking) {
      setPaymentMethod('gcash');
      setShowPaymentMethods(false);
    }
  }, [isOpen, booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking || isFullyPaid) return;

    setIsSubmitting(true);

    try {
      const result = await createPaymentForBooking.mutateAsync({
        bookingId: booking.id,
        payment_method: paymentMethod,
        amount: actualAmountDue // Always full amount
      });

      console.log('🔍 PAYMENT RESPONSE DATA:', result);

      // Handle checkout redirect for GCash and PayMongo
      if (['gcash', 'paymongo'].includes(paymentMethod) && result?.checkout_url) {
        toast.success(`Redirecting to ${selectedPaymentMethod?.label} checkout...`);
        
        // Open checkout in new tab
        const newWindow = window.open(result.checkout_url, '_blank', 'noopener,noreferrer');
        
        if (newWindow) {
          // Set up polling to check payment status
          const pollInterval = setInterval(() => {
            // You'll need to implement payment status checking
            // This is a simplified version
            console.log('Polling payment status...');
          }, 5000);

          // Clean up interval after 10 minutes
          setTimeout(() => clearInterval(pollInterval), 10 * 60 * 1000);
        }
        
        onPaymentSuccess?.();
        onClose();
      } 
      // Handle bank transfer (no redirect)
      else if (paymentMethod === 'bank_transfer') {
        toast.success('Payment instructions sent! Please complete the bank transfer.');
        onPaymentSuccess?.();
        onClose();
      }
      else {
        // Fallback
        toast.success('Payment initiated successfully!');
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
    setPaymentMethod('gcash');
    setShowPaymentMethods(false);
    onClose();
  };

  // Get selected payment method
  const selectedPaymentMethod = paymentMethods.find(method => method.value === paymentMethod);

  if (!isOpen || !booking) return null;

  return (
    <SharedModal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Make Payment" 
      size="sm"
    >
      <div className="max-h-[80vh] overflow-y-auto space-y-4">
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

        {/* Payment Method Selection - Only show if not fully paid */}
        {!isFullyPaid && (
          <>
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-heading">Payment Method</h3>
              
              {/* Payment Method Selector */}
              <div className="bg-main border border-main rounded-lg p-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentMethods(!showPaymentMethods)}
                  className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {selectedPaymentMethod && (
                      <>
                        <selectedPaymentMethod.icon className={`w-5 h-5 ${selectedPaymentMethod.color}`} />
                        <div className="text-left">
                          <div className="font-medium text-heading">{selectedPaymentMethod.label}</div>
                          <div className="text-xs text-muted">{selectedPaymentMethod.description}</div>
                        </div>
                      </>
                    )}
                  </div>
                  {showPaymentMethods ? (
                    <ChevronUp className="w-4 h-4 text-muted" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted" />
                  )}
                </button>

                {/* Payment Methods Dropdown */}
                {showPaymentMethods && (
                  <div className="mt-3 space-y-2">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(method.value);
                          setShowPaymentMethods(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          paymentMethod === method.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <method.icon className={`w-5 h-5 ${method.color}`} />
                        <div className="text-left">
                          <div className="font-medium text-heading">{method.label}</div>
                          <div className="text-xs text-muted">{method.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-700">
                  <strong>Full Payment Required:</strong> You will be paying the full amount of{' '}
                  <span className="font-bold">{formatCurrency(actualAmountDue)}</span>. 
                  {paymentMethod === 'bank_transfer' && ' Please check your email for bank transfer instructions after confirmation.'}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-green-700">
                    <strong>Secure Payment:</strong> All transactions are encrypted and secure. 
                    {paymentMethod !== 'bank_transfer' && ' You will be redirected to a secure checkout page.'}
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
                  disabled={isSubmitting || isFullyPaid}
                  className="px-4 py-2.5 text-sm text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay {formatCurrency(actualAmountDue)}
                      {paymentMethod !== 'bank_transfer' && <ExternalLink className="w-3 h-3" />}
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