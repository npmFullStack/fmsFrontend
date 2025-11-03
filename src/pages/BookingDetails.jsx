import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Calendar, MapPin, Package, User, Mail, Phone } from 'lucide-react';
import { useBooking } from '../hooks/useBooking';
import toast from 'react-hot-toast';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookingQuery, approveBooking, updateBookingStatus } = useBooking();

  const { data: booking, isLoading, isError } = bookingQuery(id);

  const handleApprove = async () => {
    try {
      await approveBooking.mutateAsync(id);
      toast.success('Booking approved! Password sent to customer.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve booking');
    }
  };

  const handleReject = async () => {
    try {
      await updateBookingStatus.mutateAsync({ id, status: 'rejected' });
      toast.success('Booking rejected successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject booking');
    }
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner"></div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="page-error">
        <div className="page-error-content">
          Failed to load booking details. Please try again.
        </div>
        <button onClick={() => navigate('/booking-request')} className="page-btn-primary">
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/booking-requests')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="page-title">Booking Details</h1>
            <p className="page-subtitle">Complete information for booking #{booking.id}</p>
          </div>
        </div>

        {booking.status === 'pending' && (
          <div className="flex space-x-3">
            <button
              onClick={handleApprove}
              disabled={approveBooking.isPending}
              className="page-btn-success disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {approveBooking.isPending ? 'Approving...' : 'Approve'}
            </button>
            <button
              onClick={handleReject}
              disabled={updateBookingStatus.isPending}
              className="page-btn-danger disabled:opacity-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {updateBookingStatus.isPending ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
          booking.status === 'approved' 
            ? 'bg-green-100 text-green-800 border border-green-200'
            : booking.status === 'rejected'
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        }`}>
          Status: {booking.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">{booking.first_name} {booking.last_name}</p>
                <p className="text-sm text-gray-500">Full Name</p>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">{booking.email}</p>
                <p className="text-sm text-gray-500">Email Address</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">{booking.contact_number || 'Not provided'}</p>
                <p className="text-sm text-gray-500">Contact Number</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Details</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {booking.origin?.name} → {booking.destination?.name}
                </p>
                <p className="text-sm text-gray-500">Route</p>
              </div>
            </div>
            <div className="flex items-center">
              <Package className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {booking.container_quantity} × {booking.container_size?.name}
                </p>
                <p className="text-sm text-gray-500">Container</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(booking.departure_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">Departure Date</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Items ({booking.items?.length || 0})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {booking.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.weight} kg</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;