// src/components/modals/SendQuoteCharge.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { DollarSign, Plus, Trash2, Calculator } from 'lucide-react';
import SharedModal from '../ui/SharedModal';

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

const SendQuoteCharge = ({ isOpen, onClose, onSave, quote, isLoading = false }) => {
  const [charges, setCharges] = useState([
    { id: 1, description: '', amount: '' }
  ]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [formTouched, setFormTouched] = useState(false);

  // Calculate total amount whenever charges change
  useEffect(() => {
    const total = charges.reduce((sum, charge) => {
      const amount = parseFloat(charge.amount) || 0;
      return sum + amount;
    }, 0);
    setTotalAmount(total);
  }, [charges]);

  // Reset form when modal opens with new quote
  useEffect(() => {
    if (isOpen && quote) {
      setCharges([{ id: 1, description: '', amount: '' }]);
      setFormTouched(false);
    }
  }, [isOpen, quote]);

  const addCharge = () => {
    setCharges(prev => [...prev, {
      id: Date.now(),
      description: '',
      amount: ''
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

    const quoteData = {
      charges: charges.map(charge => ({
        description: chargeTypes.find(type => type.value === charge.description)?.label || charge.description,
        amount: parseFloat(charge.amount)
      })),
      totalAmount: totalAmount
    };

    onSave(quoteData);
  };

  if (!isOpen) return null;

  return (
    <SharedModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Send Quote to Customer" 
      size="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 max-h-[calc(80vh-120px)]">
          <div className="space-y-4">
            {/* Quote Information */}
            {quote && (
              <div className="bg-main border border-main rounded-lg p-3">
                <h3 className="text-base font-semibold text-heading mb-2">Quote Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-muted">Customer:</span>
                    <p className="text-heading">{quote.first_name} {quote.last_name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted">Email:</span>
                    <p className="text-heading">{quote.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted">Route:</span>
                    <p className="text-heading">
                      {quote.origin?.route_name} → {quote.destination?.route_name}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-muted">Container:</span>
                    <p className="text-heading">
                      {quote.container_quantity} × {quote.container_size?.size}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Charges Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-heading">Quote Charges</h3>
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

                return (
                  <div key={charge.id} className="bg-main border border-main rounded-lg p-3 space-y-2">
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
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Amount */}
            <div className="bg-main border border-main rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-heading" />
                  <span className="text-base font-semibold text-heading">Total Quote Amount</span>
                </div>
                <span className="text-xl font-bold text-heading">
                  ₱{totalAmount.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted mt-1">
                This amount will be sent to the customer via email.
              </p>
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
                Sending...
              </>
            ) : (
              'Send Quote'
            )}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default SendQuoteCharge;