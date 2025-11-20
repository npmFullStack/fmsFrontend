// src/components/modals/UpdateCargoStatus.jsx
import React, { useState, useEffect } from "react";
import { Calendar, Clock, Loader2 } from "lucide-react";
import Select from "react-select";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import SharedModal from "../ui/SharedModal";

const UpdateCargoStatus = ({ isOpen, onClose, onUpdate, cargoMonitoring, isLoading = false }) => {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState("");

  const statusOptions = [
    { value: "Picked Up", label: "Picked Up" },
    { value: "Origin Port", label: "Origin Port" },
    { value: "In Transit", label: "In Transit" },
    { value: "Destination Port", label: "Destination Port" },
    { value: "Out for Delivery", label: "Out for Delivery" },
    { value: "Delivered", label: "Delivered" },
  ];

  useEffect(() => {
    if (isOpen && cargoMonitoring) {
      setSelectedStatus(null);
      setSelectedDateTime(new Date());
    }
  }, [isOpen, cargoMonitoring]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return alert("Please select a status");
    if (!selectedDateTime) return alert("Please select date and time");

    try {
      await onUpdate(
        cargoMonitoring.id,
        selectedStatus.value,
        new Date(selectedDateTime).toISOString()
      );
      onClose();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleClose = () => {
    setSelectedStatus(null);
    setSelectedDateTime(new Date());
    onClose();
  };

  // Custom input component for react-datetime
  const CustomDateTimeInput = (props) => (
    <input
      {...props}
      className="modal-input pr-10 cursor-text w-full"
      readOnly={false}
    />
  );

  if (!cargoMonitoring) return null;
  const booking = cargoMonitoring.booking;

  return (
    <SharedModal isOpen={isOpen} onClose={handleClose} title="Update Cargo Status" size="sm">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Cargo Info */}
        <div className="bg-main border border-main rounded-lg p-3">
          <h3 className="text-heading font-semibold mb-2 text-sm">Cargo Information</h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-muted font-medium">Booking #</div>
              <div className="text-content font-medium truncate">{booking.booking_number}</div>
            </div>
            <div>
              <div className="text-muted font-medium">HWB #</div>
              <div className="text-content font-medium truncate">{booking.hwb_number}</div>
            </div>
            <div>
              <div className="text-muted font-medium">VAN #</div>
              <div className="text-content font-medium truncate">{booking.van_number}</div>
            </div>
            <div className="col-span-3">
              <div className="text-muted font-medium">Current Status</div>
              <div className="text-content font-semibold">
                {cargoMonitoring.current_status || "Not Set"}
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time Picker */}
        <div>
          <label className="modal-label">Status Date & Time</label>
          <div className="relative">
            <Datetime
              value={selectedDateTime}
              onChange={setSelectedDateTime}
              inputProps={{
                placeholder: "Select date and time...",
                className: "modal-input pr-10 cursor-text w-full",
                readOnly: false
              }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              closeOnSelect={true}
              utc={false}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted pointer-events-none">
              <Calendar className="w-4 h-4" />
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Status Select */}
        <div>
          <label className="modal-label">Select New Status</label>
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={statusOptions}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select status..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-main">
          <button type="button" onClick={handleClose} className="modal-btn-cancel" disabled={isLoading}>
            Cancel
          </button>

          <button type="submit" className="modal-btn-primary" disabled={!selectedStatus || isLoading}>
{isLoading ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin" />
    Updating...
  </>
) : (
  "Update Status"
)}
          </button>
        </div>

      </form>
    </SharedModal>
  );
};

export default UpdateCargoStatus;