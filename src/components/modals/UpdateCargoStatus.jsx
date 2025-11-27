// src/components/modals/UpdateCargoStatus.jsx
import React, { useState, useEffect } from "react";
import { Calendar, Clock, Loader2, Truck, Ship, MapPin, CheckCircle } from "lucide-react";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import SharedModal from "../ui/SharedModal";

const UpdateCargoStatus = ({ isOpen, onClose, onUpdate, cargoMonitoring, isLoading = false }) => {
  const [statusDates, setStatusDates] = useState({});

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Picked Up", label: "Picked Up" },
    { value: "Origin Port", label: "Origin Port" },
    { value: "In Transit", label: "In Transit" },
    { value: "Destination Port", label: "Destination Port" },
    { value: "Out for Delivery", label: "Out for Delivery" },
    { value: "Delivered", label: "Delivered" },
  ];

  useEffect(() => {
    if (isOpen && cargoMonitoring) {
      // Initialize status dates from cargo monitoring data
      const initialDates = {};
      statusOptions.forEach(status => {
        const dateField = `${status.value.toLowerCase().replace(' ', '_')}_at`;
        if (cargoMonitoring[dateField]) {
          initialDates[status.value] = new Date(cargoMonitoring[dateField]);
        } else {
          initialDates[status.value] = new Date();
        }
      });
      setStatusDates(initialDates);
    }
  }, [isOpen, cargoMonitoring]);

  const handleDateChange = (status, date) => {
    setStatusDates(prev => ({
      ...prev,
      [status]: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update all statuses that have dates
      const updatePromises = Object.entries(statusDates)
        .filter(([status, date]) => date)
        .map(([status, date]) => 
          onUpdate(
            cargoMonitoring.id,
            status,
            new Date(date).toISOString()
          )
        );

      await Promise.all(updatePromises);
      onClose();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleClose = () => {
    setStatusDates({});
    onClose();
  };

  const getStatusIcon = (status) => {
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

  const getStatusDate = (status) => {
    if (!cargoMonitoring) return null;
    
    const dateField = `${status.toLowerCase().replace(' ', '_')}_at`;
    return cargoMonitoring[dateField];
  };

  const isStatusCompleted = (status) => {
    return !!getStatusDate(status);
  };

  const isCurrentStatus = (status) => {
    return cargoMonitoring?.current_status === status;
  };

  if (!cargoMonitoring) return null;
  const booking = cargoMonitoring.booking;

  return (
    <SharedModal isOpen={isOpen} onClose={handleClose} title="Update Cargo Status Timeline" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Cargo Info */}
        <div className="border border-main rounded-lg p-4 mb-4 flex-shrink-0">
          <h3 className="text-heading font-semibold mb-3 text-sm">Cargo Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
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
            <div>
              <div className="text-muted font-medium">Current Status</div>
              <div className="text-content font-semibold">
                {cargoMonitoring.current_status || "Not Set"}
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline with Date Pickers - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {statusOptions.map((status, index) => {
              const isCompleted = isStatusCompleted(status.value);
              const isCurrent = isCurrentStatus(status.value);
              const statusDate = getStatusDate(status.value);
              const currentDate = statusDates[status.value] || new Date();

              return (
                <div
                  key={status.value}
                  className="relative p-4 rounded-lg border border-main"
                >
                  {/* Status Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        isCurrent 
                          ? 'border-blue-500 text-blue-500' 
                          : isCompleted 
                          ? 'border-green-500 text-green-500'
                          : 'border-gray-300 text-gray-400'
                      }`}>
                        {getStatusIcon(status.value)}
                      </div>
                      <div>
                        <div className={`font-medium ${
                          isCurrent ? 'text-blue-600' : 'text-heading'
                        }`}>
                          {status.label}
                          {isCurrent && (
                            <span className="ml-2 text-xs text-blue-600 font-normal">(Current)</span>
                          )}
                        </div>
                        {statusDate && (
                          <div className="text-xs text-muted flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            Set: {new Date(statusDate).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>

                  {/* Date & Time Picker */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-heading">
                      Set Date & Time:
                    </label>
                    <div className="relative">
                      <Datetime
                        value={currentDate}
                        onChange={(date) => handleDateChange(status.value, date)}
                        inputProps={{
                          placeholder: "Select date and time...",
                          className: "modal-input pr-10 cursor-text w-full text-sm",
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
                  
                  {/* Timeline connector (except for last item) */}
                  {index < statusOptions.length - 1 && (
                    <div className={`absolute left-6 top-full w-0.5 h-4 -ml-px ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-main mt-4 flex-shrink-0">
          <button 
            type="button" 
            onClick={handleClose} 
            className="modal-btn-cancel" 
            disabled={isLoading}
          >
            Cancel
          </button>

          <button 
            type="submit" 
            className="modal-btn-primary" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating All Statuses...
              </>
            ) : (
              "Update All Statuses"
            )}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default UpdateCargoStatus;