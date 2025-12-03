// PayBooking.jsx - Updated version
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query'; // Added this import
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
  Lock,
  Package,
  Loader2
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
  const queryClient = useQueryClient(); // Added queryClient for manual invalidation

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
    console.log('💰 Payment method:', paymentMethod);
    console.log('💰 Amount due:', actualAmountDue);
    
    const result = await createPaymentForBooking.mutateAsync({
      bookingId: booking.id,
      payment_method: paymentMethod,
      amount: actualAmountDue
    });

    console.log('🔍 PAYMENT RESPONSE:', result);

    // Enhanced cache invalidation
    const promises = [
      queryClient.invalidateQueries({ queryKey: ['payments'] }),
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] }),
      queryClient.invalidateQueries({ queryKey: ['accounts-receivables'] }),
      // Invalidate specific booking queries
      queryClient.invalidateQueries({ 
        queryKey: ['customer-bookings', booking.id] 
      }),
      queryClient.invalidateQueries({ 
        queryKey: ['accounts-receivables', 'booking', booking.id] 
      }),
      // Force refetch active queries
      queryClient.refetchQueries({ 
        queryKey: ['customer-bookings'],
        type: 'active',
        exact: false
      }),
      queryClient.refetchQueries({ 
        queryKey: ['accounts-receivables'],
        type: 'active',
        exact: false
      })
    ];

    await Promise.allSettled(promises);
    
    console.log('✅ Cache invalidated and refetched');

    if (paymentMethod === 'cod') {
      toast.success('Cash on Delivery payment recorded! Payment will be collected upon delivery.');
      
      // Extra refresh to ensure UI updates
      setTimeout(() => {
        // Refetch the specific booking data
        queryClient.refetchQueries({ 
          queryKey: ['customer-bookings'],
          exact: false
        });
        
        // Close modal and notify parent
        setTimeout(() => {
          onPaymentSuccess?.();
          onClose();
        }, 500);
      }, 1000);
      
    } else if (paymentMethod === 'gcash' && result?.checkout_url) {
      toast.success('Redirecting to GCash checkout...');
      
      // Open Paymongo checkout in new tab
      const newWindow = window.open(result.checkout_url, '_blank', 'noopener,noreferrer');
      
      if (!newWindow) {
        toast.error('Popup blocked. Please allow popups for this site and try again.');
        return;
      }
      
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
                You've been redirected to the secure payment page. After completing payment, the system will automatically update your payment status.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  onClick={() => {
                    // Force refresh all data
                    queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
                    queryClient.invalidateQueries({ queryKey: ['accounts-receivables'] });
                    queryClient.refetchQueries({ type: 'active' });
                    toast.dismiss(t.id);
                    window.location.reload();
                  }}
                  className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors"
                >
                  Refresh Status Now
                </button>
                <button
                  onClick={() => {
                    onClose();
                    toast.dismiss(t.id);
                  }}
                  className="text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-300 transition-colors"
                >
                  Close and Continue
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Note: Payment confirmation may take 1-2 minutes. You can refresh this page later to see updated status.
              </p>
            </div>
          </div>
        </div>
      ), { duration: 15000 });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  } catch (error) {
    console.error('❌ Payment error:', error);
    console.error('❌ Error details:', error.response?.data);
    toast.error(error.response?.data?.message || 'Failed to create payment. Please try again.');
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
      size="sm"
    >
      <div className="max-h-[80vh] overflow-y-auto space-y-4">
        {/* Booking Summary - Matching SendTotalPayment style */}
        <div className="bg-main border border-main rounded-lg p-3">
          <h3 className="text-base font-semibold text-heading mb-2">Booking Details</h3>
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-3 h-3 text-blue-600" />
            <span className="font-medium text-heading text-sm uppercase">Booking #{booking.booking_number}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium text-muted">Customer:</span>
              <p className="text-heading">{booking.first_name} {booking.last_name}</p>
            </div>
            <div>
              <span className="font-medium text-muted">Route:</span>
              <p className="text-heading">
                {booking.origin?.route_name || booking.origin?.name} → {booking.destination?.route_name || booking.destination?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Summary - Matching SendTotalPayment style */}
        <div className="bg-main border border-main rounded-lg p-3 space-y-3">
          <h3 className="text-base font-semibold text-heading">Financial Summary</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center border-b border-main pb-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-heading" />
                <span className="text-muted">Total Amount:</span>
              </div>
              <span className="font-semibold text-heading">{formatCurrency(totalPayment)}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-main pb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-heading" />
                <span className="text-muted">Amount Due:</span>
              </div>
              <span className={`font-bold text-lg ${isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
                {formatCurrency(actualAmountDue)}
              </span>
            </div>
          </div>

          {/* Already Paid Notice */}
          {isFullyPaid && (
            <div className="bg-green-50 border border-green-200 rounded p-3 mt-2">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium text-sm">This booking is fully paid!</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                No payment is required at this time.
              </p>
            </div>
          )}
        </div>

        {/* Payment Method Selection - Only show if not fully paid */}
        {!isFullyPaid && (
          <>
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-heading">Payment Method</h3>
              
              {/* Payment Method Selector */}
              <div className="bg-surface border border-surface rounded-lg p-3">
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Cash on Delivery Instructions
                </h4>
                <div className="space-y-2 text-xs text-blue-700">
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
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  How to Pay with GCash
                </h4>
                <ol className="space-y-2 text-xs text-purple-700">
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
                    <span>Complete the payment in your <strong>GCash app</strong> when prompted.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-purple-100 text-purple-700 font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      4
                    </div>
                    <span>Return to this page after payment - we'll <strong>automatically update</strong> your payment status.</span>
                  </li>
                </ol>
                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Important:</strong> 
                      <ul className="mt-1 space-y-0.5">
                        <li>• Make sure you have sufficient balance in your GCash account</li>
                        <li>• Keep the GCash app open for faster payment confirmation</li>
                        <li>• Payment status updates may take 1-2 minutes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                <div className="flex items-start gap-2">
                  <Shield className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-green-700">
                    <strong>Secure Transaction:</strong> All transactions are processed securely. 
                    {paymentMethod === 'gcash' && " You'll be redirected to a secure Paymongo checkout page that is PCI-DSS compliant."}
                    {paymentMethod === 'cod' && " Your payment details are protected and will only be collected upon verified delivery."}
                  </div>
                </div>
              </div>

              {/* Total Payment Summary - Matching SendTotalPayment style */}
              <div className="bg-main border border-main rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-heading">Total Payment</div>
                    <div className="text-xs text-muted">Amount due for booking #{booking.booking_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-heading">{formatCurrency(actualAmountDue)}</div>
                    <div className="text-xs text-muted">One-time payment</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Matching SendTotalPayment style */}
              <div className="flex justify-end gap-2 pt-3 border-t border-main">
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
                  disabled={isSubmitting || isFullyPaid}
                  className={`text-sm py-2 px-3 font-medium ${
                    isSubmitting ? 'modal-btn-disabled' : 
                    paymentMethod === 'cod' 
                      ? 'modal-btn-primary bg-blue-600 hover:bg-blue-700' 
                      : 'modal-btn-primary bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                      Processing...
                    </>
                  ) : paymentMethod === 'cod' ? (
                    <>
                      <Truck className="w-3 h-3 inline mr-1" />
                      Confirm Cash on Delivery
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-3 h-3 inline mr-1" />
                      Pay with GCash
                      <ExternalLink className="w-3 h-3 inline ml-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Close Button for Fully Paid Bookings */}
        {isFullyPaid && (
          <div className="flex justify-end pt-3 border-t border-main">
            <button
              onClick={handleClose}
              className="modal-btn-cancel text-sm py-2 px-3"
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