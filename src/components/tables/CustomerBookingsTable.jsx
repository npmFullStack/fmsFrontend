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
  Container
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

const CustomerBookingsTable = ({ 
  data = [],
  onPay,
  isLoading = false,
}) => {
  const [expandedCards, setExpandedCards] = useState([]);

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

  // Status badge configuration
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

  // Check if booking has outstanding payment
  const hasOutstandingPayment = (booking) => {
    // You can implement logic to check AR records here
    // For now, we'll assume all bookings require payment
    return booking.booking_status !== 'delivered';
  };

  const getPaymentStatus = (booking) => {
    // Simple payment status logic - you can enhance this with actual AR data
    if (booking.booking_status === 'delivered') {
      return { status: 'paid', label: 'Paid', color: 'text-green-600' };
    }
    return { status: 'pending', label: 'Payment Due', color: 'text-orange-600' };
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
        const paymentStatus = getPaymentStatus(item);
        const canPay = hasOutstandingPayment(item);

        return (
          <div
            key={item.id || index}
            className="bg-surface rounded-lg border border-main overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              {/* Header with Booking Status and Payment Status */}
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
                  {/* Booking Status */}
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getBookingStatusBadge(displayStatus)} flex items-center gap-2`}>
                    {getBookingStatusIcon(displayStatus)}
                    {displayStatus}
                  </span>
                  {/* Payment Status */}
                  <span className={`px-2 py-1 text-xs font-medium rounded ${paymentStatus.color} bg-opacity-10 border ${paymentStatus.color.replace('text', 'border')} border-opacity-30`}>
                    {paymentStatus.label}
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
                      <div className="text-xs text-muted mt-1 flex items-center gap-1">
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
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-main">
                <button
                  onClick={() => toggleCard(item.id || index)}
                  className="text-left text-sm flex items-center gap-1 font-semibold text-heading"
                >
                  {isExpanded ? (
                    <> <ChevronUp className="w-4 h-4" /> Hide Details </>
                  ) : (
                    <> <ChevronDown className="w-4 h-4" /> View All Details </>
                  )}
                </button>

                {/* Pay Button */}
                {canPay && (
                  <button
                    onClick={() => onPay(item)}
                    className="bg-green-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Pay Now
                  </button>
                )}
              </div>

              {isExpanded && (
                <div className="mt-3 text-xs space-y-3 border-t pt-3">
                  {/* Shipping Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  </div>

                  {/* Schedule Information */}
                  {(item.departure_date || item.delivery_date) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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

                  {/* Items Details */}
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

                  {/* Cargo Monitoring Status */}
                  {item.cargo_monitoring && (
                    <div>
                      <div className="font-bold text-muted mb-1 uppercase">CARGO STATUS:</div>
                      <div className="bg-main rounded p-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted" />
                          <span className="font-medium">{item.cargo_monitoring.current_status}</span>
                          <span className="text-muted text-xs">
                            Last updated: {formatDate(item.cargo_monitoring.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomerBookingsTable;