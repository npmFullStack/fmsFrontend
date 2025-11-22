// src/components/modals/SendQuoteCharge.jsx
import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Trash2, Calculator } from 'lucide-react';
import SharedModal from '../ui/SharedModal';

const SendQuoteCharge = ({ isOpen, onClose, onSave, quote, isLoading = false }) => {
  const [charges, setCharges] = useState([
    { id: 1, description: '', amount: '' }
  ]);
  const [totalAmount, setTotalAmount] = useState(0);

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
    }
  }, [isOpen, quote]);

  const addCharge = () => {
    setCharges(prev => [...prev, {
      id: Date.now(),
      description: '',
      amount: ''
    }]);
  };

  const removeCharge = (id) => {
    if (charges.length > 1) {
      setCharges(prev => prev.filter(charge => charge.id !== id));
    }
  };

  const updateCharge = (id, field, value) => {
    setCharges(prev => prev.map(charge => 
      charge.id === id ? { ...charge, [field]: value } : charge
    ));
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
        description: charge.description,
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
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quote Information */}
        {quote && (
          <div className="bg-main border border-main rounded-lg p-4">
            <h3 className="text-lg font-semibold text-heading mb-2">Quote Details</h3>
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-heading">Quote Charges</h3>
            <button
              type="button"
              onClick={addCharge}
              className="flex items-center gap-2 text-primary hover:text-primary-dark text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Charge
            </button>
          </div>

          {charges.map((charge, index) => (
            <div key={charge.id} className="bg-main border border-main rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-heading">Charge {index + 1}</h4>
                {charges.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCharge(charge.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="modal-label text-heading">Description</label>
                  <input
                    type="text"
                    placeholder="e.g., Freight charges, Port fees, etc."
                    value={charge.description}
                    onChange={(e) => updateCharge(charge.id, 'description', e.target.value)}
                    className="modal-input"
                    required
                  />
                </div>
                <div>
                  <label className="modal-label text-heading">Amount (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={charge.amount}
                    onChange={(e) => updateCharge(charge.id, 'amount', e.target.value)}
                    className="modal-input"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Amount */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-semibold text-blue-800">Total Quote Amount</span>
            </div>
            <span className="text-2xl font-bold text-blue-800">
              ₱{totalAmount.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-blue-600 mt-2">
            This amount will be sent to the customer via email.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-main">
          <button
            type="button"
            onClick={onClose}
            className="modal-btn-cancel"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`modal-btn-primary ${isLoading ? 'modal-btn-disabled' : ''}`}
            disabled={isLoading || totalAmount <= 0}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Send Quote (₱{totalAmount.toFixed(2)})
              </>
            )}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default SendQuoteCharge;