// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { 
  Package, 
  ClipboardCheck, 
  CreditCard, 
  CheckCircle, 
  Clock,
  Truck,
  DollarSign,
  TrendingUp,
  AlertCircle,
  BarChart3,
  PieChart,
  MapPin,
  Anchor,
  Container,
  Users
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import CardTilt from '../components/CardTilt'; // Import CardTilt component

const Dashboard = () => {
  const { userQuery } = useAuth();
  const { data: dashboardData, isLoading, error } = useDashboard();
  
  const user = userQuery.data?.user;
  const userRole = user?.role;

  // Format numbers - no decimals for counts
  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  // Format currency - with .00
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container p-6">
        <div className="page-header mb-8">
          <h1 className="page-title text-3xl font-bold text-heading">Dashboard</h1>
          <p className="page-subtitle text-muted mt-2">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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

  // For General Manager - Show stat cards
  if (userRole === 'general_manager' && dashboardData?.gm_metrics) {
    const metrics = dashboardData.gm_metrics;
    const graphs = dashboardData.graphs || {
      line_graph: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], data: [0, 0, 0, 0, 0, 0] },
      pie_chart: { labels: ['No Data'], data: [100], colors: ['#6B7280'] }
    };
    
    // Define stat cards data - Added total_sales to the main grid
    const statCards = [
      {
        id: 'total-bookings',
        title: 'Total Bookings',
        value: metrics.total_bookings || 0,
        icon: Package,
        gradient: 'from-blue-500 to-purple-600',
        showCount: true
      },
      {
        id: 'approved-bookings',
        title: 'Approved Bookings',
        value: metrics.approved_bookings || 0,
        icon: CheckCircle,
        gradient: 'from-green-500 to-emerald-600',
        showCount: true
      },
      {
        id: 'pending-bookings',
        title: 'Pending Bookings',
        value: metrics.pending_bookings || 0,
        icon: Clock,
        gradient: 'from-yellow-500 to-orange-600',
        showCount: true,
        subtitle: 'Needs Approval'
      },
      {
        id: 'delivered-bookings',
        title: 'Delivered Bookings',
        value: metrics.delivered_bookings || 0,
        icon: Truck,
        gradient: 'from-indigo-500 to-blue-600',
        showCount: true
      },
      {
        id: 'total-quotes',
        title: 'Total Quotes',
        value: metrics.total_quotes || 0,
        pending: metrics.pending_quotes || 0,
        icon: ClipboardCheck,
        gradient: 'from-teal-500 to-cyan-600',
        showCount: true
      },
      {
        id: 'total-payments',
        title: 'Total Payments',
        value: metrics.total_payments || 0,
        pending: metrics.pending_payments || 0,
        icon: CreditCard,
        gradient: 'from-pink-500 to-rose-600',
        showCount: true
      },
      {
        id: 'total-sales',
        title: 'Total Sales',
        value: metrics.total_sales || 0,
        icon: DollarSign,
        gradient: 'from-purple-500 to-violet-600',
        showCurrency: true,
        showCount: false
      },
      {
        id: 'total-expenses',
        title: 'Total Expenses',
        value: metrics.total_expenses || 0,
        icon: DollarSign,
        gradient: 'from-red-500 to-orange-600',
        showCurrency: true,
        showCount: false
      },
      {
        id: 'total-profit',
        title: 'Total Profit',
        value: metrics.total_profit || 0,
        icon: TrendingUp,
        gradient: 'from-emerald-500 to-green-600',
        showCurrency: true,
        showCount: false,
        subtitle: 'Approved Payments Only'
      }
    ];

    // Prepare line graph data
    const lineData = graphs.line_graph.data;
    const lineLabels = graphs.line_graph.labels;
    const maxValue = Math.max(...lineData, 1);
    
    // Prepare pie chart data
    const pieData = graphs.pie_chart.data;
    const pieLabels = graphs.pie_chart.labels;
    const pieColors = graphs.pie_chart.colors;
    const totalPie = pieData.reduce((sum, value) => sum + value, 0);
    
    // Calculate pie chart angles
    let currentAngle = 0;
    const pieSegments = pieData.map((value, index) => {
      const percentage = totalPie > 0 ? (value / totalPie) : 0;
      const angle = percentage * 360;
      const segment = {
        percentage: (percentage * 100).toFixed(1),
        angle,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        label: pieLabels[index],
        color: pieColors[index],
        value: value
      };
      currentAngle += angle;
      return segment;
    });

    return (
      <div className="page-container p-4 sm:p-6">
        {/* Page Header */}
        <div className="page-header mb-6 sm:mb-8">
          <h1 className="page-title text-2xl sm:text-3xl font-bold text-heading">
            General Manager Dashboard
          </h1>
          <p className="page-subtitle text-sm sm:text-base text-muted mt-2">
            Overview of bookings, financials, and operations
          </p>
        </div>

        {/* Stat Cards Grid - Now includes total sales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            
            return (
              <CardTilt key={card.id}>
                <div 
                  className={`bg-gradient-to-br ${card.gradient} rounded-xl p-4 sm:p-6 relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300`}
                >
                  {/* Big Background Icon */}
                  <div className="absolute right-4 top-4 opacity-20">
                    <Icon className="w-24 h-24 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon and Title */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white/20 rounded-lg">
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white/80 font-medium">{card.title}</p>
                        <h3 className="text-3xl sm:text-4xl font-bold text-white mt-1">
                          {card.showCurrency 
                            ? formatCurrency(card.value)
                            : formatNumber(card.value)
                          }
                        </h3>
                      </div>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-white/20">
                      {card.subtitle && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-white/80" />
                          <span className="text-sm text-white/80">
                            {card.subtitle}
                          </span>
                        </div>
                      )}
                      
                      {/* Show pending count for quotes and payments */}
                      {(card.id === 'total-quotes' || card.id === 'total-payments') && 
                       card.pending > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4 text-white/80" />
                          <span className="text-sm text-white/80">
                            Pending: {formatNumber(card.pending)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardTilt>
            );
          })}
        </div>

        {/* Graphs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Graph */}
          <div className="bg-surface rounded-xl border border-main p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-content">Bookings Trend</h3>
                  <p className="text-sm text-muted">Last 6 months</p>
                </div>
              </div>
            </div>
            
            {/* Custom SVG Line Graph */}
            <div className="h-64 relative">
              <svg className="w-full h-full" viewBox="0 0 500 200">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((percent, i) => (
                  <g key={`grid-${i}`}>
                    <line
                      x1="50"
                      y1={40 + percent * 1.6}
                      x2="450"
                      y2={40 + percent * 1.6}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                      strokeDasharray="5,5"
                    />
                    <text
                      x="30"
                      y={40 + percent * 1.6}
                      textAnchor="end"
                      fill="#6B7280"
                      fontSize="12"
                      dy="0.3em"
                    >
                      {Math.round(maxValue * percent / 100)}
                    </text>
                  </g>
                ))}
                
                {/* X-axis */}
                <line
                  x1="50"
                  y1="200"
                  x2="450"
                  y2="200"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                />
                
                {/* Y-axis */}
                <line
                  x1="50"
                  y1="40"
                  x2="50"
                  y2="200"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                />
                
                {/* Line path */}
                <path
                  d={lineData.reduce((path, value, index) => {
                    const x = 50 + (index * 400 / (lineData.length - 1));
                    const y = 200 - (value * 160 / maxValue);
                    return path + (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
                  }, '')}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                />
                
                {/* Data points and labels */}
                {lineData.map((value, index) => {
                  const x = 50 + (index * 400 / (lineData.length - 1));
                  const y = 200 - (value * 160 / maxValue);
                  
                  return (
                    <g key={`point-${index}`}>
                      {/* Point */}
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#3B82F6"
                        stroke="white"
                        strokeWidth="2"
                      />
                      
                      {/* Value label */}
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        fill="#1F2937"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {value}
                      </text>
                      
                      {/* Month label */}
                      <text
                        x={x}
                        y="220"
                        textAnchor="middle"
                        fill="#6B7280"
                        fontSize="12"
                      >
                        {lineLabels[index]}
                      </text>
                    </g>
                  );
                })}
                
                {/* Area under the line */}
                {lineData.length > 0 && (
                  <path
                    d={lineData.reduce((path, value, index) => {
                      const x = 50 + (index * 400 / (lineData.length - 1));
                      const y = 200 - (value * 160 / maxValue);
                      return path + (index === 0 ? `M ${x} 200 L ${x} ${y}` : ` L ${x} ${y}`);
                    }, '') + ` L ${50 + ((lineData.length - 1) * 400 / (lineData.length - 1))} 200 Z`}
                    fill="url(#areaGradient)"
                    opacity="0.3"
                  />
                )}
                
                {/* Gradient for area */}
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="mt-4 text-sm text-muted">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Monthly bookings count</span>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-surface rounded-xl border border-main p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-content">Booking Status Distribution</h3>
                  <p className="text-sm text-muted">Current status breakdown</p>
                </div>
              </div>
            </div>
            
            {/* Custom SVG Pie Chart */}
            <div className="h-64 relative flex items-center justify-center">
              <svg className="w-48 h-48" viewBox="0 0 100 100">
                {/* Draw each pie segment */}
                {pieSegments.map((segment, index) => {
                  if (segment.percentage === '0.0') return null;
                  
                  // Convert angles to radians and calculate coordinates
                  const startRad = (segment.startAngle - 90) * Math.PI / 180;
                  const endRad = (segment.endAngle - 90) * Math.PI / 180;
                  
                  const x1 = 50 + 40 * Math.cos(startRad);
                  const y1 = 50 + 40 * Math.sin(startRad);
                  const x2 = 50 + 40 * Math.cos(endRad);
                  const y2 = 50 + 40 * Math.sin(endRad);
                  
                  const largeArc = segment.angle > 180 ? 1 : 0;
                  
                  return (
                    <g key={`segment-${index}`}>
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={segment.color}
                        stroke="white"
                        strokeWidth="2"
                      />
                      
                      {/* Segment label line and text */}
                      {segment.angle > 15 && (
                        <g>
                          {/* Line to label */}
                          <line
                            x1={50 + 30 * Math.cos((startRad + endRad) / 2)}
                            y1={50 + 30 * Math.sin((startRad + endRad) / 2)}
                            x2={50 + 45 * Math.cos((startRad + endRad) / 2)}
                            y2={50 + 45 * Math.sin((startRad + endRad) / 2)}
                            stroke="#6B7280"
                            strokeWidth="1"
                          />
                          
                          {/* Label */}
                          <text
                            x={50 + 48 * Math.cos((startRad + endRad) / 2)}
                            y={50 + 48 * Math.sin((startRad + endRad) / 2)}
                            textAnchor={Math.cos((startRad + endRad) / 2) > 0 ? "start" : "end"}
                            fill="#1F2937"
                            fontSize="3"
                            fontWeight="bold"
                          >
                            {segment.percentage}%
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
                
                {/* Center circle */}
                <circle cx="50" cy="50" r="15" fill="white" />
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dy="0.3em"
                  fill="#6B7280"
                  fontSize="5"
                  fontWeight="bold"
                >
                  {totalPie}
                </text>
              </svg>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2">
              {pieSegments.map((segment, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <span className="text-sm text-content truncate">
                    {segment.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Stats Row - Removed total sales card since it's now in the main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Financial Ratio */}
          <div className="bg-surface rounded-xl border border-main p-6">
            <h4 className="text-lg font-semibold text-content mb-4">Profit Margin</h4>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {metrics.total_sales > 0 
                  ? `${((metrics.total_profit / metrics.total_sales) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
              <p className="text-sm text-muted">
                Profit ÷ Total Sales
              </p>
              <div className="mt-4 text-xs text-muted">
                <p>Profit includes only approved payments</p>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="bg-surface rounded-xl border border-main p-6">
            <h4 className="text-lg font-semibold text-content mb-4">Key Performance Indicators</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-content">Approval Rate</span>
                <span className="font-semibold text-blue-600">
                  {metrics.total_bookings > 0 
                    ? `${((metrics.approved_bookings / metrics.total_bookings) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-content">Delivery Rate</span>
                <span className="font-semibold text-green-600">
                  {metrics.total_bookings > 0 
                    ? `${((metrics.delivered_bookings / metrics.total_bookings) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-content">Quote Conversion</span>
                <span className="font-semibold text-purple-600">
                  {metrics.total_quotes > 0 
                    ? `${((metrics.total_bookings / metrics.total_quotes) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For Admin - Show admin dashboard
  if (userRole === 'admin' && dashboardData?.admin_metrics) {
    const metrics = dashboardData.admin_metrics;
    
    // Define admin stat cards
    const adminStatCards = [
      {
        id: 'total-bookings',
        title: 'Total Bookings',
        value: metrics.total_bookings || 0,
        icon: Package,
        gradient: 'from-blue-500 to-purple-600',
        showCount: true
      },
      {
        id: 'approved-bookings',
        title: 'Approved Bookings',
        value: metrics.approved_bookings || 0,
        icon: CheckCircle,
        gradient: 'from-green-500 to-emerald-600',
        showCount: true
      },
      {
        id: 'delivered-bookings',
        title: 'Delivered Bookings',
        value: metrics.delivered_bookings || 0,
        icon: Truck,
        gradient: 'from-indigo-500 to-blue-600',
        showCount: true
      },
      {
        id: 'total-ports',
        title: 'Total Ports',
        value: metrics.total_ports || 0,
        icon: MapPin,
        gradient: 'from-red-500 to-orange-600',
        showCount: true
      },
      {
        id: 'total-trucking',
        title: 'Trucking Companies',
        value: metrics.total_truck_companies || 0,
        icon: Truck,
        gradient: 'from-teal-500 to-cyan-600',
        showCount: true
      },
      {
        id: 'total-shipping-lines',
        title: 'Shipping Lines',
        value: metrics.total_shipping_lines || 0,
        icon: Anchor,
        gradient: 'from-pink-500 to-rose-600',
        showCount: true
      },
      {
        id: 'total-containers',
        title: 'Container Types',
        value: metrics.total_container_types || 0,
        icon: Container,
        gradient: 'from-yellow-500 to-orange-600',
        showCount: true
      },
      {
        id: 'total-users',
        title: 'Total Users',
        value: metrics.total_users || 0,
        icon: Users,
        gradient: 'from-purple-500 to-violet-600',
        showCount: true
      }
    ];

    return (
      <div className="page-container p-4 sm:p-6">
        {/* Page Header */}
        <div className="page-header mb-6 sm:mb-8">
          <h1 className="page-title text-2xl sm:text-3xl font-bold text-heading">
            Admin Dashboard
          </h1>
          <p className="page-subtitle text-sm sm:text-base text-muted mt-2">
            System overview and management statistics
          </p>
        </div>

        {/* Admin Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {adminStatCards.map((card) => {
            const Icon = card.icon;
            
            return (
              <CardTilt key={card.id}>
                <div 
                  className={`bg-gradient-to-br ${card.gradient} rounded-xl p-4 sm:p-6 relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300`}
                >
                  {/* Big Background Icon */}
                  <div className="absolute right-4 top-4 opacity-20">
                    <Icon className="w-24 h-24 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon and Title */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white/20 rounded-lg">
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white/80 font-medium">{card.title}</p>
                        <h3 className="text-3xl sm:text-4xl font-bold text-white mt-1">
                          {card.showCount ? formatNumber(card.value) : formatCurrency(card.value)}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Additional Info for bookings */}
                    {card.id === 'total-bookings' && metrics.total_bookings > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/80">Approval Rate:</span>
                          <span className="text-white font-semibold">
                            {((metrics.approved_bookings / metrics.total_bookings) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-white/80">Delivery Rate:</span>
                          <span className="text-white font-semibold">
                            {((metrics.delivered_bookings / metrics.total_bookings) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardTilt>
            );
          })}
        </div>

        {/* System Info Section */}
        <div className="mt-8 bg-surface rounded-xl border border-main p-6">
          <h3 className="text-xl font-semibold text-content mb-4">System Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted">Total Bookings in System</p>
                  <p className="text-lg font-semibold text-content">{formatNumber(metrics.total_bookings)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted">Approved Bookings</p>
                  <p className="text-lg font-semibold text-content">{formatNumber(metrics.approved_bookings)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Truck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-muted">Delivered Shipments</p>
                  <p className="text-lg font-semibold text-content">{formatNumber(metrics.delivered_bookings)}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted">Registered Users</p>
                  <p className="text-lg font-semibold text-content">{formatNumber(metrics.total_users)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Anchor className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-muted">Shipping Lines</p>
                  <p className="text-lg font-semibold text-content">{formatNumber(metrics.total_shipping_lines)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Container className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted">Container Types</p>
                  <p className="text-lg font-semibold text-content">{formatNumber(metrics.total_container_types)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For Customer - Show "Not Available Yet"
  if (userRole === 'customer') {
    return (
      <div className="page-container p-6">
        <div className="page-header mb-8">
          <h1 className="page-title text-3xl font-bold text-heading">
            Customer Dashboard
          </h1>
          <p className="page-subtitle text-muted mt-2">
            Customer dashboard features coming soon
          </p>
        </div>
        
        <div className="bg-surface rounded-xl border border-main p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-content mb-2">Not Available Yet</h3>
            <p className="text-muted">
              The dashboard for customer role is currently under development.
              Please check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback if no data
  return (
    <div className="page-container p-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No dashboard data available for your role.</p>
      </div>
    </div>
  );
};

export default Dashboard;