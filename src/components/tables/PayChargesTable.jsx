// src/components/tables/PayChargesTable.jsx
import React from 'react';
import { DollarSign, Truck, Anchor, FileText, Calendar, User, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PayChargesTable = ({ 
  data = [],
  onPayCharges,
  isLoading = false
}) => {
  // Calculate total amount for each AP record
  const calculateTotalAmount = (ap) => {
    let total = 0;

    if (ap.freight_charge && !ap.freight_charge.is_paid) {
      total += parseFloat(ap.freight_charge.amount) || 0;
    }

    if (ap.trucking_charges) {
      total += ap.trucking_charges
        .filter(charge => !charge.is_paid)
        .reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
    }

    if (ap.port_charges) {
      total += ap.port_charges
        .filter(charge => !charge.is_paid)
        .reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
    }

    if (ap.misc_charges) {
      total += ap.misc_charges
        .filter(charge => !charge.is_paid)
        .reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
    }

    return total;
  };

  // Count unpaid charges
  const countUnpaidCharges = (ap) => {
    let count = 0;

    if (ap.freight_charge && !ap.freight_charge.is_paid) count++;
    if (ap.trucking_charges) count += ap.trucking_charges.filter(c => !c.is_paid).length;
    if (ap.port_charges) count += ap.port_charges.filter(c => !c.is_paid).length;
    if (ap.misc_charges) count += ap.misc_charges.filter(c => !c.is_paid).length;

    return count;
  };

  if (isLoading) return (
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (data.length === 0) return (
    <div className="text-center py-12 text-muted">
      <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted" />
      <p className="text-lg font-medium">No unpaid charges found</p>
      <p className="text-sm">All charges have been marked as paid.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {data.map((ap, index) => {
        const booking = ap.booking;
        const totalAmount = calculateTotalAmount(ap);
        const unpaidCount = countUnpaidCharges(ap);

        return (
          <div
            key={ap.id || index}
            className="bg-surface rounded-lg border border-main overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              {/* Header with Customer and Pay Button */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted" />
                    <span className="font-semibold text-heading">
                      {booking?.first_name} {booking?.last_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    {booking?.booking_number && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-muted">BOOKING #:</span>
                        <span className="text-heading font-mono font-semibold">{booking.booking_number}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-bold text-muted mb-1">UNPAID CHARGES</div>
                    <div className="text-lg font-bold text-orange-600">{unpaidCount}</div>
                  </div>
                  <button
                    onClick={() => onPayCharges(ap)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    disabled={unpaidCount === 0}
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay Charges
                  </button>
                </div>
              </div>

              {/* Compact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4 border-t border-b border-main py-4">
                {/* Total Unpaid Amount */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">TOTAL UNPAID:</div>
                  <div className="text-heading font-semibold text-lg text-orange-600">
                    {formatCurrency(totalAmount)}
                  </div>
                </div>

                {/* Route Info */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">ROUTE:</div>
                  <div className="text-heading">
                    {booking?.origin?.route_name || booking?.origin?.name || 'N/A'} → {booking?.destination?.route_name || booking?.destination?.name || 'N/A'}
                  </div>
                </div>

                {/* Container Info */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">CONTAINER:</div>
                  <div className="text-heading">
                    {booking?.container_quantity} x {booking?.container_size?.size || booking?.container_size?.name || 'N/A'}
                    {booking?.van_number && (
                      <div className="text-xs text-muted mt-1">VAN: {booking.van_number}</div>
                    )}
                  </div>
                </div>

                {/* Last Updated */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">LAST UPDATED:</div>
                  <div className="text-heading text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted" />
                    {ap.updated_at ? formatDate(ap.updated_at, false) : 'Not Updated'}
                  </div>
                </div>
              </div>

              {/* Charge Type Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                {/* Freight Charges */}
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3 h-3 text-blue-600" />
                  <span className="text-muted">Freight:</span>
                  <span className={`font-medium ${ap.freight_charge && !ap.freight_charge.is_paid ? 'text-orange-600' : 'text-green-600'}`}>
                    {ap.freight_charge ? (ap.freight_charge.is_paid ? 'Paid' : 'Unpaid') : 'None'}
                  </span>
                </div>

                {/* Trucking Charges */}
                <div className="flex items-center gap-2">
                  <Truck className="w-3 h-3 text-purple-600" />
                  <span className="text-muted">Trucking:</span>
                  <span className="font-medium text-orange-600">
                    {ap.trucking_charges?.filter(c => !c.is_paid).length || 0} unpaid
                  </span>
                </div>

                {/* Port Charges */}
                <div className="flex items-center gap-2">
                  <Anchor className="w-3 h-3 text-teal-600" />
                  <span className="text-muted">Port:</span>
                  <span className="font-medium text-orange-600">
                    {ap.port_charges?.filter(c => !c.is_paid).length || 0} unpaid
                  </span>
                </div>

                {/* Misc Charges */}
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3 text-amber-600" />
                  <span className="text-muted">Misc:</span>
                  <span className="font-medium text-orange-600">
                    {ap.misc_charges?.filter(c => !c.is_paid).length || 0} unpaid
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PayChargesTable;