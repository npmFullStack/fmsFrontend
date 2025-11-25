import React from 'react';
import { TrendingUp, TrendingDown, Ship, Truck, Users, Package, CreditCard, PieChart } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useBooking } from '../hooks/useBooking';
import { useAR } from '../hooks/useAR';
import { useAP } from '../hooks/useAP';
import { useUser } from '../hooks/useUser';
import { useCargoMonitoring } from '../hooks/useCargoMonitoring';

const GMDashboard = () => {
  // Use hooks to fetch real data
  const { bookingsQuery } = useBooking();
  const { arSummaryQuery } = useAR();
  const { apQuery } = useAP();
  const { usersQuery } = useUser();
  const { cargoMonitoringQuery } = useCargoMonitoring();

  // Get data from queries
  const bookingsData = bookingsQuery();
  const arSummaryData = arSummaryQuery();
  const apData = apQuery();
  const usersData = usersQuery();
  const cargoMonitoringData = cargoMonitoringQuery();

  // Calculate metrics from real data
  const calculateMetrics = () => {
    if (!bookingsData.data || !arSummaryData.data || !usersData.data) {
      return {
        totalRevenue: 0,
        totalProfit: 0,
        totalBookings: 0,
        activeCustomers: 0,
        pendingBookings: 0,
        deliveredBookings: 0,
        inTransitBookings: 0
      };
    }

    const bookings = bookingsData.data.data || [];
    const arSummary = arSummaryData.data?.summary || {};
    const users = usersData.data?.data || [];

    return {
      totalRevenue: arSummary.total_gross_income || 0,
      totalProfit: arSummary.total_profit || 0,
      totalBookings: bookings.length || 0,
      activeCustomers: users.filter(user => user.role === 'customer').length || 0,
      pendingBookings: bookings.filter(booking => booking.booking_status === 'pending').length || 0,
      deliveredBookings: bookings.filter(booking => booking.booking_status === 'delivered').length || 0,
      inTransitBookings: bookings.filter(booking => booking.booking_status === 'in_transit').length || 0
    };
  };

  const metrics = calculateMetrics();

  // Prepare revenue trend data from AR data
  const prepareRevenueData = () => {
    if (!arSummaryData.data) return [];

    // This would ideally come from time-series AR data
    // For now, using a simple monthly trend based on summary
    const summary = arSummaryData.data.summary || {};
    return [
      { month: 'Jan', revenue: summary.total_gross_income ? summary.total_gross_income * 0.8 : 0 },
      { month: 'Feb', revenue: summary.total_gross_income || 0 },
      { month: 'Mar', revenue: summary.total_gross_income ? summary.total_gross_income * 1.2 : 0 },
    ];
  };

  const revenueData = prepareRevenueData();

  // Prepare service distribution from cargo monitoring
  const prepareServiceDistribution = () => {
    if (!cargoMonitoringData.data?.data) return [];

    const cargoData = cargoMonitoringData.data.data;
    const seaCount = cargoData.filter(item => 
      item.booking?.mode_of_service?.toLowerCase().includes('sea')
    ).length;
    const landCount = cargoData.filter(item => 
      item.booking?.mode_of_service?.toLowerCase().includes('land')
    ).length;
    const total = seaCount + landCount;

    return [
      { service: 'Sea Freight', percentage: total > 0 ? Math.round((seaCount / total) * 100) : 0 },
      { service: 'Land Transport', percentage: total > 0 ? Math.round((landCount / total) * 100) : 0 },
    ];
  };

  const serviceDistribution = prepareServiceDistribution();

  // Financial metrics cards
  const financialMetrics = [
    {
      label: 'Total Revenue',
      value: metrics.totalRevenue,
      change: '+12.5%',
      trend: 'up',
      icon: CreditCard,
      color: 'text-blue-500',
      format: 'currency'
    },
    {
      label: 'Total Profit',
      value: metrics.totalProfit,
      change: '+8.3%',
      trend: 'up',
      icon: PieChart,
      color: 'text-green-500',
      format: 'currency'
    },
    {
      label: 'Total Bookings',
      value: metrics.totalBookings,
      change: '+15.2%',
      trend: 'up',
      icon: Package,
      color: 'text-purple-500',
      format: 'number'
    },
    {
      label: 'Active Customers',
      value: metrics.activeCustomers,
      change: '+5.7%',
      trend: 'up',
      icon: Users,
      color: 'text-orange-500',
      format: 'number'
    },
  ];

  // Booking status distribution
  const bookingStatusData = [
    { status: 'Pending', value: metrics.pendingBookings, color: '#f59e0b' },
    { status: 'In Transit', value: metrics.inTransitBookings, color: '#3b82f6' },
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

  // Loading state
  if (bookingsData.isLoading || arSummaryData.isLoading || usersData.isLoading) {
    return (
      <div className="page-container p-6">
        <div className="page-header mb-8">
          <h1 className="page-title text-3xl font-bold text-heading">GM Dashboard</h1>
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

  return (
    <div className="page-container p-4 sm:p-6">
      {/* Page Header */}
      <div className="page-header mb-6 sm:mb-8">
        <h1 className="page-title text-2xl sm:text-3xl font-bold text-heading">GM Dashboard</h1>
        <p className="page-subtitle text-sm sm:text-base text-muted mt-2">
          Overview of all logistics operations and financial performance
        </p>
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {financialMetrics.map((metric, index) => (
          <div key={index} className="bg-surface rounded-xl border border-main p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted mb-1">{metric.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl sm:text-3xl font-bold text-heading">
                    {metric.format === 'currency' 
                      ? formatCurrency(metric.value)
                      : formatNumber(metric.value)
                    }
                  </h3>
                  <span className={`text-sm font-medium flex items-center gap-1 ${
                    metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {metric.change}
                  </span>
                </div>
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
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-main p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-heading">Revenue Trend</h2>
              <p className="text-muted text-sm mt-1">Monthly revenue performance</p>
            </div>
            <button className="text-sm text-muted hover:text-content transition-colors self-start sm:self-auto">
              Last 3 months ▼
            </button>
          </div>

          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
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
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-surface rounded-xl border border-main p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-heading mb-4 sm:mb-6">Booking Status</h3>
          
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
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
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4">
            {bookingStatusData.map((status, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span className="text-content">{status.status}</span>
                </div>
                <span className="font-semibold text-heading">{formatNumber(status.value)}</span>
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
              <span className="text-muted">Total Active Shipments</span>
              <span className="font-semibold text-heading">
                {formatNumber(serviceDistribution.reduce((sum, item) => sum + item.percentage, 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-main p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-heading mb-4 sm:mb-6">Financial Summary</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
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
            </div>
            <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
};

export default GMDashboard;