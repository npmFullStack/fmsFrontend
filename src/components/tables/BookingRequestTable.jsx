// src/components/tables/BookingRequestTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Package } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const BookingRequestTable = ({
  data = [],
  onApprove,
  onReject,
  isLoading = false,
  isUpdating = false,
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': 
        return 'badge bg-green-500 text-white border-green-600';
      case 'rejected': 
        return 'badge bg-red-500 text-white border-red-600';
      default: 
        return 'badge bg-yellow-500 text-white border-yellow-600';
    }
  };

  const handleViewDetails = (bookingId) => {
    navigate(`/booking-details/${bookingId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-surface rounded-lg border border-main p-6 animate-pulse">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
              </div>
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="page-empty-state">
        <Package className="page-empty-icon" />
        <h3 className="page-empty-title">No bookings</h3>
        <p className="page-empty-description">No booking requests found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((booking) => (
        <div key={booking.id} className="bg-surface rounded-lg border border-main p-6 hover:shadow-md transition-shadow">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-heading truncate">
                    {booking.first_name} {booking.last_name}
                  </h3>
                  <p className="text-sm text-muted truncate">{booking.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={getStatusBadge(booking.status)}>
                {booking.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Booking Details - 3 equal columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-sm text-muted">
              <Package className="w-4 h-4 mr-2 text-muted flex-shrink-0" />
              <span className="truncate">
                {booking.container_quantity || 0}X{booking.container_size?.size || booking.container_size?.name || 'Container'}
              </span>
            </div>
            <div className="flex items-center text-sm text-muted">
              <Calendar className="w-4 h-4 mr-2 text-muted flex-shrink-0" />
              <span className="truncate">
                {formatDate(booking.departure_date)}
              </span>
            </div>
            <div className="flex items-center text-sm text-muted">
              <span className="text-muted mr-2">Mode:</span>
              <span className="text-content font-medium truncate">
                {booking.mode_of_service || 'N/A'}
              </span>
            </div>
          </div>

          {/* Route Information with MapPin */}
          <div className="flex items-center text-sm text-muted mb-4">
            <MapPin className="w-4 h-4 mr-2 text-muted flex-shrink-0" />
            <span className="text-content font-medium">
              {booking.origin?.route_name || booking.origin?.name || 'N/A'} → {booking.destination?.route_name || booking.destination?.name || 'N/A'}
            </span>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="text-sm">
              <span className="text-muted">Shipping Line: </span>
              <span className="text-content font-medium">{booking.shipping_line?.name || 'N/A'}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted">Terms: </span>
              <span className="text-content font-medium">{booking.terms || 'N/A'} days</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-main">
            <div className="text-sm text-muted">
              Submitted on {formatDate(booking.created_at)}
            </div>
            
            <button
              onClick={() => handleViewDetails(booking.id)}
              className="text-primary hover:text-blue-700 text-sm font-medium transition-colors inline-flex items-center"
            >
              View complete details →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingRequestTable;