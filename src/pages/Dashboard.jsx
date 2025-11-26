// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Ship, Truck, Users, Package, CreditCard, PieChart, ClipboardCheck, Clipboard, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import api from '../api';
import { useAuth } from '../hooks/useAuth';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clipboard },
      'in_transit': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Truck },
      'delivered': { color: 'bg-green-100 text-green-800 border-green-200', icon: Package },
      'picked_up': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Package },
      'origin_port': { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Ship },
      'destination_port': { color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: Ship },
      'out_for_delivery': { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Truck }
    };
    
    return configs[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clipboard };
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

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userQuery } = useAuth();

  const user = userQuery.data?.user;
  const userRole = user?.role;

  // Fetch dashboard data directly
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await api.get('/dashboard-data');
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.response?.data || { message: 'Failed to load dashboard data' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate metrics from dashboard data
  const calculateMetrics = () => {
    if (!dashboardData) {
      return {
        totalRevenue: 0,
        totalProfit: 0,
        totalBookings: 0,
        activeCustomers: 0,
        totalUsers: 0,
        pendingBookings: 0,
        pendingQuotes: 0,
        pickedUpBookings: 0,
        originPortBookings: 0,
        inTransitBookings: 0,
        destinationPortBookings: 0,
        outForDeliveryBookings: 0,
        deliveredBookings: 0,
        activeShipments: 0,
        seaFreightBookings: 0,
        landTransportBookings: 0
      };
    }

    const bookings = dashboardData.bookings || [];
    const users = dashboardData.users || [];
    const quotes = dashboardData.quotes || [];
    const cargoData = dashboardData.cargo_monitoring || [];
    const financials = dashboardData.financials || {};

    const arSummary = financials.ar_summary || {};
    const apSummary = financials.ap_summary || {};

    // For customers, filter bookings to only their own
    const userBookings = userRole === 'customer' 
      ? bookings.filter(booking => booking.user_id === user?.id)
      : bookings;

    return {
      totalRevenue: arSummary.total_gross_income || 0,
      totalProfit: arSummary.total_profit || 0,
      totalBookings: userBookings.length || 0,
      activeCustomers: users.filter(user => user.role === 'customer').length || 0,
      totalUsers: users.length || 0,
      pendingBookings: userBookings.filter(booking => booking.booking_status === 'pending').length || 0,
      pendingQuotes: quotes.filter(quote => quote.status === 'pending').length || 0,
      pickedUpBookings: userBookings.filter(booking => booking.booking_status === 'picked_up').length || 0,
      originPortBookings: userBookings.filter(booking => booking.booking_status === 'origin_port').length || 0,
      inTransitBookings: userBookings.filter(booking => booking.booking_status === 'in_transit').length || 0,
      destinationPortBookings: userBookings.filter(booking => booking.booking_status === 'destination_port').length || 0,
      outForDeliveryBookings: userBookings.filter(booking => booking.booking_status === 'out_for_delivery').length || 0,
      deliveredBookings: userBookings.filter(booking => booking.booking_status === 'delivered').length || 0,
      activeShipments: cargoData.length || 0,
      seaFreightBookings: userBookings.filter(booking => 
        booking.mode_of_service?.toLowerCase().includes('sea')
      ).length,
      landTransportBookings: userBookings.filter(booking => 
        booking.mode_of_service?.toLowerCase().includes('land')
      ).length
    };
  };

  const metrics = calculateMetrics();

  // Prepare booking trend data for last 6 months
  const prepareBookingData = () => {
    const bookings = userRole === 'customer' 
      ? (dashboardData?.bookings || []).filter(booking => booking.user_id === user?.id)
      : dashboardData?.bookings || [];

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

  // Prepare revenue trend data for GM/Admin
  const prepareRevenueData = () => {
    if (userRole === 'customer' || !dashboardData?.bookings) return [];

    const bookings = dashboardData.bookings;
    
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

    // Calculate revenue per month (simplified)
    const monthlyData = months.map(monthObj => {
      const monthBookings = bookings.filter(booking => {
        if (!booking.created_at) return false;
        
        const bookingDate = new Date(booking.created_at);
        return (
          bookingDate.getMonth() === monthObj.monthIndex &&
          bookingDate.getFullYear() === monthObj.year
        );
      });
      
      const revenue = monthBookings.length * 15000; // Average booking value
      
      return {
        month: monthObj.month,
        revenue: revenue
      };
    });

    return monthlyData;
  };

  const revenueData = prepareRevenueData();

  // Prepare service distribution
  const prepareServiceDistribution = () => {
    const total = metrics.seaFreightBookings + metrics.landTransportBookings;

    return [
      { service: 'Sea Freight', percentage: total > 0 ? Math.round((metrics.seaFreightBookings / total) * 100) : 0 },
      { service: 'Land Transport', percentage: total > 0 ? Math.round((metrics.landTransportBookings / total) * 100) : 0 },
    ];
  };

  const serviceDistribution = prepareServiceDistribution();

  // Role-based metrics cards
  const getMetricsCards = () => {
    const customerMetrics = [
      {
        label: 'Total Bookings',
        value: metrics.totalBookings,
        icon: Package,
        color: 'text-purple-500',
        format: 'number'
      },
      {
        label: 'In Transit',
        value: metrics.inTransitBookings,
        icon: Truck,
        color: 'text-blue-500',
        format: 'number'
      },
      {
        label: 'Delivered',
        value: metrics.deliveredBookings,
        icon: Package,
        color: 'text-green-500',
        format: 'number'
      },
      {
        label: 'Pending',
        value: metrics.pendingBookings,
        icon: Clipboard,
        color: 'text-yellow-500',
        format: 'number'
      },
    ];

    const managerMetrics = [
      {
        label: 'Total Revenue',
        value: metrics.totalRevenue,
        icon: CreditCard,
        color: 'text-blue-500',
        format: 'currency'
      },
      {
        label: 'Total Profit',
        value: metrics.totalProfit,
        icon: PieChart,
        color: 'text-green-500',
        format: 'currency'
      },
      {
        label: 'Pending Quotes',
        value: metrics.pendingQuotes,
        icon: ClipboardCheck,
        color: 'text-yellow-500',
        format: 'number'
      },
      {
        label: 'Pending Bookings',
        value: metrics.pendingBookings,
        icon: Clipboard,
        color: 'text-orange-500',
        format: 'number'
      },
    ];

    const adminMetrics = [
      {
        label: 'Total Revenue',
        value: metrics.totalRevenue,
        icon: CreditCard,
        color: 'text-blue-500',
        format: 'currency'
      },
      {
        label: 'Total Users',
        value: metrics.totalUsers,
        icon: Users,
        color: 'text-purple-500',
        format: 'number'
      },
      {
        label: 'Active Customers',
        value: metrics.activeCustomers,
        icon: Users,
        color: 'text-green-500',
        format: 'number'
      },
      {
        label: 'Active Shipments',
        value: metrics.activeShipments,
        icon: Truck,
        color: 'text-orange-500',
        format: 'number'
      },
    ];

    switch (userRole) {
      case 'customer':
        return customerMetrics;
      case 'general_manager':
        return managerMetrics;
      case 'admin':
        return adminMetrics;
      default:
        return customerMetrics;
    }
  };

  const metricsCards = getMetricsCards();

  // Booking status distribution
  const bookingStatusData = [
    { status: 'Pending', value: metrics.pendingBookings, color: '#f59e0b' },
    { status: 'Picked Up', value: metrics.pickedUpBookings, color: '#f97316' },
    { status: 'Origin Port', value: metrics.originPortBookings, color: '#8b5cf6' },
    { status: 'In Transit', value: metrics.inTransitBookings, color: '#3b82f6' },
    { status: 'Destination Port', value: metrics.destinationPortBookings, color: '#06b6d4' },
    { status: 'Out for Delivery', value: metrics.outForDeliveryBookings, color: '#ec4899' },
    { status: 'Delivered', value: metrics.deliveredBookings, color: '#10b981' },
  ];

  // Format currency in Philippine Peso
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

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

  // Get recent bookings for customer
  const getRecentBookings = () => {
    const bookings = userRole === 'customer' 
      ? (dashboardData?.bookings || []).filter(booking => booking.user_id === user?.id)
      : dashboardData?.bookings || [];

    return bookings.slice(0, 5);
  };

  const recentBookings = getRecentBookings();

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container p-6">
        <div className="page-header mb-8">
          <h1 className="page-title text-3xl font-bold text-heading">Dashboard</h1>
          <p className="page-subtitle text-muted mt-2">Loading dashboard data...</p>
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
          <h1 className="page-title text-3xl font-bold text-heading">Dashboard</h1>
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
        <h1 className="page-title text-2xl sm:text-3xl font-bold text-heading">
          {userRole === 'customer' ? 'My Dashboard' : 
           userRole === 'general_manager' ? 'GM Dashboard' : 'Admin Dashboard'}
        </h1>
        <p className="page-subtitle text-sm sm:text-base text-muted mt-2">
          {userRole === 'customer' 
            ? 'Overview of your shipments and booking status'
            : 'Overview of logistics operations and business performance'
          }
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {metricsCards.map((metric, index) => (
          <div key={index} className="bg-surface rounded-xl border border-main p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted mb-1">{metric.label}</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-heading">
                  {metric.format === 'currency' 
                    ? formatCurrency(metric.value)
                    : formatNumber(metric.value)
                  }
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
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-main p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-heading">
                {userRole === 'customer' ? 'My Booking Trends' : 'Revenue Trend'}
              </h2>
              <p className="text-muted text-sm mt-1">
                {userRole === 'customer' 
                  ? 'Last 6 months of your bookings'
                  : 'Last 6 months revenue performance'
                }
              </p>
            </div>
          </div>

          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              {userRole === 'customer' ? (
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
                    name="Bookings"
                  />
                </BarChart>
              ) : (
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgb(var(--color-muted))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="rgb(var(--color-muted))"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'rgb(var(--color-surface))',
                      border: '1px solid rgb(var(--color-border))',
                      borderRadius: '8px',
                      color: 'rgb(var(--color-content))'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Revenue"
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-surface rounded-xl border border-main p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-heading mb-4 sm:mb-6">
            {userRole === 'customer' ? 'My Booking Status' : 'Booking Status'}
          </h3>
          
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
              <span className="text-muted">
                {userRole === 'customer' ? 'Total Bookings' : 'Total Active Shipments'}
              </span>
              <span className="font-semibold text-heading">
                {formatNumber(userRole === 'customer' ? metrics.totalBookings : metrics.activeShipments)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Bookings (Customer) or Quick Stats (Admin/GM) */}
        {userRole === 'customer' ? (
          <div className="lg:col-span-3 bg-surface rounded-xl border border-main p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-heading mb-4 sm:mb-6">Recent Bookings</h3>

            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-muted">No bookings found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
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
        ) : (
          <div className="lg:col-span-2 bg-surface rounded-xl border border-main p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-heading mb-4 sm:mb-6">Quick Stats</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-main">
                  <span className="text-sm text-content">Total Users</span>
                  <span className="text-sm font-semibold text-heading">
                    {formatNumber(metrics.totalUsers)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-main">
                  <span className="text-sm text-content">Active Customers</span>
                  <span className="text-sm font-semibold text-heading">
                    {formatNumber(metrics.activeCustomers)}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-main">
                  <span className="text-sm text-content">Total Bookings</span>
                  <span className="text-sm font-semibold text-heading">
                    {formatNumber(metrics.totalBookings)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-main">
                  <span className="text-sm text-content">In Transit</span>
                  <span className="text-sm font-semibold text-blue-500">
                    {formatNumber(metrics.inTransitBookings)}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-main">
                  <span className="text-sm text-content">Delivered</span>
                  <span className="text-sm font-semibold text-green-500">
                    {formatNumber(metrics.deliveredBookings)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-main">
                  <span className="text-sm text-content">Out for Delivery</span>
                  <span className="text-sm font-semibold text-orange-500">
                    {formatNumber(metrics.outForDeliveryBookings)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Summary for GM/Admin */}
        {(userRole === 'general_manager' || userRole === 'admin') && (
          <div className="lg:col-span-3 bg-surface rounded-xl border border-main p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-heading mb-4 sm:mb-6">Financial Summary</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-main">
                <span className="text-sm text-content">Gross Income</span>
                <span className="text-sm font-semibold text-heading">
                  {formatCurrency(metrics.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-main">
                <span className="text-sm text-content">Net Profit</span>
                <span className="text-sm font-semibold text-green-500">
                  {formatCurrency(metrics.totalProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-main">
                <span className="text-sm text-content">Total Expenses</span>
                <span className="text-sm font-semibold text-heading">
                  {formatCurrency(metrics.totalRevenue - metrics.totalProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-main">
                <span className="text-sm text-content">Profit Margin</span>
                <span className="text-sm font-semibold text-green-500">
                  {metrics.totalRevenue > 0 
                    ? `${((metrics.totalProfit / metrics.totalRevenue) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;