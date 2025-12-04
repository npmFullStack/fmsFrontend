// src/components/modals/PayBooking.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  CreditCard, 
  Smartphone, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Info,
  Loader2,
  Receipt,
  Phone,
  Truck,
  User,
  Settings,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const paymentSchema = z.object({
  payment_method: z.enum(['cod', 'gcash'], {
    required_error: "Please select a payment method",
  }),
  amount: z.number()
    .positive("Amount must be positive")
    .min(0.01, "Amount must be at least ₱0.01"),
  reference_number: z.string()
    .optional()
    .or(z.literal('')),
  gcash_receipt_image: z.any().optional(),
});

const paymentMethodOptions = [
  { value: 'cod', label: 'Cash on Delivery', description: 'Pay when your shipment arrives' },
  { value: 'gcash', label: 'GCash', description: 'Pay instantly via GCash' },
];

const PayBooking = ({ 
  isOpen, 
  onClose, 
  booking, 
  onPaymentSuccess,
  onCreatePayment 
}) => {
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState({
    accountName: 'NO*** M',
    accountNumber: '09944435770',
    steps: [
      'Open your GCash app',
      'Go to "Send Money"',
      'Enter GCash number: 09944435770',
      'Enter exact amount to pay',
      'Take a screenshot of the receipt',
      'Upload it below'
    ]
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(paymentSchema),
    mode: 'onChange',
    defaultValues: {
      payment_method: '',
      amount: 0,
      reference_number: '',
      gcash_receipt_image: null
    }
  });

  const paymentMethod = watch('payment_method');
  const amount = watch('amount');

  // Calculate collectible amount
  const collectibleAmount = useMemo(() => {
    return booking?.accounts_receivable?.collectible_amount || 0;
  }, [booking]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && booking) {
      reset({
        payment_method: '',
        amount: collectibleAmount,
        reference_number: '',
        gcash_receipt_image: null
      });
      setShowPaymentSetup(false);
      setUploadedFile(null);
      setPreviewUrl('');
      setIsSubmitting(false);
    }
  }, [isOpen, booking, reset, collectibleAmount]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, JPG, GIF)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size should be less than 2MB');
      return;
    }

    setUploadedFile(file);
    setValue('gcash_receipt_image', file, { shouldValidate: true });
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Remove uploaded file
  const removeFile = () => {
    setUploadedFile(null);
    setValue('gcash_receipt_image', null);
    setPreviewUrl('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  // Handle payment method selection
  const handleMethodSelect = (method) => {
    setValue('payment_method', method, { shouldValidate: true });
    setShowPaymentSetup(false);
    
    if (method === 'cod') {
      toast.success('COD selected! Payment will be collected upon delivery.');
    } else if (method === 'gcash') {
      toast.success('GCash selected! Please upload your receipt.');
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    if (!booking) return;

    setIsSubmitting(true);
    
    try {
      const paymentData = {
        booking_id: booking.id,
        payment_method: data.payment_method,
        amount: parseFloat(data.amount),
        reference_number: data.reference_number || '',
      };

      // Add file if GCash
      if (data.payment_method === 'gcash' && data.gcash_receipt_image) {
        paymentData.gcash_receipt_image = data.gcash_receipt_image;
      }

      console.log('Submitting payment:', paymentData);

      // Call the mutation
      if (onCreatePayment) {
        const result = await onCreatePayment(paymentData);
        
        if (result) {
          toast.success(
            data.payment_method === 'cod' 
              ? 'COD payment recorded! Payment will be collected upon delivery.' 
              : 'Payment submitted successfully! Please wait for admin verification.',
            {
              duration: 5000,
              icon: '✅'
            }
          );
          
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
          
          onClose();
        }
      } else {
        toast.error('Payment submission function not available');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error(
        error.response?.data?.message || 
        'Failed to submit payment. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !booking) return null;

  const ar = booking.accounts_receivable;
  const bookingNumber = booking.booking_number || 'N/A';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />

        {/* Modal container - Matching AddCharge size */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-lg leading-6 font-bold text-gray-900">
                Make Payment
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Booking #{bookingNumber}
              </p>
            </div>

            {/* Amount Due - Fixed Amount Display (non-editable) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Amount Due</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(collectibleAmount)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Fixed Amount
                  </div>
                  <p className="text-xs text-blue-500 mt-1">Cannot be edited</p>
                </div>
              </div>
              <input type="hidden" value={collectibleAmount} {...register('amount', { valueAsNumber: true })} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Payment Method Selection - Matching AddCharge styling */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="modal-label text-heading">Payment Method</label>
                  <button
                    type="button"
                    onClick={() => setShowPaymentSetup(!showPaymentSetup)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    {showPaymentSetup ? 'Hide Options' : 'Setup'}
                  </button>
                </div>

                {!paymentMethod ? (
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No payment method selected</p>
                    <p className="text-xs text-gray-500 mt-1">Click "Setup" to choose a method</p>
                  </div>
                ) : (
                  <div className={`border rounded-lg p-4 transition-all ${
                    paymentMethod === 'cod' 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' 
                      : 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${
                          paymentMethod === 'cod' ? 'bg-blue-100' : 'bg-blue-100'
                        }`}>
                          {paymentMethod === 'cod' ? (
                            <Truck className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Smartphone className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            {paymentMethod === 'cod' ? 'Cash on Delivery' : 'GCash'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {paymentMethod === 'cod' 
                              ? 'Pay when your shipment arrives' 
                              : 'Pay instantly via GCash'}
                          </div>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                )}
                
                {showPaymentSetup && (
                  <div className="mt-3 space-y-2">
                    {paymentMethodOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleMethodSelect(option.value)}
                        className={`w-full text-left p-3 border rounded-lg transition-all flex items-center justify-between ${
                          paymentMethod === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 ${
                            paymentMethod === option.value ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            {option.value === 'cod' ? (
                              <Truck className="w-4 h-4 text-gray-700" />
                            ) : (
                              <Smartphone className="w-4 h-4 text-gray-700" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                          </div>
                        </div>
                        {paymentMethod === option.value && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {errors.payment_method && (
                  <p className="mt-2 text-sm text-red-600">{errors.payment_method.message}</p>
                )}
              </div>

              {/* Hidden payment method field */}
              <input type="hidden" {...register('payment_method')} />

              {/* GCash Instructions */}
              {paymentMethod === 'gcash' && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start mb-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800">Payment Instructions</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Send payment to the following GCash account:
                      </p>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Account Number:</span>
                      </div>
                      <span className="font-mono font-bold text-gray-900">
                        {paymentInstructions.accountNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Account Name:</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {paymentInstructions.accountName}
                      </span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-2">
                    {paymentInstructions.steps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-xs font-bold text-blue-700">{index + 1}</span>
                        </div>
                        <p className="text-sm text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Number (for GCash) */}
              {paymentMethod === 'gcash' && (
                <div className="mb-6">
                  <label className="modal-label text-heading">Reference Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter GCash reference number"
                    className="modal-input"
                    {...register('reference_number')}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Found in your GCash transaction receipt
                  </p>
                </div>
              )}

              {/* Receipt Upload (for GCash) */}
              {paymentMethod === 'gcash' && (
                <div className="mb-6">
                  <label className="modal-label text-heading">Upload Receipt Screenshot</label>
                  
                  {!uploadedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drag & drop your receipt screenshot here, or click to browse
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Supports JPG, PNG up to 2MB
                      </p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                          <Upload className="w-4 h-4 mr-2" />
                          Browse Files
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <Receipt className="w-5 h-5 text-blue-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {uploadedFile.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      {previewUrl && (
                        <div className="p-4">
                          <img
                            src={previewUrl}
                            alt="Receipt preview"
                            className="max-h-48 mx-auto rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {errors.gcash_receipt_image && (
                    <p className="mt-2 text-sm text-red-600">{errors.gcash_receipt_image.message}</p>
                  )}
                </div>
              )}

              {/* COD Notice */}
              {paymentMethod === 'cod' && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800">Important Notice</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Payment will be collected in cash when your shipment arrives</li>
                        <li>• Please prepare exact amount: {formatCurrency(collectibleAmount)}</li>
                        <li>• Driver will provide an official receipt upon payment</li>
                        <li>• Your booking status will update to "Payment Pending"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer - Matching AddCharge buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-main mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="modal-btn-cancel"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={!isValid || isSubmitting || !paymentMethod}
                  className={`modal-btn-primary ${(!isValid || isSubmitting || !paymentMethod) ? 'modal-btn-disabled' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'cod' ? 'Confirm COD' : 'Submit Payment'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayBooking;