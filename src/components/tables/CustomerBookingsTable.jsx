// src/components/tables/CustomerBookingsTable.jsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  Ship,
  User,
  Weight,
  Box,
  ArrowRight,
  Clock,
  ChevronDown,
  ChevronUp,
  CreditCard,
  DollarSign,
  MapPin,
  Container,
  UserCheck,
  UserCog,
  Download,
  FileText,
  Calculator,
  AlertCircle,
  BadgeCheck,
  Receipt,
  Shield,
  Bell,
  Loader2,
  Printer
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

const CustomerBookingsTable = ({ 
  data = [],
  onPay,
  onDownloadStatement,
  isLoading = false,
  getChargesBreakdown,
  getCargoMonitoringData
}) => {
  const [expandedCards, setExpandedCards] = useState({});
  const [processingPayment, setProcessingPayment] = useState(null);

  const toggleCard = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate total weight from items
  const calculateTotalWeight = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      const weight = parseFloat(item.weight) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (weight * quantity);
    }, 0);
  };

  // Calculate total number of items
  const calculateTotalItems = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
  };

  // Format weight display
  const formatWeight = (weight) => {
    return `${parseFloat(weight).toFixed(2)} kg`;
  };

  // Get the main display status that considers both approval and shipping status
  const getDisplayStatus = (booking) => {
    if (booking.status === 'pending') {
      return 'Pending Approval';
    }
    
    if (booking.cargo_monitoring && booking.cargo_monitoring.current_status) {
      return booking.cargo_monitoring.current_status;
    }
    
    const statusMap = {
      'pending': 'Pending',
      'picked_up': 'Picked Up',
      'origin_port': 'Origin Port', 
      'in_transit': 'In Transit',
      'destination_port': 'Destination Port',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered'
    };
    
    return statusMap[booking.booking_status] || 'Processing';
  };

  // Status badge configuration - MATCHED TO BookingTable.jsx
  const getBookingStatusBadge = (status, isFullyPaid = false, isPaymentPending = false) => {
    if (status === 'Pending Approval') {
      return 'bg-yellow-500 text-white border-yellow-600';
    }
    
    if (isPaymentPending) {
      return 'bg-purple-500 text-white border-purple-600';
    }
    
    if (isFullyPaid) {
      return 'bg-green-500 text-white border-green-600';
    }
    
    const statusConfig = {
      'Pending': 'bg-gray-500 text-white border-gray-600',
      'Processing': 'bg-blue-500 text-white border-blue-600',
      'Picked Up': 'bg-blue-500 text-white border-blue-600',
      'Origin Port': 'bg-purple-500 text-white border-purple-600',
      'In Transit': 'bg-orange-500 text-white border-orange-600',
      'Destination Port': 'bg-indigo-500 text-white border-indigo-600',
      'Out for Delivery': 'bg-yellow-500 text-black border-yellow-600',
      'Delivered': 'bg-green-500 text-white border-green-600'
    };
    return statusConfig[status] || 'bg-gray-500 text-white border-gray-600';
  };

  // Status icon - MATCHED TO BookingTable.jsx
  const getBookingStatusIcon = (status, isFullyPaid = false, isPaymentPending = false) => {
    if (status === 'Pending Approval') {
      return <Clock className="w-4 h-4" />;
    }
    
    if (isPaymentPending) {
      return <Shield className="w-4 h-4" />;
    }
    
    if (isFullyPaid) {
      return <BadgeCheck className="w-4 h-4" />;
    }
    
    const iconConfig = {
      'Pending': <Clock className="w-4 h-4" />,
      'Processing': <Clock className="w-4 h-4" />,
      'Picked Up': <Truck className="w-4 h-4" />,
      'Origin Port': <Ship className="w-4 h-4" />,
      'In Transit': <Ship className="w-4 h-4" />,
      'Destination Port': <MapPin className="w-4 h-4" />,
      'Out for Delivery': <Truck className="w-4 h-4" />,
      'Delivered': <CheckCircle className="w-4 h-4" />
    };
    return iconConfig[status] || <Clock className="w-4 h-4" />;
  };

  // Status icon for timeline
  const getStatusIcon = (status) => {
    const iconConfig = {
      'Pending': <Clock className="w-4 h-4" />,
      'Picked Up': <Truck className="w-4 h-4" />,
      'Origin Port': <Ship className="w-4 h-4" />,
      'In Transit': <Ship className="w-4 h-4" />,
      'Destination Port': <MapPin className="w-4 h-4" />,
      'Delivered': <CheckCircle className="w-4 h-4" />
    };
    return iconConfig[status] || <Clock className="w-4 h-4" />;
  };

  // Check if booking is COD
  const isCOD = (booking) => {
    if (booking.accounts_receivable) {
      return booking.accounts_receivable.payment_method === 'cod';
    }
    return false;
  };

  // Check if COD is pending (COD selected but not paid yet)
  const isCODPending = (booking) => {
    if (booking.accounts_receivable) {
      const ar = booking.accounts_receivable;
      return ar.payment_method === 'cod' && !ar.is_paid && ar.collectible_amount > 0;
    }
    return false;
  };

  // Check if GCash payment is pending verification
  const isGCashPendingVerification = (booking) => {
    if (booking.accounts_receivable) {
      const ar = booking.accounts_receivable;
      return ar.payment_method === 'gcash' && !ar.is_paid && ar.collectible_amount > 0;
    }
    return false;
  };

  // Check if booking is fully paid
  const isFullyPaid = (booking) => {
    if (booking.accounts_receivable) {
      const ar = booking.accounts_receivable;
      return ar.is_paid === true || ar.collectible_amount <= 0;
    }
    return false;
  };

  // Get total payment due from AR record
  const getTotalPaymentDue = (booking) => {
    if (booking.accounts_receivable) {
      const ar = booking.accounts_receivable;
      
      // If COD pending, return 0 (no pay button)
      if (isCODPending(booking)) {
        return 0;
      }
      
      // If fully paid, return 0
      if (isFullyPaid(booking)) {
        return 0;
      }
      
      // If GCash pending verification, return 0
      if (isGCashPendingVerification(booking)) {
        return 0;
      }
      
      // Return the collectible amount
      return ar.collectible_amount > 0 ? ar.collectible_amount : 0;
    }
    return 0;
  };

  // Check if AR record exists and has payment data
  const hasPaymentData = (booking) => {
    return booking.accounts_receivable && booking.accounts_receivable.total_payment > 0;
  };

  // Check if payment is being calculated (no AR record or no payment set)
  const isPaymentPending = (booking) => {
    return !booking.accounts_receivable || 
           !booking.accounts_receivable.total_payment || 
           booking.accounts_receivable.total_payment === 0;
  };

  // Calculate due date based on delivery date and terms
  const getDueDate = (booking) => {
    if (!booking.accounts_receivable) return null;
    
    let deliveryDate = null;
    
    if (booking.cargo_monitoring && booking.cargo_monitoring.delivered_at) {
      deliveryDate = new Date(booking.cargo_monitoring.delivered_at);
    } 
    else if (booking.delivery_date) {
      deliveryDate = new Date(booking.delivery_date);
    }
    else {
      return null;
    }
    
    const terms = booking.terms || 0;
    const dueDate = new Date(deliveryDate);
    dueDate.setDate(dueDate.getDate() + terms);
    
    return dueDate;
  };

  // Check if payment is overdue
  const isPaymentOverdue = (booking) => {
    const dueDate = getDueDate(booking);
    if (!dueDate) return false;
    
    return new Date() > dueDate;
  };

  // Generate billing statement data for download
  const generateBillingStatement = (booking) => {
    const dueDate = getDueDate(booking);
    
    const statementData = {
      bookingNumber: booking.booking_number,
      hwbNumber: booking.hwb_number,
      customerName: `${booking.first_name} ${booking.last_name}`,
      bookingDate: formatDate(booking.created_at),
      route: `${booking.origin?.route_name || booking.origin?.name || 'N/A'} → ${booking.destination?.route_name || booking.destination?.name || 'N/A'}`,
      containerInfo: `${booking.container_quantity} x ${booking.container_size?.size || booking.container_size?.name}`,
      vanNumber: booking.van_number,
      items: booking.items || [],
      totalWeight: calculateTotalWeight(booking.items),
      totalItems: calculateTotalItems(booking.items),
      totalAmount: booking.accounts_receivable?.total_payment || 0,
      balanceDue: booking.accounts_receivable?.collectible_amount || 0,
      status: getDisplayStatus(booking),
      shippingLine: booking.shipping_line?.name || 'Not specified',
      truckingCompany: booking.truck_comp?.name || 'Not specified',
      shipper: `${booking.shipper_first_name} ${booking.shipper_last_name}`,
      consignee: `${booking.consignee_first_name} ${booking.consignee_last_name}`,
      departureDate: booking.departure_date ? formatDate(booking.departure_date) : 'Not specified',
      deliveryDate: booking.delivery_date ? formatDate(booking.delivery_date) : 'Not specified',
      dueDate: dueDate ? formatDate(dueDate) : 'Not specified',
      isOverdue: isPaymentOverdue(booking),
      isFullyPaid: isFullyPaid(booking),
      paymentMethod: booking.accounts_receivable?.payment_method || 'Not specified',
      isCOD: isCOD(booking)
    };
    
    return statementData;
  };

  const handleDownloadStatement = (booking) => {
    const statementData = generateBillingStatement(booking);
    if (onDownloadStatement) {
      onDownloadStatement(statementData);
    }
  };

  // Handle pay button click
  const handlePayButtonClick = async (booking) => {
    setProcessingPayment(booking.id);
    try {
      if (onPay) {
        onPay(booking);
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
    } finally {
      setTimeout(() => setProcessingPayment(null), 500);
    }
  };

  // Get payment status text
  const getPaymentStatusText = (booking) => {
    if (isFullyPaid(booking)) {
      return 'Fully Paid';
    }
    
    if (isCODPending(booking)) {
      return 'COD - Payment Upon Delivery';
    }
    
    if (isGCashPendingVerification(booking)) {
      return 'GCash Payment Pending Verification';
    }
    
    if (isPaymentPending(booking)) {
      return 'Payment Calculation Pending';
    }
    
    const totalDue = getTotalPaymentDue(booking);
    if (totalDue > 0) {
      return `Balance Due: ${formatCurrency(totalDue)}`;
    }
    
    return 'Payment Status Unknown';
  };

  if (isLoading) return (
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (data.length === 0) return (
    <div className="text-center py-12 text-muted">
      <Package className="w-16 h-16 mx-auto mb-4 text-muted" />
      <p className="text-lg font-medium">No bookings found</p>
      <p className="text-sm">Your bookings will appear here once approved.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const totalWeight = calculateTotalWeight(item.items);
        const totalItems = calculateTotalItems(item.items);
        const isExpanded = expandedCards[item.id];
        const displayStatus = getDisplayStatus(item);
        const fullyPaid = isFullyPaid(item);
        const codPending = isCODPending(item);
        const gcashPending = isGCashPendingVerification(item);
        const totalPaymentDue = getTotalPaymentDue(item);
        const hasPayment = hasPaymentData(item);
        const paymentPending = isPaymentPending(item);
        const dueDate = getDueDate(item);
        const isOverdue = isPaymentOverdue(item);
        const isDelivered = displayStatus === 'Delivered';
        const hasARRecord = !!item.accounts_receivable;
        const isApproved = item.status === 'approved';
        const codBooking = isCOD(item);
        const paymentStatusText = getPaymentStatusText(item);

        // Get cargo monitoring data
        const cargoMonitoring = getCargoMonitoringData ? getCargoMonitoringData(item.id) : item.cargo_monitoring;
        
        // Get simplified charges breakdown
        const chargesBreakdown = getChargesBreakdown ? getChargesBreakdown(item.id) : null;

        return (
          <div
            key={item.id}
            className="bg-surface rounded-lg border border-main overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              {/* Header with Total Amount Prominently Displayed */}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-3">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted" />
                    <span className="font-semibold text-heading">{item.first_name} {item.last_name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 ml-4">
                    {item.booking_number && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-muted">BOOKING #:</span>
                        <span className="text-content font-mono font-semibold">{item.booking_number}</span>
                      </div>
                    )}
                    {item.hwb_number && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-muted">HWB #:</span>
                        <span className="text-content font-mono font-semibold">{item.hwb_number}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start lg:items-end gap-2">
                  {isApproved && hasPayment && (
                    <div className="text-right">
                      <div className="text-xs font-bold text-muted mb-1 uppercase">TOTAL AMOUNT</div>
                      <div className="text-xl font-bold text-heading">
                        {formatCurrency(item.accounts_receivable.total_payment)}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getBookingStatusBadge(displayStatus, fullyPaid, gcashPending)} flex items-center gap-2`}>
                      {getBookingStatusIcon(displayStatus, fullyPaid, gcashPending)}
                      {displayStatus}
                    </span>
                    <span className="text-xs text-muted font-medium">
                      {paymentStatusText}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted flex items-center gap-1 mb-3">
                <Calendar className="w-3 h-3"/>
                Booked on {formatDate(item.created_at)}
              </div>

              {/* Compact Grid with Icons on Data - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-3 border-t border-b border-main py-3">
                {/* Route */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">ROUTE:</div>
                  <div className="text-content flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-muted" />
                    <span className="truncate">{item.origin?.route_name || item.origin?.name || 'N/A'}</span>
                    <ArrowRight className="w-3 h-3 text-muted" />
                    <MapPin className="w-3 h-3 text-muted" />
                    <span className="truncate">{item.destination?.route_name || item.destination?.name || 'N/A'}</span>
                  </div>
                </div>

                {/* Container with VAN # */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">CONTAINER:</div>
                  <div className="text-content">
                    <div className="flex items-center gap-1">
                      <Container className="w-3 h-3 text-muted" />
                      {item.container_quantity} x {item.container_size?.size || item.container_size?.name}
                    </div>
                    {item.van_number && (
                      <div className="text-base font-mono text-content mt-1 flex items-center gap-1">
                        <Box className="w-3 h-3" />
                        VAN #: {item.van_number}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">ITEMS:</div>
                  <div className="flex flex-col gap-1">
                    <div className="text-content flex items-center gap-1">
                      <Package className="w-3 h-3 text-muted"/>
                      {item.items?.length || 0} types, {totalItems} units
                    </div>
                    <div className="text-xs text-muted flex items-center gap-1">
                      <Weight className="w-3 h-3"/>
                      {formatWeight(totalWeight)} total
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Notice */}
              {!isApproved ? (
                <div className="border-yellow-600 bg-surface p-3 rounded-lg mb-3">
                  <div className="flex items-start gap-4">
                    <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-heading">
                        <strong className="text-yellow-600">
                          Waiting for Approval
                        </strong>{' '}
                        Your booking request is pending admin approval. Once approved, you'll be able to view payment details and track your shipment.
                      </p>
                    </div>
                  </div>
                </div>
              ) : hasARRecord ? (
                <>
                  {/* Fully Paid */}
                  {fullyPaid && (
                    <div className="border-green-600 bg-surface p-3 rounded-lg mb-3">
                      <div className="flex items-start gap-4">
                        <BadgeCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-heading">
                            <strong className="text-green-600">
                              Payment Complete
                            </strong>{' '}
                            Thank you for your payment! Your booking is now fully paid and being processed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COD Pending */}
                  {codPending && (
                    <div className="border-blue-600 bg-surface p-3 rounded-lg mb-3">
                      <div className="flex items-start gap-4">
                        <Truck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-heading">
                            <strong className="text-blue-600">
                              Cash on Delivery Selected
                            </strong>{' '}
                            Your payment of <span className="font-bold">{formatCurrency(item.accounts_receivable.total_payment)}</span> will be collected upon delivery of your shipment.
                            No online payment is required at this time.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GCash Pending Verification */}
                  {gcashPending ? (
                    <div className="border-purple-600 bg-surface p-3 rounded-lg mb-3">
                      <div className="flex items-start gap-4">
                        <Shield className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-heading">
                            <strong className="text-purple-600">
                              Payment Pending Verification
                            </strong>{' '}
                            Your GCash payment of <span className="font-bold">{formatCurrency(item.accounts_receivable.total_payment)}</span> has been submitted and is awaiting admin verification. 
                            This process usually takes 1-2 business days. You'll receive a confirmation once verified.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Payment Due */}
                  {!fullyPaid && !codPending && !gcashPending && totalPaymentDue > 0 ? (
                    <div className={`p-3 rounded-lg mb-3 ${
                      isOverdue
                        ? 'border-red-600 bg-surface'
                        : 'border-blue-600 bg-surface'
                    }`}>
                      <div className="flex items-start gap-4">
                        <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          isOverdue
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`} />
                        <div className="flex-1">
                          <p className={`${
                            isOverdue
                              ? 'text-heading'
                              : 'text-heading'
                          }`}>
                            <strong className={`${
                              isOverdue
                                ? 'text-red-600'
                                : 'text-blue-600'
                            }`}>
                              {isDelivered ? 'Payment Required - Shipment Delivered' : 'Outstanding Balance'}
                            </strong>{' '}
                            {isDelivered ? (
                              <>
                                Your shipment has been successfully delivered. You can pay your balance of <span className="font-bold">{formatCurrency(totalPaymentDue)}</span> today.
                                {dueDate ? (
                                  <>
                                    Payment is due by {formatDate(dueDate)}.
                                    {isOverdue && (
                                      <span className="font-medium ml-1">This payment is now overdue.</span>
                                    )}
                                  </>
                                ) : (
                                  'Payment due date will be calculated after delivery.'
                                )}
                              </>
                            ) : (
                              <>
                                You can pay your balance of <span className="font-bold">{formatCurrency(totalPaymentDue)}</span> today.
                                {dueDate ? (
                                  <>
                                    Payment is due by {formatDate(dueDate)}.
                                    {isOverdue && (
                                      <span className="font-medium ml-1">This payment is now overdue.</span>
                                    )}
                                  </>
                                ) : (
                                  'Payment due date will be calculated after delivery.'
                                )}
                              </>
                            )}
                          </p>
                          {isOverdue && (
                            <div className="mt-2 p-2 bg-red-900 border border-red-700 rounded text-red-100 text-xs">
                              <p className="font-medium">Your payment is overdue. Please pay right away to avoid restrictions in availing our services.</p>
                              <p className="mt-1">Note: We still accept overdue payments and do not impose additional fees.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* No Payment Due */}
                  {!fullyPaid && !codPending && !gcashPending && totalPaymentDue === 0 && hasPayment ? (
                    <div className="border-blue-600 bg-surface p-3 rounded-lg mb-3">
                      <div className="flex items-start gap-4">
                        <Bell className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-heading">
                            <strong className="text-blue-600">
                              Awaiting Payment Method Selection
                            </strong>{' '}
                            Please select a payment method to proceed with your payment of <span className="font-bold">{formatCurrency(item.accounts_receivable.total_payment)}</span>.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="border-blue-600 bg-surface p-3 rounded-lg mb-3">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-heading">
                        <strong className="text-blue-600">
                          Payment Information Pending
                        </strong>{' '}
                        Your payment amount is being calculated by our admin team. Once the amount is set, you'll be able to view the charges breakdown and make payments here.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Extra Info (Toggle) */}
              <button
                onClick={() => toggleCard(item.id)}
                className="w-full text-left mt-2 pt-2 border-t border-main text-sm flex items-center gap-1 font-semibold text-heading hover:text-content"
              >
                {isExpanded ? (
                  <> <ChevronUp className="w-4 h-4" /> Hide Details </>
                ) : (
                  <> <ChevronDown className="w-4 h-4" /> View All Details </>
                )}
              </button>

              {isExpanded && (
                <div className="mt-3 text-xs space-y-6 border-t pt-3">
                  {/* Three Horizontal Sections: Booking Details, Status Timeline, and Charges Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Booking Details with Items */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-heading text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Booking Details
                      </h4>
                      
                      {/* Payment Method */}
                      {isApproved && item.accounts_receivable?.payment_method && (
                        <div>
                          <div className="text-xs font-bold text-muted mb-1 uppercase">PAYMENT METHOD:</div>
                          <div className="text-content flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-muted" />
                            {item.accounts_receivable.payment_method === 'cod' ? 'Cash on Delivery' : 'GCash'}
                            {codBooking && (
                              <span className="text-blue-600 ml-2 font-medium">(Payment upon delivery)</span>
                            )}
                            {gcashPending && (
                              <span className="text-purple-600 ml-2 font-medium">(Pending verification)</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Payment Terms */}
                      {isApproved && item.terms !== undefined && (
                        <div>
                          <div className="text-xs font-bold text-muted mb-1 uppercase">PAYMENT TERMS:</div>
                          <div className="text-content flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted" />
                            {item.terms === 0 ? 'Immediate' : `${item.terms} days`}
                            {dueDate ? (
                              <span className="text-muted ml-2">
                                (Due: {formatDate(dueDate)})
                                {isOverdue && <span className="text-red-600 ml-1">• Overdue</span>}
                              </span>
                            ) : (
                              <span className="text-muted ml-2">
                                (Due date will be set after delivery)
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {/* Shipping Line */}
                        <div>
                          <div className="text-xs font-bold text-muted mb-1 uppercase">SHIPPING LINE:</div>
                          <div className="text-content flex items-center gap-1">
                            <Ship className="w-3 h-3 text-muted" />
                            {item.shipping_line?.name || 'Not specified'}
                          </div>
                        </div>
                        
                        {/* Trucking */}
                        <div>
                          <div className="text-xs font-bold text-muted mb-1 uppercase">TRUCKING:</div>
                          <div className="text-content flex items-center gap-1">
                            <Truck className="w-3 h-3 text-muted" />
                            {item.truck_comp?.name || 'Not specified'}
                          </div>
                        </div>
                        
                        {/* Parties */}
                        <div>
                          <div className="text-xs font-bold text-muted mb-1 uppercase">PARTIES:</div>
                          <div className="text-content space-y-1">
                            <div className="flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-muted" />
                              <span className="font-semibold">Shipper: </span>
                              {item.shipper_first_name} {item.shipper_last_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <UserCog className="w-3 h-3 text-muted" />
                              <span className="font-semibold">Consignee: </span>
                              {item.consignee_first_name} {item.consignee_last_name}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Schedule Information */}
                      {(item.departure_date || item.delivery_date) && (
                        <div className="space-y-2">
                          {item.departure_date && (
                            <div>
                              <div className="text-xs font-bold text-muted mb-1 uppercase">PREFERRED DEPARTURE:</div>
                              <div className="text-content flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-muted"/>
                                {formatDate(item.departure_date)}
                              </div>
                            </div>
                          )}
                          {item.delivery_date && (
                            <div>
                              <div className="text-xs font-bold text-muted mb-1 uppercase">PREFERRED DELIVERY:</div>
                              <div className="text-content flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-muted"/>
                                {formatDate(item.delivery_date)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Items List */}
                      <div>
                        <div className="font-bold text-muted mb-2 uppercase">ITEMS {item.items?.length || 0}:</div>
                        <div className="space-y-2 pl-3 border-l-2 border-main">
                          {item.items?.map((i, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Package className="w-3 h-3 text-muted" />
                              <div>
                                <div className="font-medium text-content">{i.name}</div>
                                <div className="text-muted text-xs">{i.category} | {i.quantity} units | {i.weight} kg each</div>
                              </div>
                            </div>
                          )) || (
                            <div className="text-muted text-sm italic">No items listed</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Timeline - Middle Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-heading text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Shipping Status Timeline
                      </h4>

                      {cargoMonitoring ? (
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-muted mb-2 uppercase">STATUS TIMELINE:</div>
                          <div className="space-y-1">
                            {['Pending', 'Picked Up', 'Origin Port', 'In Transit', 'Destination Port', 'Delivered'].map((status, index) => {
                              const dateField = `${status.toLowerCase().replace(' ', '_')}_at`;
                              const date = cargoMonitoring[dateField];
                              const isCurrent = cargoMonitoring.current_status === status;
                              const isCompleted = date !== null;
                              
                              return (
                                <div 
                                  key={status} 
                                  className="relative flex items-center gap-3 py-2"
                                >
                                  {/* Timeline dot */}
                                  <div className={`
                                    w-3 h-3 rounded-full z-10 flex-shrink-0
                                    ${isCurrent 
                                      ? 'bg-blue-500 ring-2 ring-blue-200' 
                                      : isCompleted 
                                        ? 'bg-green-500' 
                                        : 'bg-muted'
                                    }
                                  `} />
                                  
                                  {/* Timeline connector (except for last item) */}
                                  {index < 5 && (
                                    <div className={`
                                      absolute left-1.5 top-full w-0.5 h-4 -ml-px z-0
                                      ${isCompleted ? 'bg-green-500' : 'bg-muted'}
                                    `} />
                                  )}
                                  
                                  {/* Status content */}
                                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(status)}
                                      <span className={`
                                        font-medium text-sm
                                        ${isCurrent 
                                          ? 'text-blue-600 font-semibold' 
                                          : isCompleted 
                                            ? 'text-green-600' 
                                            : 'text-muted'
                                        }
                                      `}>
                                        {status}
                                      </span>
                                    </div>
                                    
                                    {date && (
                                      <div className="flex items-center gap-1 text-xs text-muted ml-6 sm:ml-0">
                                        <Clock className="w-3 h-3 flex-shrink-0" />
                                        <span className="font-medium whitespace-nowrap text-xs">
                                          {new Date(date).toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {!date && (
                                      <div className="flex items-center gap-1 text-xs text-muted ml-6 sm:ml-0">
                                        <Clock className="w-3 h-3 flex-shrink-0" />
                                        <span className="italic whitespace-nowrap text-xs">
                                          Not Set
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted bg-surface rounded-lg">
                          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm font-medium">Tracking not available</p>
                          <p className="text-xs mt-1">Shipping status will appear once tracking begins.</p>
                        </div>
                      )}
                    </div>

                    {/* Charges Breakdown - Right Section */}
                    {isApproved && hasARRecord && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-heading text-sm flex items-center gap-2">
                          <Calculator className="w-4 h-4" />
                          Charges Breakdown
                        </h4>

                        {hasPayment ? (
                          <div className="space-y-3">
                            {(() => {
                              const chargesFromBreakdown = chargesBreakdown?.charges && 
                                                      Array.isArray(chargesBreakdown.charges) && 
                                                      chargesBreakdown.charges.length > 0 ? 
                                                      chargesBreakdown.charges : null;
                              
                              const chargesFromAR = item.accounts_receivable?.charges && 
                                              Array.isArray(item.accounts_receivable.charges) && 
                                              item.accounts_receivable.charges.length > 0 ? 
                                              item.accounts_receivable.charges : null;
                              
                              const chargesToDisplay = chargesFromBreakdown || chargesFromAR;

                              return chargesToDisplay ? (
                                <div className="space-y-2">
                                  <div className="text-xs font-bold text-muted uppercase">CHARGES BREAKDOWN:</div>
                                  {chargesToDisplay.map((charge, idx) => (
                                    <div key={idx} className="flex justify-between items-start py-2 border-b border-main">
                                      <div className="flex-1">
                                        <div className="font-medium text-content">{charge.description}</div>
                                        <div className="text-xs text-muted mt-1">
                                          Base: {formatCurrency(charge.amount)} + Markup: {formatCurrency(charge.markup_amount)}
                                        </div>
                                      </div>
                                      <div className="font-semibold text-content text-right min-w-[100px]">
                                        {formatCurrency(charge.total)}
                                      </div>
                                    </div>
                                  ))}
                                  
                                  {/* Total Amount and Balance Due at Bottom */}
                                  <div className="space-y-2 pt-2 border-t border-main">
                                    <div className="flex justify-between items-center font-bold text-content text-sm">
                                      <div>Total Amount:</div>
                                      <div>{formatCurrency(item.accounts_receivable.total_payment)}</div>
                                    </div>
                                    {item.accounts_receivable.collectible_amount > 0 && (
                                      <div className="flex justify-between items-center font-bold text-orange-600 text-sm">
                                        <div>Balance Due:</div>
                                        <div>{formatCurrency(item.accounts_receivable.collectible_amount)}</div>
                                      </div>
                                    )}
                                    {fullyPaid && (
                                      <div className="flex justify-between items-center font-bold text-green-600 text-sm">
                                        <div>Status:</div>
                                        <div>Fully Paid</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-muted bg-surface rounded-lg">
                                  <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm font-medium">Detailed charges not available</p>
                                  <p className="text-xs mt-1">Contact admin for charges breakdown</p>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted bg-surface rounded-lg">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">Payment calculation in progress</p>
                            <p className="text-xs mt-1">The admin is currently calculating your total payment amount.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Separator lines between sections for better visual separation */}
                  <div className="border-t border-main pt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="text-center text-xs text-muted">
                        Booking & Item Details
                      </div>
                      <div className="text-center text-xs text-muted">
                        Shipping Status Timeline
                      </div>
                      {isApproved && hasARRecord && (
                        <div className="text-center text-xs text-muted">
                          Payment & Charges
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Section - Only show for approved bookings */}
            {isApproved && (
              <div className="border-t border-main">
                {/* CASE 1: Fully paid (GCash completed OR COD collected) */}
                {fullyPaid ? (
                  <div className="bg-surface px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-2 text-green-600 mb-3 sm:mb-0">
                      <BadgeCheck className="w-5 h-5" />
                      <div>
                        <span className="font-semibold">Fully Paid</span>
                        <p className="text-sm text-green-600">Thank you for your payment</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadStatement(item)}
                      className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Receipt
                    </button>
                  </div>
                ) : codPending ? (
                  <div className="bg-surface px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-2 text-blue-600 mb-3 sm:mb-0">
                      <Truck className="w-5 h-5" />
                      <div>
                        <span className="font-semibold">Cash on Delivery - Pending</span>
                        <p className="text-sm text-blue-600">Payment will be collected upon delivery</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadStatement(item)}
                      className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Receipt className="w-4 h-4" />
                      View Statement
                    </button>
                  </div>
                ) : gcashPending ? (
                  <div className="bg-surface px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-2 text-purple-600 mb-3 sm:mb-0">
                      <Shield className="w-5 h-5" />
                      <div>
                        <span className="font-semibold">Payment Pending Verification</span>
                        <p className="text-sm text-purple-600">Your payment is being reviewed by admin</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadStatement(item)}
                      className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Receipt className="w-4 h-4" />
                      View Statement
                    </button>
                  </div>
                ) : totalPaymentDue > 0 ? (
                  <div className="bg-surface px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <button
                      onClick={() => handleDownloadStatement(item)}
                      className="w-full sm:w-auto bg-muted text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-content transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download Statement
                    </button>
                    <button
                      onClick={() => handlePayButtonClick(item)}
                      disabled={processingPayment === item.id}
                      className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingPayment === item.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Pay {formatCurrency(totalPaymentDue)}
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-surface px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-2 text-muted mb-3 sm:mb-0">
                      <AlertCircle className="w-5 h-5" />
                      <div>
                        <span className="font-semibold">Payment Status: Pending</span>
                        <p className="text-sm text-muted">No payment due at this time</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadStatement(item)}
                      className="w-full sm:w-auto bg-muted text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-content transition-colors flex items-center justify-center gap-2"
                    >
                      <Receipt className="w-4 h-4" />
                      View Statement
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CustomerBookingsTable;