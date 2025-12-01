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
  ExternalLink,
  Truck,
  AlertCircle,
  Info,
  Mail,
  Phone,
  Lock
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
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createPaymentForBooking } = usePayment();

  // Get actual amount due from AR data
  const actualAmountDue = booking?.accounts_receivable?.collectible_amount || 0;
  const totalPayment = booking?.accounts_receivable?.total_payment || 0;
  const isFullyPaid = actualAmountDue === 0;

  // Payment methods with Cash on Delivery as default
  const paymentMethods = [
    {
      value: 'cod',
      label: 'Cash on Delivery',
      description: 'Pay when you receive the shipment',
      icon: Truck,
      color: 'text-blue-600',
      badge: 'No online payment needed'
    },
    {
      value: 'gcash',
      label: 'GCash',
      description: 'Pay instantly via GCash',
      icon: Smartphone,
      color: 'text-purple-600',
      badge: 'Instant payment'
    }
  ];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && booking) {
      setPaymentMethod('cod');
      setShowPaymentMethods(false);
    }
  }, [isOpen, booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking || isFullyPaid) return;

    setIsSubmitting(true);

    try {
      console.log('💰 Starting payment for booking:', booking.id);
      
      const result = await createPaymentForBooking.mutateAsync({
        bookingId: booking.id,
        payment_method: paymentMethod,
        amount: actualAmountDue
      });

      console.log('🔍 PAYMENT RESPONSE:', result);

      if (paymentMethod === 'cod') {
        toast.success('Cash on Delivery payment recorded successfully! Payment will be collected upon delivery.');
        onPaymentSuccess?.();
        onClose();
      } else if (paymentMethod === 'gcash' && result?.checkout_url) {
        toast.success('Redirecting to GCash checkout...');
        // Open Paymongo checkout in new tab
        window.open(result.checkout_url, '_blank', 'noopener,noreferrer');
        
        // Show success message with instructions
        toast.custom((t) => (
          <div className="bg-white border border-green-300 rounded-lg shadow-lg p-4 max-w-md">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <ExternalLink className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">GCash Payment Started</h3>
                <p className="text-sm text-gray-600 mt-1">
                  You've been redirected to the secure payment page. Please complete the payment in the new tab.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
                  >
                    Refresh Status
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        ), { duration: 10000 });
        
        onClose();
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to create payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPaymentMethod('cod');
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
      size="md"
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
              <div className="bg-surface border border-gray-200 rounded-lg p-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentMethods(!showPaymentMethods)}
                  className="w-full flex items-center justify-between p-3
                  bg-surface border border-surface rounded-lg hover:border-gray-400
                  transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {selectedPaymentMethod && (
                      <>
                        <selectedPaymentMethod.icon className={`w-5 h-5 ${selectedPaymentMethod.color}`} />
                        <div className="text-left">
                          <div className="font-medium text-heading">{selectedPaymentMethod.label}</div>
                          <div className="text-xs text-content">{selectedPaymentMethod.description}</div>
                          <div className="text-xs font-medium text-blue-600 mt-1">
                            {selectedPaymentMethod.badge}
                          </div>
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
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-surface bg-surface hover:border-blue-200'
                        }`}
                      >
                        <method.icon className={`w-5 h-5 ${method.color}`} />
                        <div className="text-left flex-1">
                          <div className="font-medium text-heading">{method.label}</div>
                          <div className="text-xs text-content">{method.description}</div>
                          <div className="text-xs font-medium text-blue-600 mt-1">
                            {method.badge}
                          </div>
                        </div>
                        {paymentMethod === method.value && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Instructions based on method */}
            {paymentMethod === 'cod' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Cash on Delivery Instructions
                </h4>
                <div className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-start gap-2">
                    <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                      <Info className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>Your payment of <strong>{formatCurrency(actualAmountDue)}</strong> will be collected when your shipment is delivered.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                      <Lock className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>No online payment is required now. Please have the exact amount ready for the delivery personnel.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                      <AlertCircle className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>Ensure you're available to receive the shipment and make payment at the delivery address.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  How to Pay with GCash
                </h4>
                <ol className="space-y-2 text-sm text-purple-700">
                  <li className="flex items-start gap-2">
                    <div className="bg-purple-100 text-purple-700 font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <span>You'll be redirected to a <strong>secure Paymongo checkout page</strong> in a new tab.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-purple-100 text-purple-700 font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <span>Select <strong>GCash</strong> as your payment method on the checkout page.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-purple-100 text-purple-700 font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <span>Enter your <strong>mobile number</strong> or <strong>email address</strong> registered with GCash.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-purple-100 text-purple-700 font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      4
                    </div>
                    <span>Complete the payment in your <strong>GCash app</strong> when prompted.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-purple-100 text-purple-700 font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      5
                    </div>
                    <span>Return to this page after payment - we'll <strong>automatically update</strong> your payment status.</span>
                  </li>
                </ol>
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Important:</strong> 
                      <ul className="mt-1 space-y-1">
                        <li>• Make sure you have sufficient balance in your GCash account</li>
                        <li>• Keep the GCash app open for faster payment confirmation</li>
                        <li>• Payment status updates may take 1-2 minutes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-green-700">
                    <strong>Secure Transaction:</strong> All transactions are processed securely. 
                    {paymentMethod === 'gcash' && " You'll be redirected to a secure Paymongo checkout page that is PCI-DSS compliant."}
                    {paymentMethod === 'cod' && " Your payment details are protected and will only be collected upon verified delivery."}
                  </div>
                </div>
              </div>

              {/* Total Payment Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-600">Total Payment</div>
                    <div className="text-xs text-gray-500">Amount due for booking #{booking.booking_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{formatCurrency(actualAmountDue)}</div>
                    <div className="text-xs text-gray-500">One-time payment</div>
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
                  className={`px-4 py-2.5 text-sm text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium ${
                    paymentMethod === 'cod' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : paymentMethod === 'cod' ? (
                    <>
                      <Truck className="w-4 h-4" />
                      Confirm Cash on Delivery
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      Pay with GCash
                      <ExternalLink className="w-3 h-3" />
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