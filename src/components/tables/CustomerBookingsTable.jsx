// [file name]: CustomerBookingsTable.jsx
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
  AlertCircle
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

const CustomerBookingsTable = ({ 
  data = [],
  onPay,
  onDownloadStatement,
  isLoading = false,
  getChargesBreakdown
}) => {
  const [expandedCards, setExpandedCards] = useState([]);

  const toggleCard = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

const getDisplayStatus = (booking) => {
  if (booking.cargo_monitoring && booking.cargo_monitoring.current_status) {
    return booking.cargo_monitoring.current_status;
  }
  
  // Complete status mapping
  const statusMap = {
    'pending': 'Pending',
    'picked_up': 'Picked Up',
    'origin_port': 'Origin Port', 
    'in_transit': 'In Transit',
    'destination_port': 'Destination Port',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered'
  };
  
  return statusMap[booking.booking_status] || 'Pending';
};

  // Status badge configuration - same as CargoMonitoringTable
  const getBookingStatusBadge = (status) => {
    const statusConfig = {
      'Pending': 'bg-gray-500 text-white border-gray-600',
      'Picked Up': 'bg-blue-500 text-white border-blue-600',
      'Origin Port': 'bg-purple-500 text-white border-purple-600',
      'In Transit': 'bg-orange-500 text-white border-orange-600',
      'Destination Port': 'bg-indigo-500 text-white border-indigo-600',
      'Out for Delivery': 'bg-yellow-500 text-black border-yellow-600',
      'Delivered': 'bg-green-500 text-white border-green-600'
    };
    return statusConfig[status] || 'bg-gray-500 text-white border-gray-600';
  };

  const getBookingStatusIcon = (status) => {
    const iconConfig = {
      'Pending': <Clock className="w-4 h-4" />,
      'Picked Up': <Truck className="w-4 h-4" />,
      'Origin Port': <Ship className="w-4 h-4" />,
      'In Transit': <Ship className="w-4 h-4" />,
      'Destination Port': <MapPin className="w-4 h-4" />,
      'Out for Delivery': <Truck className="w-4 h-4" />,
      'Delivered': <CheckCircle className="w-4 h-4" />
    };
    return iconConfig[status] || <Clock className="w-4 h-4" />;
  };

  const calculateTotalWeight = (items) => items?.reduce((sum, i) => sum + i.weight * i.quantity, 0) || 0;
  const calculateTotalItems = (items) => items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const formatWeight = (w) => `${parseFloat(w).toFixed(2)} kg`;

  // Check if booking has outstanding payment using AR data
  const hasOutstandingPayment = (booking) => {
    if (booking.accounts_receivable) {
      const ar = booking.accounts_receivable;
      return ar.collectible_amount > 0 && !ar.is_paid;
    }
    return false;
  };

  // Get total payment due from AR record
  const getTotalPaymentDue = (booking) => {
    if (booking.accounts_receivable && booking.accounts_receivable.collectible_amount > 0) {
      return booking.accounts_receivable.collectible_amount;
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
    
    // Use delivery date from cargo monitoring or booking
    let deliveryDate = null;
    
    // Check cargo monitoring first
    if (booking.cargo_monitoring && booking.cargo_monitoring.delivered_at) {
      deliveryDate = new Date(booking.cargo_monitoring.delivered_at);
    } 
    // Fallback to booking delivery date
    else if (booking.delivery_date) {
      deliveryDate = new Date(booking.delivery_date);
    }
    // If no delivery date yet, no due date
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
      isOverdue: isPaymentOverdue(booking)
    };
    
    return statementData;
  };

  const handleDownloadStatement = (booking) => {
    const statementData = generateBillingStatement(booking);
    if (onDownloadStatement) {
      onDownloadStatement(statementData);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (data.length === 0) return (
    <div className="text-center py-12 text-gray-500">
      <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <p className="text-lg font-medium">No bookings found</p>
      <p className="text-sm">Your bookings will appear here once approved.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const totalWeight = calculateTotalWeight(item.items);
        const totalItems = calculateTotalItems(item.items);
        const isExpanded = expandedCards[item.id || index];
        const displayStatus = getDisplayStatus(item);
        const canPay = hasOutstandingPayment(item);
        const totalPaymentDue = getTotalPaymentDue(item);
        const hasPayment = hasPaymentData(item);
        const paymentPending = isPaymentPending(item);
        const dueDate = getDueDate(item);
        const isOverdue = isPaymentOverdue(item);
        const isDelivered = displayStatus === 'Delivered';
        const hasARRecord = !!item.accounts_receivable;

        // Get simplified charges breakdown using the function passed from parent
        const chargesBreakdown = getChargesBreakdown ? getChargesBreakdown(item.id) : null;

        return (
          <div
            key={item.id || index}
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
                  {/* Total Amount Display */}
                  {hasPayment && (
                    <div className="text-right">
                      <div className="text-xs font-bold text-muted mb-1 uppercase">TOTAL AMOUNT</div>
                      <div className="text-xl font-bold text-primary">
                        {formatCurrency(item.accounts_receivable.total_payment)}
                      </div>
                    </div>
                  )}
                  {paymentPending && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full border border-blue-700">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-sm font-medium">Calculating</span>
                    </div>
                  )}
                  {/* Booking Status */}
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getBookingStatusBadge(displayStatus)} flex items-center gap-2`}>
                    {getBookingStatusIcon(displayStatus)}
                    {displayStatus}
                  </span>
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
                  <div className="flex items-center gap-1 text-content">
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
                      <div className="text-sm font-mono text-content mt-1 flex items-center gap-1">
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

              {/* Payment Notice - Different messages based on AR record status */}
              {hasARRecord ? (
                hasOutstandingPayment(item) && (
                  <div className="mb-3 p-3 border border-blue-700 bg-blue-900 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-blue-100 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-100 text-sm mb-1">
                          {isDelivered ? 'Payment Required - Shipment Delivered' : 'Outstanding Balance'}
                        </h4>
                        <div className="text-blue-200 text-sm space-y-1">
                          {isDelivered ? (
                            <>
                              <p>Your shipment has been successfully delivered. You can pay your balance of <span className="font-bold">{formatCurrency(totalPaymentDue)}</span> today.</p>
                              {dueDate ? (
                                <p className="font-medium">
                                  Payment is due by {formatDate(dueDate)}.
                                  {isOverdue && (
                                    <span className="text-red-300 ml-1">This payment is now overdue.</span>
                                  )}
                                </p>
                              ) : (
                                <p className="text-blue-300">Payment due date will be calculated after delivery.</p>
                              )}
                            </>
                          ) : (
                            <>
                              <p>You can pay your balance of <span className="font-bold">{formatCurrency(totalPaymentDue)}</span> today.</p>
                              {dueDate ? (
                                <p className="font-medium">
                                  Payment is due by {formatDate(dueDate)}.
                                  {isOverdue && (
                                    <span className="text-red-300 ml-1">This payment is now overdue.</span>
                                  )}
                                </p>
                              ) : (
                                <p className="text-blue-300">Payment due date will be calculated after delivery.</p>
                              )}
                            </>
                          )}
                        </div>
                        {isOverdue && (
                          <div className="mt-2 p-2 bg-red-900 border border-red-700 rounded text-red-100 text-xs">
                            <p className="font-medium">Your payment is overdue. Please pay right away to avoid any service restrictions.</p>
                            <p className="mt-1">Note: We still accept overdue payments and do not impose additional fees.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                // No AR record yet
                <div className="mb-3 p-3 border border-blue-700 bg-blue-900 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-blue-100 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-100 text-sm mb-1">
                        Payment Information Pending
                      </h4>
                      <div className="text-blue-200 text-sm space-y-1">
                        <p>Your payment amount is being calculated by our admin team.</p>
                        <p>Once the amount is set, you'll be able to view the charges breakdown and make payments here.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Extra Info (Toggle) */}
              <button
                onClick={() => toggleCard(item.id || index)}
                className="w-full text-left mt-2 pt-2 border-t border-main text-sm flex items-center gap-1 font-semibold text-heading hover:text-heading"
              >
                {isExpanded ? (
                  <> <ChevronUp className="w-4 h-4" /> Hide Details </>
                ) : (
                  <> <ChevronDown className="w-4 h-4" /> View All Details </>
                )}
              </button>

              {isExpanded && (
                <div className="mt-3 text-xs space-y-4 border-t pt-3">
                  {/* Two Horizontal Sections: Booking Details and Charges Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Booking Details with Items */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-heading text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Booking Details
                      </h4>
                      
                      {/* Payment Terms */}
                      {item.terms !== undefined && (
                        <div>
                          <div className="text-xs font-bold text-muted mb-1 uppercase">PAYMENT TERMS:</div>
                          <div className="text-content flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-muted" />
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

                      {/* Items List - Moved to Booking Details section */}
                      <div>
                        <div className="font-bold text-muted mb-2 uppercase">ITEMS {item.items.length}:</div>
                        <div className="space-y-2 pl-3 border-l-2 border-main">
                          {item.items.map((i, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Package className="w-3 h-3 text-muted" />
                              <div>
                                <div className="font-medium text-heading">{i.name}</div>
                                <div className="text-muted text-xs">{i.category} | {i.quantity} units | {i.weight} kg each</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Charges Breakdown - Only show if AR record exists */}
                    {hasARRecord && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-heading text-sm flex items-center gap-2">
                          <Calculator className="w-4 h-4" />
                          Charges Breakdown
                        </h4>

                        {hasPayment ? (
                          <div className="space-y-3">
                            {/* Total Payment Summary */}
                            <div className="bg-main/30 border border-main rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-heading">Total Payment:</span>
                                <span className="font-bold text-heading text-lg">
                                  {formatCurrency(item.accounts_receivable.total_payment)}
                                </span>
                              </div>
                              {item.accounts_receivable.collectible_amount > 0 && (
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-main/20">
                                  <span className="font-semibold text-orange-600">Balance Due:</span>
                                  <span className="font-bold text-orange-600 text-lg">
                                    {formatCurrency(item.accounts_receivable.collectible_amount)}
                                  </span>
                                </div>
                              )}
                              {item.accounts_receivable.is_paid && (
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-main/20">
                                  <span className="font-semibold text-green-600">Status:</span>
                                  <span className="font-bold text-green-600 text-lg">Paid</span>
                                </div>
                              )}
                            </div>

                            {/* Individual Charges */}
                            {(() => {
                              // Check multiple sources for charges data
                              const chargesFromBreakdown = chargesBreakdown && chargesBreakdown.charges && chargesBreakdown.charges.length > 0 ? chargesBreakdown.charges : null;
                              const chargesFromAR = item.accounts_receivable?.charges && 
                                                Array.isArray(item.accounts_receivable.charges) && 
                                                item.accounts_receivable.charges.length > 0 ? 
                                                item.accounts_receivable.charges : null;
                              
                              const chargesToDisplay = chargesFromBreakdown || chargesFromAR;

                              return chargesToDisplay ? (
                                <div className="space-y-2">
                                  <div className="text-xs font-bold text-muted uppercase">CHARGES BREAKDOWN:</div>
                                  {chargesToDisplay.map((charge, idx) => (
                                    <div key={idx} className="flex justify-between items-start py-2 border-b border-main/20">
                                      <div className="flex-1">
                                        <div className="font-medium text-heading">{charge.description}</div>
                                        <div className="text-xs text-muted mt-1">
                                          Type: {charge.type || 'Service Charge'}
                                        </div>
                                      </div>
                                      <div className="font-semibold text-heading text-right min-w-[100px]">
                                        {formatCurrency(charge.total || charge.amount)}
                                      </div>
                                    </div>
                                  ))}
                                  
                                  {/* Simplified Total */}
                                  <div className="flex justify-between items-center pt-2 border-t border-main/30 font-bold text-heading text-sm">
                                    <div>Total Amount:</div>
                                    <div>{formatCurrency(item.accounts_receivable.total_payment)}</div>
                                  </div>
                                </div>
                              ) : (
                                // Fallback when no detailed charges but we have payment data
                                <div className="text-center py-4 text-muted bg-main/30 rounded-lg">
                                  <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm font-medium">Detailed charges not available</p>
                                  <p className="text-xs mt-1">Contact admin for charges breakdown</p>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted bg-main/30 rounded-lg">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">Payment calculation in progress</p>
                            <p className="text-xs mt-1">The admin is currently calculating your total payment amount.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pay Action with Download Statement - Show for any booking with outstanding payment */}
            {canPay && (
              <div className="bg-surface px-4 py-3 border-t border-main flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  onClick={() => handleDownloadStatement(item)}
                  className="w-full sm:w-auto bg-gray-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Billing Statement
                </button>
                <button
                  onClick={() => onPay(item)}
                  className="w-full sm:w-auto bg-primary text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  Pay {formatCurrency(totalPaymentDue)}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CustomerBookingsTable;