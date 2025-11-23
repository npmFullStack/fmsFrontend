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
import { useAR } from '../../hooks/useAR';

const CustomerBookingsTable = ({ 
  data = [],
  onPay,
  onDownloadStatement,
  isLoading = false,
  getChargesBreakdown
}) => {
  const [expandedCards, setExpandedCards] = useState([]);
  const { arByBookingQuery } = useAR();

  const toggleCard = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Get display status from cargo monitoring or fallback to booking_status
  const getDisplayStatus = (booking) => {
    if (booking.cargo_monitoring && booking.cargo_monitoring.current_status) {
      return booking.cargo_monitoring.current_status;
    }
    
    const statusMap = {
      'pending': 'Pending',
      'in_transit': 'In Transit', 
      'delivered': 'Delivered'
    };
    
    return statusMap[booking.booking_status] || 'Pending';
  };

  // Status badge configuration - using primary colors
  const getBookingStatusBadge = (status) => {
    const statusConfig = {
      'Pending': 'bg-primary text-white border-primary',
      'Picked Up': 'bg-primary text-white border-primary',
      'Origin Port': 'bg-primary text-white border-primary',
      'In Transit': 'bg-primary text-white border-primary',
      'Destination Port': 'bg-primary text-white border-primary',
      'Out for Delivery': 'bg-primary text-white border-primary',
      'Delivered': 'bg-primary text-white border-primary'
    };
    return statusConfig[status] || 'bg-primary text-white border-primary';
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

  // Generate billing statement data for download
  const generateBillingStatement = (booking) => {
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
      deliveryDate: booking.delivery_date ? formatDate(booking.delivery_date) : 'Not specified'
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

        // Get charges breakdown using the function passed from parent
        const chargesBreakdown = getChargesBreakdown ? getChargesBreakdown(item.id) : null;

        return (
          <div
            key={item.id || index}
            className="bg-surface rounded-lg border border-main overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              {/* Header with Total Amount Prominently Displayed */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted" />
                    <span className="font-semibold text-heading">{item.first_name} {item.last_name}</span>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
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
                <div className="flex flex-col items-end gap-2">
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
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
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

              {/* Compact Grid with Icons on Data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3 border-t border-b border-main py-3">
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

              {/* Extra Info (Toggle) */}
              <button
                onClick={() => toggleCard(item.id || index)}
                className="w-full text-left mt-2 pt-2 border-t border-main text-sm flex items-center gap-1 font-semibold text-heading"
              >
                {isExpanded ? (
                  <> <ChevronUp className="w-4 h-4" /> Hide Details </>
                ) : (
                  <> <ChevronDown className="w-4 h-4" /> View All Details </>
                )}
              </button>

              {isExpanded && (
                <div className="mt-3 text-xs space-y-3 border-t pt-3">
                  {/* Two Horizontal Sections: Booking Details and Charges Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Booking Details */}
                    <div className="space-y-3">
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
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
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
                    </div>

                    {/* Charges Breakdown */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-heading text-sm flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Charges Breakdown
                      </h4>

                      {hasPayment ? (
                        <div className="space-y-2">
                          {/* Total Payment Summary - Simplified without balance due */}
                          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-primary">Total Payment:</span>
                              <span className="font-bold text-primary text-lg">
                                {formatCurrency(item.accounts_receivable.total_payment)}
                              </span>
                            </div>
                          </div>

                          {/* Individual Charges - Using charges breakdown data */}
                          {chargesBreakdown && chargesBreakdown.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-xs font-bold text-muted uppercase">CHARGES DETAILS:</div>
                              {chargesBreakdown.map((charge, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-main/20">
                                  <div className="flex-1">
                                    <div className="font-medium text-heading">{charge.description}</div>
                                    {charge.markup > 0 ? (
                                      <div className="text-xs text-muted">
                                        Base: {formatCurrency(charge.amount)} + {charge.markup}% markup
                                      </div>
                                    ) : (
                                      <div className="text-xs text-muted">
                                        Amount: {formatCurrency(charge.amount)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="font-semibold text-heading text-right">
                                    {formatCurrency(charge.total || charge.amount)}
                                  </div>
                                </div>
                              ))}
                              
                              {/* Total Summary */}
                              <div className="flex justify-between items-center pt-2 border-t border-main/30 font-bold text-heading">
                                <div>Total Amount:</div>
                                <div>{formatCurrency(item.accounts_receivable.total_payment)}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-muted">
                              <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No detailed charges available</p>
                              <p className="text-xs mt-1">Total amount: {formatCurrency(item.accounts_receivable.total_payment)}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted bg-main/30 rounded-lg">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm font-medium">Payment calculation in progress</p>
                          <p className="text-xs mt-1">The admin is currently calculating your total payment amount.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div>
                    <div className="font-bold text-muted mb-1 uppercase">ITEMS {item.items.length}:</div>
                    <div className="space-y-2 pl-3 border-l-2 border-main">
                      {item.items.map((i, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Package className="w-3 h-3 text-muted" />
                          <div>
                            <div className="font-medium">{i.name}</div>
                            <div className="text-muted">{i.category} | {i.quantity} units | {i.weight} kg each</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pay Action with Download Statement - Only show if payment is ready */}
            {canPay && (
              <div className="bg-surface px-4 py-3 border-t border-main flex justify-between items-center gap-2">
                <button
                  onClick={() => handleDownloadStatement(item)}
                  className="bg-gray-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Billing Statement
                </button>
                <button
                  onClick={() => onPay(item)}
                  className="bg-primary text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
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