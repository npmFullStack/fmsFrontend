// src/components/modals/UpdateCargoStatus.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import SharedModal from '../ui/SharedModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const UpdateCargoStatus = ({ 
  isOpen, 
  onClose, 
  onUpdate, 
  cargoMonitoring, 
  isLoading = false 
}) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusDate, setStatusDate] = useState(new Date());
  const [formTouched, setFormTouched] = useState(false);

  const statusOptions = [
    { value: 'Picked Up', label: 'Picked Up' },
    { value: 'Origin Port', label: 'Origin Port' },
    { value: 'In Transit', label: 'In Transit' },
    { value: 'Destination Port', label: 'Destination Port' },
    { value: 'Out for Delivery', label: 'Out for Delivery' },
    { value: 'Delivered', label: 'Delivered' }
  ];

  useEffect(() => {
    if (isOpen && cargoMonitoring) {
      setSelectedStatus('');
      setStatusDate(new Date());
      setFormTouched(false);
    }
  }, [isOpen, cargoMonitoring]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStatus) {
      alert('Please select a status');
      return;
    }

    try {
      await onUpdate(cargoMonitoring.id, selectedStatus);
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleClose = () => {
    setSelectedStatus('');
    setStatusDate(new Date());
    setFormTouched(false);
    onClose();
  };

  // Custom DatePicker input
  const DateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <div className="relative">
      <input
        ref={ref}
        onClick={onClick}
        value={value || ""}
        readOnly
        placeholder={placeholder}
        className="modal-input pr-10 cursor-pointer"
      />
      <button
        type="button"
        onClick={onClick}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
        aria-label="open-calendar"
      >
        <Calendar className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  ));
  DateInput.displayName = "DateInput";

  if (!cargoMonitoring) return null;

  const booking = cargoMonitoring.booking;

  return (
    <SharedModal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Update Cargo Status" 
      size="md"
    >
      <div className="space-y-6">
        {/* Cargo Information */}
        <div className="bg-main border border-main rounded-lg p-4">
          <h3 className="font-semibold text-heading mb-2">Cargo Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-semibold text-muted">Booking #:</span>
              <div className="text-content">{booking.booking_number}</div>
            </div>
            <div>
              <span className="font-semibold text-muted">HWB #:</span>
              <div className="text-content">{booking.hwb_number}</div>
            </div>
            <div>
              <span className="font-semibold text-muted">VAN #:</span>
              <div className="text-content">{booking.van_number}</div>
            </div>
            <div>
              <span className="font-semibold text-muted">Container:</span>
              <div className="text-content">
                {booking.container_quantity} x {booking.container_size?.size || booking.container_size?.name}
              </div>
            </div>
            <div className="col-span-2">
              <span className="font-semibold text-muted">Current Status:</span>
              <div className="text-content font-medium">{cargoMonitoring.current_status || 'Not Set'}</div>
            </div>
          </div>
        </div>

        {/* Status Update Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="modal-label">Select New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setFormTouched(true);
              }}
              className="modal-input"
              required
            >
              <option value="">Select status...</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="modal-label">Status Date & Time</label>
            <DatePicker
              selected={statusDate}
              onChange={(date) => {
                setStatusDate(date);
                setFormTouched(true);
              }}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              customInput={<DateInput placeholder="Select date and time" />}
            />
            <p className="text-xs text-muted mt-1">
              This will mark the status with the selected date and time
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-main">
            <button
              type="button"
              onClick={handleClose}
              className={`modal-btn-cancel ${isLoading ? 'modal-btn-disabled' : ''}`}
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`modal-btn-primary ${(!selectedStatus || isLoading) ? 'modal-btn-disabled' : ''}`}
              disabled={!selectedStatus || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </form>
      </div>
    </SharedModal>
  );
};

export default UpdateCargoStatus;