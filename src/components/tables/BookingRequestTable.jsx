import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Calendar, MapPin, Package } from 'lucide-react';

const BookingRequestTable = ({
  data = [],
  onApprove,
  onReject,
  isLoading = false,
  isUpdating = false,
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const handleViewDetails = (bookingId) => {
    navigate(`/booking-details/${bookingId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
        <p className="mt-1 text-sm text-gray-500">No booking requests found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((booking) => (
        <div key={booking.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {booking.first_name?.[0]}{booking.last_name?.[0]}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {booking.first_name} {booking.last_name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{booking.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                {booking.status.toUpperCase()}
              </span>
              
              {booking.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => onApprove(booking)}
                    disabled={isUpdating}
                    className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Approve booking"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(booking)}
                    disabled={isUpdating}
                    className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Reject booking"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span>
                {booking.origin?.name || 'N/A'} → {booking.destination?.name || 'N/A'}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Package className="w-4 h-4 mr-2 text-gray-400" />
              <span>
                {booking.container_quantity} × {booking.container_size?.name || 'Container'}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>
                {new Date(booking.departure_date).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Submitted on {new Date(booking.created_at).toLocaleDateString()} at{' '}
              {new Date(booking.created_at).toLocaleTimeString()}
            </div>
            
            <button
              onClick={() => handleViewDetails(booking.id)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors inline-flex items-center"
            >
              Click to view complete details →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingRequestTable;