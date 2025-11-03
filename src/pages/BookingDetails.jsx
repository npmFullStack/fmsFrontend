// src/pages/BookingDetails.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  MapPin, 
  Package, 
  User, 
  Mail, 
  Phone, 
  Truck,
  Ship,
  Clock,
  FileText,
  Building,
  Navigation
} from 'lucide-react';
import { useBooking } from '../hooks/useBooking';
import { formatDate } from '../utils/formatters';
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': 
        return 'badge bg-green-500 text-white border-green-600';
      case 'rejected': 
        return 'badge bg-red-500 text-white border-red-600';
      case 'in_transit':
        return 'badge bg-blue-500 text-white border-blue-600';
      case 'delivered':
        return 'badge bg-purple-500 text-white border-purple-600';
      default: 
        return 'badge bg-yellow-500 text-white border-yellow-600';
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'approved': 
        return 'Booking has been approved and customer notified';
      case 'rejected': 
        return 'Booking has been rejected';
      case 'in_transit':
        return 'Cargo is currently in transit';
      case 'delivered':
        return 'Cargo has been successfully delivered';
      default: 
        return 'Awaiting administrative approval';
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
        <button 
          onClick={() => navigate('/booking-request')} 
          className="modal-btn-primary mt-4"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const totalWeight = booking.items?.reduce((sum, item) => sum + (item.weight * item.quantity), 0) || 0;
  const totalItems = booking.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="page-container">
      {/* Header with Compact Status */}
      <div className="page-header">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/booking-request')}
              className="p-2 hover:bg-surface rounded-lg transition-colors border border-main"
            >
              <ArrowLeft className="w-5 h-5 text-content" />
            </button>
            <div>
              <h1 className="page-title">Booking #{booking.id}</h1>
              <p className="page-subtitle">Complete booking details and information</p>
            </div>
          </div>

          {/* Compact Status Badge */}
          <div className="flex flex-col items-end space-y-2">
            <div className={getStatusBadge(booking.status)}>
              {booking.status.replace('_', ' ').toUpperCase()}
            </div>
            <p className="text-xs text-muted text-right max-w-[200px]">
              {getStatusDescription(booking.status)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface rounded-lg border border-main p-4 text-center">
          <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-heading">{booking.container_quantity || 0}</p>
          <p className="text-sm text-muted">Containers</p>
        </div>
        <div className="bg-surface rounded-lg border border-main p-4 text-center">
          <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-heading">{totalItems}</p>
          <p className="text-sm text-muted">Total Items</p>
        </div>
        <div className="bg-surface rounded-lg border border-main p-4 text-center">
          <Navigation className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-heading">{totalWeight}kg</p>
          <p className="text-sm text-muted">Total Weight</p>
        </div>
        <div className="bg-surface rounded-lg border border-main p-4 text-center">
          <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-heading">{booking.terms || 0}</p>
          <p className="text-sm text-muted">Terms (Days)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-surface rounded-lg border border-main p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-heading">Customer Information</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-main rounded-lg">
              <div>
                <p className="text-sm font-medium text-heading">Full Name</p>
                <p className="text-sm text-muted">{booking.first_name} {booking.last_name}</p>
              </div>
              <User className="w-4 h-4 text-muted" />
            </div>
            <div className="flex items-center justify-between p-3 bg-main rounded-lg">
              <div>
                <p className="text-sm font-medium text-heading">Email Address</p>
                <p className="text-sm text-muted truncate">{booking.email}</p>
              </div>
              <Mail className="w-4 h-4 text-muted" />
            </div>
            <div className="flex items-center justify-between p-3 bg-main rounded-lg">
              <div>
                <p className="text-sm font-medium text-heading">Contact Number</p>
                <p className="text-sm text-muted">{booking.contact_number || 'Not provided'}</p>
              </div>
              <Phone className="w-4 h-4 text-muted" />
            </div>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="bg-surface rounded-lg border border-main p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Ship className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-heading">Shipping Details</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-main rounded-lg">
              <div>
                <p className="text-sm font-medium text-heading">Route</p>
                <p className="text-sm text-muted">
                  {booking.origin?.route_name || booking.origin?.name || 'N/A'} → {booking.destination?.route_name || booking.destination?.name || 'N/A'}
                </p>
              </div>
              <MapPin className="w-4 h-4 text-muted" />
            </div>
            <div className="flex items-center justify-between p-3 bg-main rounded-lg">
              <div>
                <p className="text-sm font-medium text-heading">Container Volume</p>
                <p className="text-sm text-muted">
                  {booking.container_quantity || 0}X{booking.container_size?.size || booking.container_size?.name || 'Container'}
                </p>
              </div>
              <Package className="w-4 h-4 text-muted" />
            </div>
            <div className="flex items-center justify-between p-3 bg-main rounded-lg">
              <div>
                <p className="text-sm font-medium text-heading">Departure Date</p>
                <p className="text-sm text-muted">{formatDate(booking.departure_date)}</p>
              </div>
              <Calendar className="w-4 h-4 text-muted" />
            </div>
            <div className="flex items-center justify-between p-3 bg-main rounded-lg">
              <div>
                <p className="text-sm font-medium text-heading">Service Mode</p>
                <p className="text-sm text-muted">{booking.mode_of_service || 'N/A'}</p>
              </div>
              <Truck className="w-4 h-4 text-muted" />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-surface rounded-lg border border-main p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-heading">Additional Information</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-main rounded-lg">
                <p className="text-sm text-muted mb-1">Shipping Line</p>
                <p className="text-sm font-medium text-heading">{booking.shipping_line?.name || 'Not specified'}</p>
              </div>
              <div className="p-3 bg-main rounded-lg">
                <p className="text-sm text-muted mb-1">Terms</p>
                <p className="text-sm font-medium text-heading">{booking.terms || 'N/A'} days</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-main rounded-lg">
                <p className="text-sm text-muted mb-1">Delivery Date</p>
                <p className="text-sm font-medium text-heading">
                  {booking.delivery_date ? formatDate(booking.delivery_date) : 'Not specified'}
                </p>
              </div>
              <div className="p-3 bg-main rounded-lg">
                <p className="text-sm text-muted mb-1">Submitted On</p>
                <p className="text-sm font-medium text-heading">{formatDate(booking.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipper & Consignee Information */}
        <div className="bg-surface rounded-lg border border-main p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Building className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-heading">Parties Information</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-main rounded-lg">
              <p className="text-sm font-medium text-heading mb-2">Shipper</p>
              <p className="text-sm text-content mb-1">
                {booking.shipper_first_name} {booking.shipper_last_name}
              </p>
              {booking.shipper_contact && (
                <p className="text-xs text-muted">Contact: {booking.shipper_contact}</p>
              )}
            </div>
            <div className="p-4 bg-main rounded-lg">
              <p className="text-sm font-medium text-heading mb-2">Consignee</p>
              <p className="text-sm text-content mb-1">
                {booking.consignee_first_name} {booking.consignee_last_name}
              </p>
              {booking.consignee_contact && (
                <p className="text-xs text-muted">Contact: {booking.consignee_contact}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-surface rounded-lg border border-main p-6 lg:col-span-2">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-heading">
              Cargo Items ({booking.items?.length || 0})
            </h2>
          </div>
          <div className="space-y-3">
            {booking.items?.map((item, index) => (
              <div key={index} className="border border-main rounded-lg p-4 hover:bg-main transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted mb-1">Item Name</p>
                    <p className="text-sm font-medium text-heading">{item.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Category</p>
                    <p className="text-sm font-medium text-heading">{item.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Weight</p>
                    <p className="text-sm font-medium text-heading">{item.weight} kg × {item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Total Weight</p>
                    <p className="text-sm font-medium text-heading">{item.weight * item.quantity} kg</p>
                  </div>
                </div>
              </div>
            ))}
            {(!booking.items || booking.items.length === 0) && (
              <div className="text-center py-8 text-muted">
                No items found for this booking.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Bottom Right */}
      {booking.status === 'pending' && (
        <div className="flex justify-end gap-3 pt-6 border-t border-main mt-6">
          <button
            onClick={handleReject}
            disabled={updateBookingStatus.isPending}
            className={`modal-btn-danger ${updateBookingStatus.isPending ? 'modal-btn-disabled' : ''}`}
          >
            {updateBookingStatus.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Reject Booking
              </>
            )}
          </button>
          <button
            onClick={handleApprove}
            disabled={approveBooking.isPending}
            className={`modal-btn-primary ${approveBooking.isPending ? 'modal-btn-disabled' : ''}`}
          >
            {approveBooking.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Booking
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;