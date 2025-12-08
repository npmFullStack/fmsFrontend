// src/components/tables/ManagePaymentsTable.jsx
import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Receipt,
  DollarSign,
  X,
  Download,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const ManagePaymentsTable = ({ 
  data = [], 
  onVerify,
  isLoading = false 
}) => {
  const [verifyingPayment, setVerifyingPayment] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Payment status configuration
  const getStatusConfig = (status) => {
    const config = {
      pending: {
        text: 'Not Paid',
        icon: <Clock className="w-3 h-3" />,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300',
      },
      verified: {
        text: 'Paid',
        icon: <CheckCircle className="w-3 h-3" />,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
      },
      approved: {
        text: 'Paid',
        icon: <CheckCircle className="w-3 h-3" />,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
      },
      rejected: {
        text: 'Not Paid',
        icon: <XCircle className="w-3 h-3" />,
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300',
      }
    };
    return config[status] || config.pending;
  };

  // Payment method configuration
  const getMethodConfig = (method) => {
    const config = {
      cod: {
        text: 'Cash on Delivery',
        icon: <CreditCard className="w-3 h-3" />,
        bgColor: 'bg-blue-600',
        textColor: 'text-content',
        borderColor: 'border-blue-200'
      },
      gcash: {
        text: 'GCash',
        icon: <Smartphone className="w-3 h-3" />,
        bgColor: 'bg-blue-700',
        textColor: 'text-content',
        borderColor: 'border-blue-200'
      }
    };
    return config[method] || config.cod;
  };

  // Handle verify payment
  const handleMarkAsPaid = async (paymentId, action) => {
    if (!onVerify) return;
    
    setVerifyingPayment(paymentId);
    try {
      await onVerify(paymentId, action);
      toast.success(`Payment marked as ${action === 'approve' ? 'Paid' : 'Not Paid'} successfully`);
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error(error.response?.data?.message || `Failed to update payment status`);
    } finally {
      setTimeout(() => setVerifyingPayment(null), 500);
    }
  };

  // Get receipt URL - FIXED with proper Laravel storage URL
  const getReceiptUrl = (payment) => {
  if (!payment.gcash_receipt_image) return null;
  
  if (payment.gcash_receipt_image.startsWith('http')) {
    console.log('Full URL already provided:', payment.gcash_receipt_image);
    return payment.gcash_receipt_image;
  }
  
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  console.log('Base URL:', baseUrl);
  console.log('Original image path from API:', payment.gcash_receipt_image);
  
  let imagePath = payment.gcash_receipt_image;
  
  // Handle different path formats
  if (imagePath.startsWith('public/')) {
    imagePath = imagePath.substring(7);
    console.log('After removing "public/":', imagePath);
  }
  
  // Remove leading slash if present
  if (imagePath.startsWith('/')) {
    imagePath = imagePath.substring(1);
    console.log('After removing leading slash:', imagePath);
  }
  
  const fullUrl = `${baseUrl}/storage/${imagePath}`;
  console.log('Final constructed URL:', fullUrl);
  
  return fullUrl;
};

  // View receipt image in modal
  const handleViewReceipt = (payment) => {
    const receiptUrl = getReceiptUrl(payment);
    
    if (payment.payment_method === 'gcash' && receiptUrl) {
      setSelectedReceipt({
        url: receiptUrl,
        paymentId: payment.id,
        bookingNumber: payment.booking?.booking_number || 'N/A'
      });
      setReceiptModalOpen(true);
      setImageError(false); // Reset error state
    } else {
      toast.error('No receipt available for this payment method');
    }
  };

  // Close receipt modal
  const closeReceiptModal = () => {
    setReceiptModalOpen(false);
    setSelectedReceipt(null);
    setImageError(false);
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
    console.error('Failed to load image:', selectedReceipt?.url);
    
    // Test the URL
    if (selectedReceipt?.url) {
      fetch(selectedReceipt.url, { method: 'HEAD' })
        .then(response => {
          console.log('Image URL status:', response.status, response.ok);
          if (!response.ok) {
            toast.error(`Image not found (${response.status}). Check storage link.`);
          }
        })
        .catch(err => {
          console.error('Image fetch error:', err);
          toast.error('Cannot access image. Check CORS and permissions.');
        });
    }
  };

  // Loading state
  if (isLoading && data.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No payments found</p>
        <p className="text-sm">All payment records will appear here.</p>
      </div>
    );
  }

  return (
    <>
      {/* Receipt Modal */}
      {receiptModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-70 transition-opacity"
            onClick={closeReceiptModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-main">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-main bg-main">
              <div>
                <h3 className="text-lg font-bold text-heading">
                  GCash Receipt
                </h3>
                <p className="text-sm text-muted">
                  Payment #{selectedReceipt.paymentId} • Booking #{selectedReceipt.bookingNumber}
                </p>
              </div>
              <button
                onClick={closeReceiptModal}
                className="text-muted hover:text-heading transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-4">
              {imageError ? (
                <div className="flex flex-col items-center justify-center bg-main rounded-lg p-8 mb-4">
                  <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                  <p className="text-heading font-medium mb-2">Failed to load receipt image</p>
                  <p className="text-muted text-sm mb-4 text-center">
                    The image could not be loaded. This could be due to:
                  </p>
                  <div className="text-left text-sm text-muted space-y-2">
                    <p>• The file doesn't exist in storage</p>
                    <p>• Storage link not created (run: php artisan storage:link)</p>
                    <p>• File permission issues</p>
                  </div>
                  <div className="mt-4 p-3 bg-black/20 rounded text-xs">
                    <p className="font-mono break-all">{selectedReceipt.url}</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center bg-main rounded-lg p-4 mb-4">
                  <img
                    src={selectedReceipt.url}
                    alt="GCash Receipt"
                    className="max-w-full max-h-[60vh] object-contain rounded"
                    onError={handleImageError}
                    onLoad={() => console.log('Image loaded successfully:', selectedReceipt.url)}
                  />
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    window.open(selectedReceipt.url, '_blank', 'noopener,noreferrer');
                    toast.success('Opening receipt in new tab');
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors border border-blue-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Open in New Tab
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedReceipt.url;
                    link.download = `receipt_${selectedReceipt.paymentId}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('Receipt download started');
                  }}
                  className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors border border-gray-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="table-container overflow-x-auto">
        <table className="min-w-full divide-y divide-main">
          <thead className="bg-main">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                Booking Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                Amount & Method
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-main">
            {data.map((payment) => {
              const statusConfig = getStatusConfig(payment.status);
              const methodConfig = getMethodConfig(payment.payment_method);
              
              return (
                <tr key={payment.id} className="hover:bg-main transition-colors">
                  {/* Booking Number Column */}
                  <td className="px-4 py-3">
                    <div className="font-bold text-blue-600 text-sm">
                      #{payment.booking?.booking_number || 'N/A'}
                    </div>
                  </td>

                  {/* Client Column */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted" />
                      <div>
                        <div className="font-medium text-heading text-sm">
                          {payment.user?.first_name} {payment.user?.last_name}
                        </div>
                        <div className="text-xs text-muted truncate max-w-[150px]">
                          {payment.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Amount & Method Column */}
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <div className="text-sm font-bold text-heading">
                        {formatCurrency(payment.amount)}
                      </div>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${methodConfig.bgColor} ${methodConfig.borderColor}`}>
                        {methodConfig.icon}
                        <span className={`text-xs font-medium ${methodConfig.textColor}`}>
                          {methodConfig.text}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.textColor}`}>
                      {statusConfig.icon}
                      <span className="font-semibold">
                        {statusConfig.text}
                      </span>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {/* View Receipt Button for GCash */}
                      {payment.payment_method === 'gcash' && payment.gcash_receipt_image && (
                        <button
                          onClick={() => handleViewReceipt(payment)}
                          className="flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span className="font-medium">View Receipt</span>
                        </button>
                      )}
                      
                      {/* Paid Button */}
                      {(payment.status === 'pending' || payment.status === 'rejected') && (
                        <button
                          onClick={() => handleMarkAsPaid(payment.id, 'approve')}
                          disabled={verifyingPayment === payment.id}
                          className="flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        >
                          {verifyingPayment === payment.id ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          <span className="font-medium">
                            {verifyingPayment === payment.id ? 'Processing...' : 'Mark as Paid'}
                          </span>
                        </button>
                      )}
                      
                      {/* Not Paid Button */}
                      {(payment.status === 'verified' || payment.status === 'approved') && (
                        <button
                          onClick={() => handleMarkAsPaid(payment.id, 'reject')}
                          disabled={verifyingPayment === payment.id}
                          className="flex items-center justify-center gap-1 px-2 py-1.5 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        >
                          {verifyingPayment === payment.id ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span className="font-medium">
                            {verifyingPayment === payment.id ? 'Processing...' : 'Mark as Not Paid'}
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ManagePaymentsTable;