// src/components/modals/SendTotalPayment.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { DollarSign, Plus, Trash2, Calculator, TrendingUp, AlertCircle, Loader2, Package } from 'lucide-react';
import SharedModal from '../ui/SharedModal';
import { useAP } from '../../hooks/useAP';
import { formatCurrency } from '../../utils/formatters';

// Charge types data matching your Eloquent models from AddCharge
const chargeTypes = [
  // Freight Charges (from ApFreightCharge)
  { value: 'freight', label: 'Freight Charges' },
  
  // Trucking Charges (from ApTruckingCharge - type field)
  { value: 'local_trucking', label: 'Local Trucking' },
  { value: 'foreign_trucking', label: 'Foreign Trucking' },
  { value: 'labor_charges', label: 'Labor Charges' },
  { value: 'fuel_surcharge', label: 'Fuel Surcharge' },
  { value: 'waiting_time', label: 'Waiting Time' },
  { value: 'demurrage', label: 'Demurrage' },
  { value: 'other_trucking', label: 'Other Trucking Charges' },
  
  // Port Charges (from ApPortCharge - charge_type field)
  { value: 'wharfage_fee', label: 'Wharfage Fee' },
  { value: 'arb_fee', label: 'ARB Fee' },
  { value: 'documentation_fee', label: 'Documentation Fee' },
  { value: 'processing_fee', label: 'Processing Fee' },
  { value: 'customs_fee', label: 'Customs Fee' },
  { value: 'brokerage_fee', label: 'Brokerage Fee' },
  { value: 'other_port', label: 'Other Port Charges' },
  
  // Miscellaneous Charges (from ApMiscCharge - charge_type field)
  { value: 'insurance', label: 'Insurance' },
  { value: 'handling_fee', label: 'Handling Fee' },
  { value: 'storage_fee', label: 'Storage Fee' },
  { value: 'telex_release', label: 'Telex Release' },
  { value: 'seal_fee', label: 'Seal Fee' },
  { value: 'other_misc', label: 'Other Miscellaneous Charges' }
];

const SendTotalPayment = ({ isOpen, onClose, onSave, isLoading = false, selectedAR = null }) => {
  const [charges, setCharges] = useState([
    { id: 1, description: '', amount: '', markup: '' }
  ]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [formTouched, setFormTouched] = useState(false);

  const { apByBookingQuery } = useAP();
  
  // Get booking ID from selected AR record
  const bookingId = selectedAR?.booking_id;
  
  // Fetch AP data for this booking to show expenses
  const { data: existingAP, isLoading: isLoadingAP } = apByBookingQuery(bookingId);

  // Initialize charges from existing AP data
  useEffect(() => {
    if (isOpen && existingAP && existingAP.total_expenses > 0) {
      const initialCharges = [];
      
      // Add freight charge if exists
      if (existingAP.freight_charge && existingAP.freight_charge.amount > 0) {
        initialCharges.push({
          id: Date.now() + 1,
          description: 'freight',
          amount: existingAP.freight_charge.amount,
          markup: '30'
        });
      }
      
      // Add trucking charges
      if (existingAP.trucking_charges && existingAP.trucking_charges.length > 0) {
        existingAP.trucking_charges.forEach(charge => {
          if (charge.amount > 0) {
            initialCharges.push({
              id: Date.now() + Math.random(),
              description: charge.type === 'ORIGIN' ? 'local_trucking' : 'foreign_trucking',
              amount: charge.amount,
              markup: '30'
            });
          }
        });
      }
      
      // Add port charges
      if (existingAP.port_charges && existingAP.port_charges.length > 0) {
        existingAP.port_charges.forEach(charge => {
          if (charge.amount > 0) {
            initialCharges.push({
              id: Date.now() + Math.random(),
              description: 'wharfage_fee',
              amount: charge.amount,
              markup: '30'
            });
          }
        });
      }
      
      // Add misc charges
      if (existingAP.misc_charges && existingAP.misc_charges.length > 0) {
        existingAP.misc_charges.forEach(charge => {
          if (charge.amount > 0) {
            initialCharges.push({
              id: Date.now() + Math.random(),
              description: 'handling_fee',
              amount: charge.amount,
              markup: '30'
            });
          }
        });
      }
      
      // If no charges found but total expenses exist, create a default charge
      if (initialCharges.length === 0 && existingAP.total_expenses > 0) {
        initialCharges.push({
          id: 1,
          description: '',
          amount: existingAP.total_expenses,
          markup: '30'
        });
      }
      
      setCharges(initialCharges.length > 0 ? initialCharges : [{ id: 1, description: '', amount: '', markup: '30' }]);
      setTotalExpenses(existingAP.total_expenses);
    } else if (isOpen) {
      // Reset form when opening with no existing data
      setCharges([{ id: 1, description: '', amount: '', markup: '30' }]);
      setTotalExpenses(0);
      setFormTouched(false);
    }
  }, [isOpen, existingAP]);

  // Calculate totals whenever charges change
  useEffect(() => {
    const expenses = charges.reduce((sum, charge) => {
      const amount = parseFloat(charge.amount) || 0;
      return sum + amount;
    }, 0);
    
    setTotalExpenses(expenses);
    
    const total = charges.reduce((sum, charge) => {
      const amount = parseFloat(charge.amount) || 0;
      const markup = parseFloat(charge.markup) || 0;
      const markupMultiplier = 1 + (markup / 100);
      return sum + (amount * markupMultiplier);
    }, 0);
    
    setTotalAmount(total);
  }, [charges]);

  const addCharge = () => {
    setCharges(prev => [...prev, {
      id: Date.now(),
      description: '',
      amount: '',
      markup: '30'
    }]);
    setFormTouched(true);
  };

  const removeCharge = (id) => {
    if (charges.length > 1) {
      setCharges(prev => prev.filter(charge => charge.id !== id));
      setFormTouched(true);
    }
  };

  const updateCharge = (id, field, value) => {
    setCharges(prev => prev.map(charge => 
      charge.id === id ? { ...charge, [field]: value } : charge
    ));
    setFormTouched(true);
  };

  const handleDescriptionChange = (id, selectedOption) => {
    const descriptionValue = selectedOption?.value || '';
    updateCharge(id, 'description', descriptionValue);
  };

  const handleAmountChange = (id, value) => {
    // Allow empty string for better UX
    if (value === '') {
      updateCharge(id, 'amount', '');
      return;
    }
    
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return; // Invalid input, don't update
    }
    
    // Parse as float, but keep as string if it ends with decimal point
    if (cleanValue.endsWith('.')) {
      updateCharge(id, 'amount', cleanValue);
    } else {
      const numValue = parseFloat(cleanValue);
      if (!isNaN(numValue)) {
        updateCharge(id, 'amount', numValue);
      }
    }
  };

  const handleMarkupChange = (id, value) => {
    // Allow empty string for better UX
    if (value === '') {
      updateCharge(id, 'markup', '');
      return;
    }
    
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return; // Invalid input, don't update
    }
    
    // Parse as float, but keep as string if it ends with decimal point
    if (cleanValue.endsWith('.')) {
      updateCharge(id, 'markup', cleanValue);
    } else {
      const numValue = parseFloat(cleanValue);
      if (!isNaN(numValue)) {
        updateCharge(id, 'markup', numValue);
      }
    }
  };

  const applyQuickMarkup = (id, percentage) => {
    updateCharge(id, 'markup', percentage.toString());
  };

  // Calculate individual charge with markup
  const calculateChargeTotal = (charge) => {
    const amount = parseFloat(charge.amount) || 0;
    const markup = parseFloat(charge.markup) || 0;
    const markupMultiplier = 1 + (markup / 100);
    return amount * markupMultiplier;
  };


