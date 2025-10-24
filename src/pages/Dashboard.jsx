import React from 'react';
import { TrendingUp, TrendingDown, Ship, Truck, Package, MapPin } from 'lucide-react';
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
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Logistics Dashboard</h1>
        <p className="page-subtitle">Overview of your sea and land logistics operations</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-main p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-bold text-heading">
                  ${avgRevenue.toLocaleString()}
                </h2>
                <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  12.5% ↑
                </span>
              </div>
              <p className="text-muted text-sm mt-1">Average revenue this week</p>
            </div>
            <button className="text-sm text-muted hover:text-content transition-colors">
              Last 7 days ▼
            </button>
          </div>

          {/* Chart */}
          <div className="h-64">
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
                    paddingTop: '20px',
                    fontSize: '14px',
                    color: 'rgb(var(--color-muted))'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sea" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Sea Freight"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="land" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  name="Land Transport"
                  dot={{ fill: '#f97316', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-main">
            <button className="text-sm text-muted hover:text-content transition-colors">
              Last 7 days ▼
            </button>
            <button className="text-sm text-primary hover:text-blue-700 font-medium transition-colors">
              SALES REPORT →
            </button>
          </div>
        </div>

        {/* Statistics This Month */}
        <div className="bg-surface rounded-xl border border-main p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-heading">Statistics this month</h3>
            <span className="text-xs text-muted">ⓘ</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">
              Top Routes
            </button>
            <button className="px-4 py-2 bg-surface text-muted rounded-lg text-sm font-medium hover:text-content transition-colors">
              Top Customers
            </button>
          </div>

          {/* Top Routes List */}
          <div className="space-y-4">
            {topRoutes.map((route) => (
              <div key={route.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center border border-main">
                    {route.type === 'sea' ? (
                      <Ship className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Truck className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-heading truncate">{route.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {route.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-xs ${route.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {route.growth}% vs last month
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-heading ml-4">
                  ${route.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-main">
            <button className="text-sm text-muted hover:text-content transition-colors">
              Last 7 days ▼
            </button>
            <button className="text-sm text-primary hover:text-blue-700 font-medium transition-colors">
              FULL REPORT →
            </button>
          </div>
        </div>

        {/* Shipment Statistics */}
        {shipmentStats.map((stat, index) => (
          <div key={index} className="bg-surface rounded-xl border border-main p-6">
            <div className="mb-4">
              <p className="text-sm text-muted mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-heading">{stat.value.toLocaleString()}</h3>
                <span className="text-green-500 text-sm font-medium">{stat.change}</span>
              </div>
              <p className="text-xs text-muted mt-1">Processed last month</p>
            </div>

            {/* Bar Chart */}
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stat.data}>
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}

        {/* Service Distribution */}
        <div className="bg-surface rounded-xl border border-main p-6">
          <h3 className="text-lg font-semibold text-heading mb-6">Service Distribution</h3>

          <div className="space-y-4">
            {serviceDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-content">{item.service}</span>
                  <span className="text-sm font-medium text-heading">{item.percentage}%</span>
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