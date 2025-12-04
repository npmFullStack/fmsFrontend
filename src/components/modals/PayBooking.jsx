// src/components/modals/PayBooking.jsx
import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  Truck,
  User
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

const PayBooking = ({ 
  isOpen, 
  onClose, 
  booking, 
  onPaymentSuccess,
  onCreatePayment 
}) => {
  const [selectedMethod, setSelectedMethod] = useState('');
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
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(paymentSchema),
    mode: 'onChange',
    defaultValues: {
      payment_method: '',
      amount: booking?.accounts_receivable?.collectible_amount || 0,
      reference_number: '',
      gcash_receipt_image: null
    }
  });

  const paymentMethod = watch('payment_method');
  const amount = watch('amount');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && booking) {
      reset({
        payment_method: '',
        amount: booking.accounts_receivable?.collectible_amount || 0,
        reference_number: '',
        gcash_receipt_image: null
      });
      setSelectedMethod('');
      setUploadedFile(null);
      setPreviewUrl('');
    }
  }, [isOpen, booking, reset]);

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
    setValue('gcash_receipt_image', file);
    
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
    setSelectedMethod(method);
    setValue('payment_method', method, { shouldValidate: true });
    
    if (method === 'cod') {
      toast.success('COD selected! Payment will be collected upon delivery.');
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
  const collectibleAmount = ar?.collectible_amount || 0;
  const bookingNumber = booking.booking_number || 'N/A';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />

        {/* Modal container */}
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

            {/* Amount Due */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Amount Due</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(collectibleAmount)}
                  </p>
                </div>
                <CreditCard className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {/* COD Option */}
                  <button
                    type="button"
                    onClick={() => handleMethodSelect('cod')}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                      selectedMethod === 'cod'
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${
                        selectedMethod === 'cod' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Truck className="w-5 h-5 text-gray-700" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Cash on Delivery</div>
                        <div className="text-sm text-gray-500">
                          Pay when your shipment arrives
                        </div>
                      </div>
                    </div>
                    {selectedMethod === 'cod' && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </button>

                  {/* GCash Option */}
                  <button
                    type="button"
                    onClick={() => handleMethodSelect('gcash')}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                      selectedMethod === 'gcash'
                        ? 'border-green-500 bg-green-50 ring-2 ring-green-100'
                        : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${
                        selectedMethod === 'gcash' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Smartphone className="w-5 h-5 text-gray-700" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">GCash</div>
                        <div className="text-sm text-gray-500">
                          Pay instantly via GCash
                        </div>
                      </div>
                    </div>
                    {selectedMethod === 'gcash' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </button>
                </div>
                {errors.payment_method && (
                  <p className="mt-2 text-sm text-red-600">{errors.payment_method.message}</p>
                )}
              </div>

              {/* Hidden payment method field */}
              <input type="hidden" {...register('payment_method')} />

              {/* Amount (editable) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₱</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={collectibleAmount}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    {...register('amount', { 
                      valueAsNumber: true,
                      onChange: (e) => {
                        const value = parseFloat(e.target.value);
                        if (value > collectibleAmount) {
                          setValue('amount', collectibleAmount);
                        }
                      }
                    })}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Maximum: {formatCurrency(collectibleAmount)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setValue('amount', collectibleAmount)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Pay Full Amount
                  </button>
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              {/* GCash Instructions */}
              {selectedMethod === 'gcash' && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start mb-3">
                    <Info className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-green-800">Payment Instructions</h4>
                      <p className="text-sm text-green-700 mt-1">
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
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-xs font-bold text-green-700">{index + 1}</span>
                        </div>
                        <p className="text-sm text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Number (for GCash) */}
              {selectedMethod === 'gcash' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter GCash reference number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    {...register('reference_number')}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Found in your GCash transaction receipt
                  </p>
                </div>
              )}

              {/* Receipt Upload (for GCash) */}
              {selectedMethod === 'gcash' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Receipt Screenshot
                  </label>
                  
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
                          <Receipt className="w-5 h-5 text-green-500 mr-2" />
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
              {selectedMethod === 'cod' && (
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

              {/* Footer */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={!isValid || isSubmitting || !selectedMethod}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {selectedMethod === 'cod' ? 'Confirm COD' : 'Submit Payment'}
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