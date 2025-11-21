// src/components/modals/PaidCharges.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import DateTime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { 
  DollarSign, 
  Truck, 
  Anchor, 
  FileText, 
  Calendar, 
  CheckCircle, 
  XCircle,
  User,
  CreditCard
} from 'lucide-react';
import SharedModal from '../ui/SharedModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAP } from '../../hooks/useAP';

// Simple DateTime component
const DateTimeInput = React.memo(({ value, onChange, placeholder }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative">
      <DateTime
        value={formatDate(value)}
        onChange={(date) => {
          const dateString = typeof date === 'string' ? date : date?.format('YYYY-MM-DD') || '';
          onChange(dateString);
        }}
        inputProps={{
          placeholder: placeholder,
          className: "modal-input pr-10 cursor-pointer w-full",
          readOnly: true
        }}
        timeFormat={false}
        closeOnSelect={true}
        dateFormat="YYYY-MM-DD"
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
    </div>
  );
});

const PaidCharges = ({ 
  isOpen, 
  onClose, 
  apRecord, 
  onMarkAsPaid, 
  isLoading = false, 
  bookings = [] 
}) => {
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedAP, setSelectedAP] = useState(null);
  const [paymentData, setPaymentData] = useState({});
  const [activeCharge, setActiveCharge] = useState(null);

  const { apByBookingQuery } = useAP();

  // Fetch AP data when booking is selected
  const { data: apData, isLoading: isLoadingAP } = apByBookingQuery(selectedBookingId);

  // Set initial data when modal opens with pre-selected AP record
  useEffect(() => {
    if (isOpen) {
      if (apRecord) {
        setSelectedBookingId(apRecord.booking_id);
        setSelectedAP(apRecord);
      } else {
        setSelectedBookingId(null);
        setSelectedAP(null);
      }
      setPaymentData({});
      setActiveCharge(null);
    }
  }, [isOpen, apRecord]);

  // Update selected AP when data loads
  useEffect(() => {
    if (apData && selectedBookingId) {
      setSelectedAP(apData);
    }
  }, [apData, selectedBookingId]);

  // Memoized booking options
  const bookingOptions = useMemo(() => 
    bookings.map(booking => ({
      value: booking.id,
      label: `${booking.booking_number} - ${booking.first_name} ${booking.last_name}`,
    })),
    [bookings]
  );

  // Calculate total unpaid amount
  const totalUnpaidAmount = useMemo(() => {
    if (!selectedAP) return 0;

    let total = 0;

    // Freight charge
    if (selectedAP.freight_charge && !selectedAP.freight_charge.is_paid) {
      total += parseFloat(selectedAP.freight_charge.amount) || 0;
    }

    // Trucking charges
    if (selectedAP.trucking_charges) {
      selectedAP.trucking_charges
        .filter(charge => !charge.is_paid)
        .forEach(charge => {
          total += parseFloat(charge.amount) || 0;
        });
    }

    // Port charges
    if (selectedAP.port_charges) {
      selectedAP.port_charges
        .filter(charge => !charge.is_paid)
        .forEach(charge => {
          total += parseFloat(charge.amount) || 0;
        });
    }

    // Misc charges
    if (selectedAP.misc_charges) {
      selectedAP.misc_charges
        .filter(charge => !charge.is_paid)
        .forEach(charge => {
          total += parseFloat(charge.amount) || 0;
        });
    }

    return total;
  }, [selectedAP]);

  // Get all unpaid charges
  const unpaidCharges = useMemo(() => {
    if (!selectedAP) return [];

    const charges = [];

    // Freight charge
    if (selectedAP.freight_charge && !selectedAP.freight_charge.is_paid) {
      charges.push({
        type: 'freight',
        id: selectedAP.freight_charge.id,
        charge_type: 'FREIGHT',
        voucher_number: selectedAP.freight_charge.voucher_number,
        payee: 'Freight Charge',
        amount: selectedAP.freight_charge.amount,
        check_date: selectedAP.freight_charge.check_date,
        is_paid: false
      });
    }

    // Trucking charges
    if (selectedAP.trucking_charges) {
      selectedAP.trucking_charges
        .filter(charge => !charge.is_paid)
        .forEach(charge => {
          charges.push({
            type: 'trucking',
            id: charge.id,
            charge_type: `TRUCKING_${charge.type}`,
            voucher_number: charge.voucher_number,
            payee: `Trucking - ${charge.type}`,
            amount: charge.amount,
            check_date: charge.check_date,
            is_paid: false
          });
        });
    }

    // Port charges
    if (selectedAP.port_charges) {
      selectedAP.port_charges
        .filter(charge => !charge.is_paid)
        .forEach(charge => {
          charges.push({
            type: 'port',
            id: charge.id,
            charge_type: charge.charge_type,
            voucher_number: charge.voucher_number,
            payee: charge.payee || `Port - ${charge.charge_type}`,
            amount: charge.amount,
            check_date: charge.check_date,
            is_paid: false
          });
        });
    }

    // Misc charges
    if (selectedAP.misc_charges) {
      selectedAP.misc_charges
        .filter(charge => !charge.is_paid)
        .forEach(charge => {
          charges.push({
            type: 'misc',
            id: charge.id,
            charge_type: charge.charge_type,
            voucher_number: charge.voucher_number,
            payee: charge.payee || `Misc - ${charge.charge_type}`,
            amount: charge.amount,
            check_date: charge.check_date,
            is_paid: false
          });
        });
    }

    return charges;
  }, [selectedAP]);

  const handleBookingChange = (selected) => {
    const bookingId = selected?.value ? Number(selected.value) : null;
    setSelectedBookingId(bookingId);
    setSelectedAP(null);
    setPaymentData({});
    setActiveCharge(null);
  };

  const handleMarkAsPaidClick = (charge) => {
    setActiveCharge(charge);
    setPaymentData({
      voucher: `VOUCHER-${Date.now()}`,
      check_date: new Date().toISOString().split('T')[0]
    });
  };

  const handlePaymentSubmit = async () => {
    if (!activeCharge || !selectedAP) return;

    try {
      await onMarkAsPaid(
        selectedAP.id,
        activeCharge.type,
        activeCharge.id,
        paymentData
      );
      setActiveCharge(null);
      setPaymentData({});
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    setSelectedBookingId(null);
    setSelectedAP(null);
    setPaymentData({});
    setActiveCharge(null);
    onClose();
  };

  const getChargeIcon = (chargeType) => {
    if (chargeType.includes('FREIGHT')) return DollarSign;
    if (chargeType.includes('TRUCKING')) return Truck;
    if (chargeType.includes('CRAINAGE') || chargeType.includes('ARRASTRE') || chargeType.includes('WHARFAGE') || chargeType.includes('LABOR')) return Anchor;
    return FileText;
  };

  const getChargeStatusColor = (isPaid) => {
    return isPaid ? 'text-green-600' : 'text-orange-600';
  };

  const getChargeStatusIcon = (isPaid) => {
    return isPaid ? CheckCircle : XCircle;
  };

  if (!isOpen) return null;

  return (
    <SharedModal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Pay Charges" 
      size="xl"
      className="h-[90vh]"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto max-h-[calc(90vh-120px)] pr-2 -mr-2">
          <div className="space-y-6">
            {/* Booking Selection */}
            {!apRecord && (
              <div>
                <label className="modal-label text-heading">Select Booking</label>
                <Select
                  options={bookingOptions}
                  value={bookingOptions.find(option => option.value === selectedBookingId)}
                  onChange={handleBookingChange}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select a booking to view charges"
                  isClearable
                />
              </div>
            )}

            {/* Loading State */}
            {isLoadingAP && (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Total Expenses Summary */}
            {selectedAP && (
              <div className="bg-main rounded-lg p-4 border border-main">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted">Total Expenses</div>
                    <div className="text-2xl font-bold text-heading">
                      {formatCurrency(selectedAP.total_expenses || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted">Total Unpaid</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(totalUnpaidAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted">Unpaid Charges</div>
                    <div className="text-2xl font-bold text-heading">
                      {unpaidCharges.length}
                    </div>
                  </div>
                </div>
                
                {/* Customer Info */}
                {selectedAP.booking && (
                  <div className="mt-4 pt-4 border-t border-main">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted" />
                      <span className="text-muted">Customer:</span>
                      <span className="font-medium text-heading">
                        {selectedAP.booking.first_name} {selectedAP.booking.last_name}
                      </span>
                      <span className="text-muted ml-4">Booking #:</span>
                      <span className="font-mono font-medium text-heading">
                        {selectedAP.booking.booking_number}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Charges List */}
            {selectedAP && unpaidCharges.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-heading">Unpaid Charges</h3>
                {unpaidCharges.map((charge, index) => {
                  const StatusIcon = getChargeStatusIcon(charge.is_paid);
                  const ChargeIcon = getChargeIcon(charge.charge_type);
                  
                  return (
                    <div
                      key={`${charge.type}-${charge.id}-${index}`}
                      className="bg-surface rounded-lg border border-main p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-main rounded-lg">
                            <ChargeIcon className="w-4 h-4 text-muted" />
                          </div>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-xs font-bold text-muted">VOUCHER #</div>
                              <div className="font-mono text-sm font-medium text-heading">
                                {charge.voucher_number}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-muted">TYPE</div>
                              <div className="text-sm text-heading">
                                {charge.charge_type.replace(/_/g, ' ')}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-muted">PAYEE</div>
                              <div className="text-sm text-heading">
                                {charge.payee}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-muted">AMOUNT</div>
                              <div className="text-lg font-bold text-heading">
                                {formatCurrency(charge.amount)}
                              </div>
                            </div>
                            {charge.check_date && (
                              <div className="md:col-span-4">
                                <div className="text-xs font-bold text-muted">CHECK DATE</div>
                                <div className="text-sm text-heading flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(charge.check_date, false)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <StatusIcon className={`w-5 h-5 ${getChargeStatusColor(charge.is_paid)}`} />
                          <button
                            onClick={() => handleMarkAsPaidClick(charge)}
                            disabled={charge.is_paid || isLoading}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            <CreditCard className="w-4 h-4" />
                            Mark Paid
                          </button>
                        </div>
                      </div>

                      {/* Payment Form */}
                      {activeCharge?.id === charge.id && (
                        <div className="mt-4 pt-4 border-t border-main">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="modal-label text-heading">Voucher Number</label>
                              <input
                                type="text"
                                value={paymentData.voucher || ''}
                                onChange={(e) => setPaymentData(prev => ({
                                  ...prev,
                                  voucher: e.target.value
                                }))}
                                className="modal-input"
                                placeholder="Enter voucher number"
                              />
                            </div>
                            <div>
                              <label className="modal-label text-heading">Check Date</label>
                              <DateTimeInput
                                value={paymentData.check_date || ''}
                                onChange={(date) => setPaymentData(prev => ({
                                  ...prev,
                                  check_date: date
                                }))}
                                placeholder="Select check date"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              type="button"
                              onClick={() => setActiveCharge(null)}
                              className="modal-btn-cancel"
                              disabled={isLoading}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handlePaymentSubmit}
                              disabled={!paymentData.voucher || isLoading}
                              className="modal-btn-primary disabled:modal-btn-disabled"
                            >
                              {isLoading ? 'Processing...' : 'Confirm Payment'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* No Unpaid Charges */}
            {selectedAP && unpaidCharges.length === 0 && (
              <div className="text-center py-12 text-muted">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <p className="text-lg font-medium text-heading">All charges are paid!</p>
                <p className="text-sm">There are no unpaid charges for this booking.</p>
              </div>
            )}

            {/* No Booking Selected */}
            {!selectedBookingId && !apRecord && (
              <div className="text-center py-12 text-muted">
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted" />
                <p className="text-lg font-medium text-heading">Select a booking</p>
                <p className="text-sm">Choose a booking to view and pay its charges.</p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-main mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="modal-btn-cancel"
            disabled={isLoading}
          >
            Close
          </button>
        </div>
      </div>
    </SharedModal>
  );
};

export default React.memo(PaidCharges);