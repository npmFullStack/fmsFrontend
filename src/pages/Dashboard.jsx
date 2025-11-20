import React from 'react';
import { TrendingUp, TrendingDown, Ship, Truck } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  // Dummy data for revenue chart (Sea and Land logistics)
  const revenueData = [
    { date: '01 Feb', sea: 32000, land: 28000 },
    { date: '02 Feb', sea: 45000, land: 35000 },
    { date: '03 Feb', sea: 28000, land: 32000 },
    { date: '04 Feb', sea: 52000, land: 38000 },
    { date: '05 Feb', sea: 48000, land: 42000 },
    { date: '06 Feb', sea: 55000, land: 45000 },
    { date: '07 Feb', sea: 58000, land: 48000 },
  ];

  // Calculate totals
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.sea + d.land, 0);
  const avgRevenue = Math.round(totalRevenue / revenueData.length);

  // Dummy data for top routes
  const topRoutes = [
    { 
      id: 1, 
      name: 'Manila - Cebu (Sea Freight)', 
      type: 'sea',
      growth: 12.3, 
      trend: 'up', 
      revenue: 445407,
      shipments: 234 
    },
    { 
      id: 2, 
      name: 'Manila - Davao (Land Transport)', 
      type: 'land',
      growth: 8.5, 
      trend: 'up', 
      revenue: 356062,
      shipments: 189 
    },
    { 
      id: 3, 
      name: 'Subic - Hong Kong (Sea Freight)', 
      type: 'sea',
      growth: 5.2, 
      trend: 'down', 
      revenue: 298450,
      shipments: 156 
    },
    { 
      id: 4, 
      name: 'Manila - Baguio (Land Transport)', 
      type: 'land',
      growth: 15.8, 
      trend: 'up', 
      revenue: 203987,
      shipments: 278 
    },
    { 
      id: 5, 
      name: 'Batangas - Singapore (Sea Freight)', 
      type: 'sea',
      growth: 9.4, 
      trend: 'up', 
      revenue: 188543,
      shipments: 98 
    },
  ];

  // Dummy data for shipment statistics
  const shipmentStats = [
    { 
      label: 'Total Shipments', 
      value: 2340, 
      change: '+12.5%', 
      data: [
        { name: 'Week 1', value: 320 },
        { name: 'Week 2', value: 450 },
        { name: 'Week 3', value: 380 },
        { name: 'Week 4', value: 520 },
        { name: 'Week 5', value: 440 },
        { name: 'Week 6', value: 580 },
        { name: 'Week 7', value: 510 }
      ]
    },
    { 
      label: 'Active Routes', 
      value: 148, 
      change: '+8.3%', 
      data: [
        { name: 'Week 1', value: 130 },
        { name: 'Week 2', value: 125 },
        { name: 'Week 3', value: 140 },
        { name: 'Week 4', value: 135 },
        { name: 'Week 5', value: 145 },
        { name: 'Week 6', value: 138 },
        { name: 'Week 7', value: 148 }
      ]
    },
  ];

  // Dummy data for service distribution
  const serviceDistribution = [
    { service: 'Sea Freight (FCL)', percentage: 45 },
    { service: 'Sea Freight (LCL)', percentage: 30 },
    { service: 'Land Transport', percentage: 70 },
    { service: 'Warehousing', percentage: 55 },
  ];

  return (
    <div className="page-container p-4 sm:p-6">
      {/* Page Header */}
      <div className="page-header mb-6 sm:mb-8">
        <h1 className="page-title text-2xl sm:text-3xl font-bold text-heading">Logistics Dashboard</h1>
        <p className="page-subtitle text-sm sm:text-base text-muted mt-2">
          Overview of your sea and land logistics operations
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue Chart - Responsive spanning */}
        <div className="md:col-span-2 bg-surface rounded-xl border border-main p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-heading">
                  ${avgRevenue.toLocaleString()}
                </h2>
                <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  12.5% ↑
                </span>
              </div>
              <p className="text-muted text-sm mt-1">Average revenue this week</p>
            </div>
            <button className="text-sm text-muted hover:text-content transition-colors self-start sm:self-auto">
              Last 7 days ▼
            </button>
          </div>

          {/* Chart */}
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgb(var(--color-muted))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgb(var(--color-muted))"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(var(--color-surface))',
                    border: '1px solid rgb(var(--color-border))',
                    borderRadius: '8px',
                    color: 'rgb(var(--color-content))'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '10px',
                    fontSize: '12px',
                    color: 'rgb(var(--color-muted))'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sea" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Sea Freight"
                  dot={{ fill: '#3b82f6', r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="land" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  name="Land Transport"
                  dot={{ fill: '#f97316', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 pt-4 border-t border-main gap-2">
            <button className="text-sm text-muted hover:text-content transition-colors order-2 sm:order-1">
              Last 7 days ▼
            </button>
            <button className="text-sm text-primary hover:text-blue-700 font-medium transition-colors order-1 sm:order-2">
              SALES REPORT →
            </button>
          </div>
        </div>

        {/* Statistics This Month */}
        <div className="bg-surface rounded-xl border border-main p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-heading">Statistics this month</h3>
            <span className="text-xs text-muted">ⓘ</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6">
            <button className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg text-xs sm:text-sm font-medium">
              Top Routes
            </button>
            <button className="px-3 sm:px-4 py-2 bg-surface text-muted rounded-lg text-xs sm:text-sm font-medium hover:text-content transition-colors">
              Top Customers
            </button>
          </div>

          {/* Top Routes List */}
          <div className="space-y-3 sm:space-y-4">
            {topRoutes.map((route) => (
              <div key={route.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-surface rounded-lg flex items-center justify-center border border-main flex-shrink-0">
                    {route.type === 'sea' ? (
                      <Ship className="w-3 h-3 sm:w-5 sm:h-5 text-blue-500" />
                    ) : (
                      <Truck className="w-3 h-3 sm:w-5 sm:h-5 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-heading truncate">{route.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {route.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-xs ${route.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {route.growth}%
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-heading ml-2 sm:ml-4 whitespace-nowrap">
                  ${(route.revenue / 1000).toFixed(0)}k
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 pt-4 border-t border-main gap-2">
            <button className="text-sm text-muted hover:text-content transition-colors order-2 sm:order-1">
              Last 7 days ▼
            </button>
            <button className="text-sm text-primary hover:text-blue-700 font-medium transition-colors order-1 sm:order-2">
              FULL REPORT →
            </button>
          </div>
        </div>

        {/* Shipment Statistics */}
        {shipmentStats.map((stat, index) => (
          <div key={index} className="bg-surface rounded-xl border border-main p-4 sm:p-6">
            <div className="mb-4">
              <p className="text-sm text-muted mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-heading">{stat.value.toLocaleString()}</h3>
                <span className="text-green-500 text-sm font-medium">{stat.change}</span>
              </div>
              <p className="text-xs text-muted mt-1">Processed last month</p>
            </div>

            {/* Bar Chart */}
            <div className="h-20 sm:h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stat.data}>
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}

        {/* Service Distribution */}
        <div className="bg-surface rounded-xl border border-main p-4 sm:p-6 md:col-span-2 xl:col-span-1">
          <h3 className="text-base sm:text-lg font-semibold text-heading mb-4 sm:mb-6">Service Distribution</h3>

          <div className="space-y-3 sm:space-y-4">
            {serviceDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-content truncate mr-2">{item.service}</span>
                  <span className="text-xs sm:text-sm font-medium text-heading whitespace-nowrap">{item.percentage}%</span>
                </div>
                <div className="w-full bg-surface rounded-full h-2 border border-main">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;