const handleSubmit = (e) => {
  e.preventDefault();
  
  // Validate charges
  const hasEmptyFields = charges.some(charge => 
    !charge.description.trim() || !charge.amount || parseFloat(charge.amount) <= 0
  );

  if (hasEmptyFields) {
    alert('Please fill in all charge descriptions and amounts');
    return;
  }

  if (totalAmount <= 0) {
    alert('Total amount must be greater than 0');
    return;
  }

  // Build charges array with proper data
  const paymentCharges = charges.map(charge => {
    const chargeType = chargeTypes.find(type => type.value === charge.description);
    const baseAmount = parseFloat(charge.amount) || 0;
    const markupPercent = parseFloat(charge.markup) || 0;
    const markupAmount = baseAmount * (markupPercent / 100);
    const total = baseAmount + markupAmount;

    return {
      description: chargeType?.label || charge.description,
      type: charge.description, // Save the type value
      amount: baseAmount,
      markup: markupPercent,
      markup_amount: markupAmount,
      total: total
    };
  });

  const paymentData = {
    booking_id: bookingId,
    total_payment: totalAmount,
    charges: paymentCharges, // This will be saved to the database
    total_expenses: totalExpenses
  };

  console.log('Sending payment data:', paymentData);
  onSave(paymentData);
};

  // Calculate profit metrics
  const profit = totalAmount - totalExpenses;
  const profitMargin = totalExpenses > 0 ? (profit / totalExpenses) * 100 : 0;

  if (!isOpen) return null;

  return (
    <SharedModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Set Total Payment Amount" 
      size="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 max-h-[calc(80vh-120px)]">
          <div className="space-y-4">
            {/* Selected Booking Info */}
            {selectedAR && selectedAR.booking && (
              <div className="bg-main border border-main rounded-lg p-3">
                <h3 className="text-base font-semibold text-heading mb-2">Booking Details</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-3 h-3 text-blue-600" />
                  <span className="font-medium text-heading text-sm uppercase">Booking #{selectedAR.booking.booking_number}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium text-muted">Customer:</span>
                    <p className="text-heading">{selectedAR.booking.first_name} {selectedAR.booking.last_name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted">Route:</span>
                    <p className="text-heading">
                      {selectedAR.booking.origin?.route_name} → {selectedAR.booking.destination?.route_name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Charges Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-heading">Charges with Markup</h3>
                <button
                  type="button"
                  onClick={addCharge}
                  className="flex items-center gap-1 text-primary hover:text-primary-dark text-xs"
                >
                  <Plus className="w-3 h-3" />
                  Add Charge
                </button>
              </div>

              {charges.map((charge, index) => {
                const selectedDescription = chargeTypes.find(type => type.value === charge.description) || null;
                const availableChargeTypes = chargeTypes.filter(type => 
                  !charges.some((c, i) => i !== index && c.description === type.value)
                );

                const chargeTotal = calculateChargeTotal(charge);
                const chargeProfit = chargeTotal - (parseFloat(charge.amount) || 0);

                return (
                  <div key={charge.id} className="bg-main border border-main rounded-lg p-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-heading text-sm">Charge {index + 1}</h4>
                      {charges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCharge(charge.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="modal-label text-heading text-xs">Description</label>
                        <Select
                          options={availableChargeTypes}
                          value={selectedDescription}
                          onChange={(selected) => handleDescriptionChange(charge.id, selected)}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Select charge type"
                        />
                        {formTouched && !charge.description && (
                          <span className="modal-error text-xs">Please select a charge type</span>
                        )}
                      </div>
                      
                      <div>
                        <label className="modal-label text-heading text-xs">Amount (₱)</label>
                        <input
                          type="text"
                          placeholder="0.00"
                          value={charge.amount}
                          onChange={(e) => handleAmountChange(charge.id, e.target.value)}
                          className="modal-input text-sm py-2"
                          required
                        />
                        {formTouched && (!charge.amount || parseFloat(charge.amount) <= 0) && (
                          <span className="modal-error text-xs">Please enter a valid amount</span>
                        )}
                      </div>

                      <div>
                        <label className="modal-label text-heading text-xs">Markup Percentage (%)</label>
                        <input
                          type="text"
                          placeholder="0.00"
                          value={charge.markup}
                          onChange={(e) => handleMarkupChange(charge.id, e.target.value)}
                          className="modal-input text-sm py-2"
                        />
                        
                        {/* Quick Markup Buttons */}
                        <div className="flex gap-1 flex-wrap mt-2">
                          <button
                            type="button"
                            onClick={() => applyQuickMarkup(charge.id, 20)}
                            className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark transition-colors"
                          >
                            20%
                          </button>
                          <button
                            type="button"
                            onClick={() => applyQuickMarkup(charge.id, 30)}
                            className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark transition-colors"
                          >
                            30%
                          </button>
                          <button
                            type="button"
                            onClick={() => applyQuickMarkup(charge.id, 50)}
                            className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark transition-colors"
                          >
                            50%
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Charge Summary */}
                    <div className="bg-main rounded p-2 border border-surface">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-muted uppercase">Base Amount:</div>
                        <div className="font-medium text-content text-right">
                          {formatCurrency(parseFloat(charge.amount) || 0)}
                        </div>
                        
                        <div className="text-muted uppercase">Markup ({charge.markup || 0}%):</div>
                        <div className="font-medium text-green-600 text-right">
                          {formatCurrency(chargeProfit)}
                        </div>
                        
                        <div className="text-muted uppercase font-medium
                        border-t border-surface pt-1">Total:</div>
                        <div className="font-bold text-heading text-right
                        border-t border-surface pt-1">
                          {formatCurrency(chargeTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div className="bg-main border border-main rounded-lg p-3 space-y-3">
              <h3 className="text-base font-semibold text-heading">Financial Summary</h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs font-bold text-muted mb-1">TOTAL EXPENSES:</div>
                  <div className="text-heading font-semibold">
                    {formatCurrency(totalExpenses)}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs font-bold text-muted mb-1">TOTAL PROFIT:</div>
                  <div className="text-heading font-semibold text-green-600">
                    {formatCurrency(profit)}
                  </div>
                </div>
              </div>

              {/* Profit Calculation */}
              <div className="border-t border-main pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-heading" />
                  <span className="font-medium text-heading text-sm">Overall Profit Margin</span>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {profitMargin.toFixed(1)}%
                  </div>
                </div>
                
                {profit < 0 && (
                  <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs mt-2">
                    <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-red-700">Warning: Total amount is below cost</span>
                  </div>
                )}
              </div>
            </div>

            {/* Total Payment Amount */}
            <div className="bg-main border border-main rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-heading" />
                  <span className="text-base font-semibold text-heading">Total Payment Amount</span>
                </div>
                <span className="text-xl font-bold text-heading">
                  ₱{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-main mt-4 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="modal-btn-cancel text-sm py-2 px-3"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`modal-btn-primary text-sm py-2 px-3 ${isLoading ? 'modal-btn-disabled' : ''}`}
            disabled={isLoading || totalAmount <= 0}
          >
            {isLoading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                Setting Amount...
              </>
            ) : (
              'Set Total Amount'
            )}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default SendTotalPayment;