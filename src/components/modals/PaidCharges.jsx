// src/components/modals/PaidCharges.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { 
  DollarSign, 
  Truck, 
  Anchor, 
  FileText, 
  CheckCircle, 
  CreditCard,
  Loader2
} from 'lucide-react';
import SharedModal from '../ui/SharedModal';
import { formatCurrency } from '../../utils/formatters';
import { useAP } from '../../hooks/useAP';

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
  const [selectedCharges, setSelectedCharges] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setSelectedCharges([]);
      setIsSubmitting(false);
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

  // Get all unpaid charges with unique identifiers
  const unpaidCharges = useMemo(() => {
    if (!selectedAP) return [];

    const charges = [];

    // Freight charge
    if (selectedAP.freight_charge && !selectedAP.freight_charge.is_paid) {
      charges.push({
        type: 'freight',
        id: selectedAP.freight_charge.id,
        uniqueId: `freight-${selectedAP.freight_charge.id}`, // Create unique ID
        charge_type: 'FREIGHT',
        voucher_number: selectedAP.freight_charge.voucher_number,
        payee: selectedAP.booking?.shipping_line?.name || 'Freight Charge',
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
            uniqueId: `trucking-${charge.id}`, // Create unique ID
            charge_type: `TRUCKING_${charge.type}`,
            voucher_number: charge.voucher_number,
            payee: selectedAP.booking?.truck_comp?.name || `Trucking - ${charge.type}`,
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
            uniqueId: `port-${charge.id}`, // Create unique ID
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
            uniqueId: `misc-${charge.id}`, // Create unique ID
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
    setSelectedCharges([]);
  };

  // FIXED: Use uniqueId instead of id for selection
  const handleChargeSelect = (uniqueId, isSelected) => {
    console.log('Selecting charge:', uniqueId, isSelected);
    if (isSelected) {
      setSelectedCharges(prev => [...prev, uniqueId]);
    } else {
      setSelectedCharges(prev => prev.filter(id => id !== uniqueId));
    }
  };

  const handleSelectAll = (isSelected) => {
    console.log('Select all:', isSelected);
    if (isSelected) {
      setSelectedCharges(unpaidCharges.map(charge => charge.uniqueId));
    } else {
      setSelectedCharges([]);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedAP || selectedCharges.length === 0) return;

    setIsSubmitting(true);

    try {
      const selectedChargeData = unpaidCharges.filter(charge => 
        selectedCharges.includes(charge.uniqueId)
      );

      // Process each charge sequentially
      for (const charge of selectedChargeData) {
        await onMarkAsPaid(
          selectedAP.id,
          charge.type,
          charge.id,
          {
            voucher: '',
            check_date: new Date().toISOString().split('T')[0]
          }
        );
      }

      // Success - close modal and reset
      setSelectedCharges([]);
      setIsSubmitting(false);
      onClose(); // Auto-close like AddTruckComp
      
    } catch (error) {
      setIsSubmitting(false);
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    setSelectedBookingId(null);
    setSelectedAP(null);
    setSelectedCharges([]);
    setIsSubmitting(false);
    onClose();
  };

  const getChargeIcon = (chargeType) => {
    if (chargeType.includes('FREIGHT')) return DollarSign;
    if (chargeType.includes('TRUCKING')) return Truck;
    if (chargeType.includes('CRAINAGE') || chargeType.includes('ARRASTRE') || chargeType.includes('WHARFAGE') || chargeType.includes('LABOR')) return Anchor;
    return FileText;
  };

  const getChargeStatusColor = (isPaid) => {
    return isPaid ? 'text-green-600' : 'text-heading';
  };

  const getChargeStatusIcon = (isPaid) => {
    return CheckCircle;
  };

  // Calculate selection states
  const allSelected = unpaidCharges.length > 0 && selectedCharges.length === unpaidCharges.length;
  const someSelected = selectedCharges.length > 0 && selectedCharges.length < unpaidCharges.length;

  if (!isOpen) return null;

  return (
    <SharedModal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Pay Charges" 
      size="sm"
      className="h-[70vh]"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto max-h-[calc(70vh-120px)] pr-2 -mr-2">
          <div className="space-y-4">
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
              <div className="flex justify-center items-center py-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Total Expenses Summary */}
            {selectedAP && (
              <div className="bg-main rounded-lg p-3 border border-main">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xs font-medium text-muted">Total Expenses</div>
                    <div className="text-lg font-bold text-heading">
                      {formatCurrency(selectedAP.total_expenses || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted">Total Unpaid</div>
                    <div className="text-lg font-bold text-heading">
                      {formatCurrency(totalUnpaidAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted">Unpaid Charges</div>
                    <div className="text-lg font-bold text-heading">
                      {unpaidCharges.length}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Charges List */}
            {selectedAP && unpaidCharges.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-heading">Unpaid Charges</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = someSelected;
                        }
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-primary border-main rounded focus:ring-primary"
                    />
                    <span className="text-xs text-muted">Select All</span>
                  </div>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {unpaidCharges.map((charge, index) => {
                    const StatusIcon = getChargeStatusIcon(charge.is_paid);
                    const ChargeIcon = getChargeIcon(charge.charge_type);
                    const isSelected = selectedCharges.includes(charge.uniqueId); // Use uniqueId
                    
                    return (
                      <div
                        key={charge.uniqueId} // Use uniqueId as key
                        className="bg-surface rounded border border-main p-3"
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleChargeSelect(charge.uniqueId, e.target.checked)} // Use uniqueId
                            className="w-4 h-4 text-primary border-main rounded focus:ring-primary mt-0.5"
                          />
                          <div className="flex-1 grid grid-cols-1 gap-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ChargeIcon className="w-3 h-3 text-muted" />
                                <span className="text-xs font-medium text-heading">
                                  {charge.charge_type.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <StatusIcon className={`w-3 h-3 ${getChargeStatusColor(charge.is_paid)}`} />
                            </div>
                            <div className="text-xs text-muted">{charge.payee}</div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-mono text-muted">
                                {charge.voucher_number}
                              </span>
                              <span className="text-sm font-bold text-heading">
                                {formatCurrency(charge.amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Unpaid Charges */}
            {selectedAP && unpaidCharges.length === 0 && (
              <div className="text-center py-8 text-muted">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <p className="text-sm font-medium text-heading">All charges are paid!</p>
                <p className="text-xs">There are no unpaid charges for this booking.</p>
              </div>
            )}

            {/* No Booking Selected */}
            {!selectedBookingId && !apRecord && (
              <div className="text-center py-8 text-muted">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted" />
                <p className="text-sm font-medium text-heading">Select a booking</p>
                <p className="text-xs">Choose a booking to view and pay its charges.</p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-main mt-4">
          <button
            type="button"
            onClick={handleClose}
            className="modal-btn-cancel text-sm py-2 px-3"
            disabled={isSubmitting}
          >
            Close
          </button>
          {selectedAP && unpaidCharges.length > 0 && (
            <button
              type="button"
              onClick={handleMarkAsPaid}
              disabled={selectedCharges.length === 0 || isSubmitting}
              className="modal-btn-primary disabled:modal-btn-disabled flex items-center gap-2 text-sm py-2 px-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-3 h-3" />
                  Mark as Paid ({selectedCharges.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </SharedModal>
  );
};

export default React.memo(PaidCharges);