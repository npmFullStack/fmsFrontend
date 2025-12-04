// src/components/tables/ManagePaymentsTable.jsx
import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle,
  User,
  Receipt,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency, formatDate, toUpperCase } from '../../utils/formatters';
import toast from 'react-hot-toast';

const ManagePaymentsTable = ({ 
  data = [], 
  onVerify,
  onViewDetails,
  isLoading = false 
}) => {
  const [verifyingPayment, setVerifyingPayment] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Payment status configuration - Updated for "Paid/Not Paid"
  const getStatusConfig = (status) => {
    const config = {
      pending: {
        text: 'Not Paid',
        icon: <Clock className="w-3 h-3" />,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300',
        badgeColor: 'bg-yellow-500'
      },
      verified: {
        text: 'Paid',
        icon: <CheckCircle className="w-3 h-3" />,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
        badgeColor: 'bg-green-500'
      },
      approved: {
        text: 'Paid',
        icon: <CheckCircle className="w-3 h-3" />,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
        badgeColor: 'bg-green-500'
      },
      rejected: {
        text: 'Not Paid',
        icon: <XCircle className="w-3 h-3" />,
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300',
        badgeColor: 'bg-red-500'
      }
    };
    return config[status] || config.pending;
  };

  // Payment method configuration - Updated for blue color
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

  // Handle verify payment (Mark as Paid/Not Paid)
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

  // View receipt image in modal
  const handleViewReceipt = (imageUrl, paymentMethod) => {
    if (paymentMethod === 'gcash' && imageUrl) {
      const fullUrl = `${process.env.REACT_APP_API_URL}/storage/${imageUrl}`;
      setSelectedReceipt(fullUrl);
      setReceiptModalOpen(true);
    } else {
      toast.error('No receipt available for this payment method');
    }
  };

  // Close receipt modal
  const closeReceiptModal = () => {
    setReceiptModalOpen(false);
    setSelectedReceipt(null);
  };

  // View payment details
  const handleViewDetails = (payment) => {
    if (onViewDetails) {
      onViewDetails(payment);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (data.length === 0) return (
    <div className="text-center py-12 text-gray-500">
      <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <p className="text-lg font-medium">No payments found</p>
      <p className="text-sm">All payment records will appear here.</p>
    </div>
  );

  return (
    <>
      {/* Receipt Modal */}
      {receiptModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={closeReceiptModal}
            />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-bold text-gray-900">
                    GCash Receipt
                  </h3>
                  <button
                    onClick={closeReceiptModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex justify-center">
                  <img
                    src={selectedReceipt}
                    alt="GCash Receipt"
                    className="max-w-full max-h-[70vh] object-contain rounded-lg border border-gray-200"
                  />
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => window.open(selectedReceipt, '_blank')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Open in new tab
                  </button>
                </div>
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
                Payment ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                Booking & Client
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
                  {/* Payment ID Column - Removed Date */}
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-bold text-heading">
                      #{payment.id}
                    </div>
                  </td>

                  {/* Booking & Client Column */}
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-muted uppercase font-semibold mb-1">
                          Booking
                        </div>
                        <div className="font-bold text-blue-600 text-xs">
                          {payment.booking?.booking_number || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted uppercase font-semibold mb-1">
                          Client
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-muted" />
                          <span className="font-medium text-heading text-xs">
                            {payment.user?.first_name} {payment.user?.last_name}
                          </span>
                        </div>
                        <div className="text-xs text-muted mt-1 truncate max-w-[150px]">
                          {payment.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Amount & Method Column */}
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-muted uppercase font-semibold mb-1">
                          Amount Paid
                        </div>
                        <div className="text-sm font-bold text-heading">
                          {formatCurrency(payment.amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted uppercase font-semibold mb-1">
                          Method
                        </div>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${methodConfig.bgColor} ${methodConfig.borderColor}`}>
                          {methodConfig.icon}
                          <span className={`text-xs font-medium ${methodConfig.textColor}`}>
                            {methodConfig.text}
                          </span>
                        </div>
                      </div>
                      {payment.payment_method === 'gcash' && payment.gcash_receipt_image && (
                        <div>
                          <button
                            onClick={() => handleViewReceipt(payment.gcash_receipt_image, payment.payment_method)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-xs"
                          >
                            <Eye className="w-3 h-3" />
                            <span className="font-medium">View Receipt</span>
                          </button>
                        </div>
                      )}
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
                    {payment.admin_notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-muted">
                        <div className="font-semibold">Notes:</div>
                        <div className="mt-1 truncate max-w-[200px]">{payment.admin_notes}</div>
                      </div>
                    )}
                  </td>

                  {/* Actions Column - Updated for Paid/Not Paid */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {/* Paid Button - Show for pending/rejected */}
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
                      
                      {/* Not Paid Button - Show for verified/approved */}
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