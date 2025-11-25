import React, { useState, useEffect } from 'react';
import { Package, Clock, Truck, CheckCircle, AlertCircle, MapPin, Users, Ship } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import api from '../api';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      'in_transit': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Truck },
      'delivered': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      'picked_up': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Package },
      'origin_port': { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: MapPin },
      'destination_port': { color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: MapPin },
      'out_for_delivery': { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Truck }
    };
    
    return configs[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle };
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
      <Icon className="w-4 h-4" />
      {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
    </span>
  );
};

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch customer bookings directly
  useEffect(() => {
    const fetchCustomerBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await api.get('/customer/bookings');
        setBookings(data.data || []);
      } catch (err) {
        console.error('Failed to fetch customer bookings:', err);
        setError(err.response?.data || { message: 'Failed to load bookings' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerBookings();
  }, []);

  // Calculate metrics from customer's bookings
  const calculateMetrics = () => {
    if (!bookings || bookings.length === 0) {
      return {
        totalBookings: 0,
        pendingBookings: 0,
        pickedUpBookings: 0,
        originPortBookings: 0,
        inTransitBookings: 0,
        destinationPortBookings: 0,
        outForDeliveryBookings: 0,
        deliveredBookings: 0,
        seaFreightBookings: 0,
        landTransportBookings: 0
      };
    }

    return {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(booking => booking.booking_status === 'pending').length,
      pickedUpBookings: bookings.filter(booking => booking.booking_status === 'picked_up').length,
      originPortBookings: bookings.filter(booking => booking.booking_status === 'origin_port').length,
      inTransitBookings: bookings.filter(booking => booking.booking_status === 'in_transit').length,
      destinationPortBookings: bookings.filter(booking => booking.booking_status === 'destination_port').length,
      outForDeliveryBookings: bookings.filter(booking => booking.booking_status === 'out_for_delivery').length,
      deliveredBookings: bookings.filter(booking => booking.booking_status === 'delivered').length,
      seaFreightBookings: bookings.filter(booking => 
        booking.mode_of_service?.toLowerCase().includes('sea')
      ).length,
      landTransportBookings: bookings.filter(booking => 
        booking.mode_of_service?.toLowerCase().includes('land')
      ).length
    };
  };

  const metrics = calculateMetrics();

  // Prepare booking trend data for last 6 months
  const prepareBookingData = () => {
    if (!bookings || bookings.length === 0) return [];

    // Get last 6 months
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = monthNames[date.getMonth()];
      const year = date.getFullYear();
      months.push({ 
        month: `${monthName} ${year}`,
        monthIndex: date.getMonth(),
        year: year
      });
    }

    // Count bookings per month based on created_at date
    const monthlyData = months.map(monthObj => {
      const monthBookings = bookings.filter(booking => {
        if (!booking.created_at) return false;
        
        const bookingDate = new Date(booking.created_at);
        return (
          bookingDate.getMonth() === monthObj.monthIndex &&
          bookingDate.getFullYear() === monthObj.year
        );
      });
      
      return {
        month: monthObj.month,
        bookings: monthBookings.length
      };
    });

    return monthlyData;
  };

  const bookingData = prepareBookingData();

  // Prepare service distribution
  const prepareServiceDistribution = () => {
    const total = metrics.seaFreightBookings + metrics.landTransportBookings;

    return [
      { service: 'Sea Freight', percentage: total > 0 ? Math.round((metrics.seaFreightBookings / total) * 100) : 0 },
      { service: 'Land Transport', percentage: total > 0 ? Math.round((metrics.landTransportBookings / total) * 100) : 0 },
    ];
  };

  const serviceDistribution = prepareServiceDistribution();

  // Customer metrics cards
  const customerMetrics = [
    {
      label: 'Total Bookings',
      value: metrics.totalBookings,
      icon: Package,
      color: 'text-purple-500'
    },
    {
      label: 'In Transit',
      value: metrics.inTransitBookings,
      icon: Truck,
      color: 'text-blue-500'
    },
    {
      label: 'Delivered',
      value: metrics.deliveredBookings,
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      label: 'Pending',
      value: metrics.pendingBookings,
      icon: Clock,
      color: 'text-yellow-500'
    },
  ];

  // Booking status distribution
  const bookingStatusData = [
    { status: 'Pending', value: metrics.pendingBookings, color: '#f59e0b' },
    { status: 'Picked Up', value: metrics.pickedUpBookings, color: '#8b5cf6' },
    { status: 'Origin Port', value: metrics.originPortBookings, color: '#6366f1' },
    { status: 'In Transit', value: metrics.inTransitBookings, color: '#3b82f6' },
    { status: 'Destination Port', value: metrics.destinationPortBookings, color: '#06b6d4' },
    { status: 'Out for Delivery', value: metrics.outForDeliveryBookings, color: '#f97316' },
    { status: 'Delivered', value: metrics.deliveredBookings, color: '#10b981' },
  ];

  // Format numbers
  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-PH').format(number);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container p-6">
        <div className="page-header mb-8">
          <h1 className="page-title text-3xl font-bold text-heading">My Dashboard</h1>
          <p className="page-subtitle text-muted mt-2">Loading your bookings...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-main p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page-container p-6">
        <div className="page-header mb-8">
          <h1 className="page-title text-3xl font-bold text-heading">My Dashboard</h1>
          <p className="page-subtitle text-muted mt-2">Failed to load dashboard data</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container p-4 sm:p-6">
      {/* Page Header */}
      <div className="page-header mb-6 sm:mb-8">
        <h1 className="page-title text-2xl sm:text-3xl font-bold text-heading">My Dashboard</h1>
        <p className="page-subtitle text-sm sm:text-base text-muted mt-2">
          Overview of your shipments and booking status
        </p>
      </div>

      {/* Customer Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {customerMetrics.map((metric, index) => (
          <div key={index} className="bg-surface rounded-xl border border-main p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted mb-1">{metric.label}</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-heading">
                  {formatNumber(metric.value)}
                </h3>
              </div>
              <div className={`p-3 rounded-lg bg-surface ${metric.color} bg-opacity-10`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Booking Trend Chart */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-main p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-heading">My Booking Trends</h2>
              <p className="text-muted text-sm mt-1">Last 6 months of your bookings</p>
            </div>
          </div>

          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="rgb(var(--color-muted))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgb(var(--color-muted))"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  formatter={(value) => [formatNumber(value), 'Bookings']}
                  contentStyle={{
                    backgroundColor: 'rgb(var(--color-surface))',
                    border: '1px solid rgb(var(--color-border))',
                    borderRadius: '8px',
                    color: 'rgb(var(--color-content))'
                  }}
                />
                <Bar 
                  dataKey="bookings" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  name="My Bookings"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-surface rounded-xl border border-main p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-heading mb-4 sm:mb-6">My Booking Status</h3>
          
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatNumber(value), 'Bookings']}
                  contentStyle={{
                    backgroundColor: 'rgb(var(--color-surface))',
                    border: '1px solid rgb(var(--color-border))',
                    borderRadius: '8px',
                    color: 'rgb(var(--color-content))'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4 max-h-32 overflow-y-auto">
            {bookingStatusData.map((status, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span className="text-content truncate">{status.status}</span>
                </div>
                <span className="font-semibold text-heading flex-shrink-0 ml-2">
                  {formatNumber(status.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Service Distribution */}
        <div className="bg-surface rounded-xl border border-main p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-heading mb-4 sm:mb-6">Service Distribution</h3>

          <div className="space-y-4">
            {serviceDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-content">{item.service}</span>
                  <span className="text-sm font-medium text-heading">{item.percentage}%</span>
                </div>
                <div className="w-full bg-surface rounded-full h-2 border border-main">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: index === 0 ? '#3b82f6' : '#f97316'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-main">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Total Bookings</span>
              <span className="font-semibold text-heading">
                {formatNumber(metrics.totalBookings)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="lg:col-span-3 bg-surface rounded-xl border border-main p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-heading mb-4 sm:mb-6">Recent Bookings</h3>

          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-muted">No bookings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-surface rounded-lg border border-main">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      booking.mode_of_service?.includes('sea') 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {booking.mode_of_service?.includes('sea') ? (
                        <Ship className="w-5 h-5" />
                      ) : (
                        <Truck className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-heading">Booking #{booking.booking_number}</p>
                      <p className="text-sm text-muted">
                        {booking.origin?.name} → {booking.destination?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={booking.booking_status} />
                    <span className="text-sm text-muted">
                      {formatDate(booking.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;