// src/components/tables/AccountsReceivableTable.jsx
import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Calendar,
  User,
  Truck,
  Anchor,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import Select from 'react-select';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { agingBuckets } from '../../schemas/arSchema';

const AccountsReceivableTable = ({ 
  data = [],
  onMarkAsPaid,
  onView,
  isLoading = false
}) => {
  const [expandedCards, setExpandedCards] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [agingFilter, setAgingFilter] = useState('all');

  const toggleCard = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = data;

    // Filter by status
    if (statusFilter === 'paid') {
      filtered = filtered.filter(ar => ar.is_paid);
    } else if (statusFilter === 'unpaid') {
      filtered = filtered.filter(ar => !ar.is_paid);
    }

    // Filter by aging
    if (agingFilter !== 'all') {
      filtered = filtered.filter(ar => ar.aging_bucket === agingFilter);
    }

    return filtered;
  }, [data, statusFilter, agingFilter]);

  // Get aging badge color
  const getAgingBadgeColor = (bucket) => {
    const agingConfig = agingBuckets.find(b => b.value === bucket);
    return agingConfig?.color || 'gray';
  };

  // Status filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' }
  ];

  // Aging filter options
  const agingOptions = [
    { value: 'all', label: 'All Aging' },
    ...agingBuckets.map(bucket => ({
      value: bucket.value,
      label: bucket.label
    }))
  ];

  if (isLoading) return (
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (filteredData.length === 0) return (
    <div className="text-center py-12 text-muted">
      No accounts receivable records found.
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Filter Options */}
      <div className="flex flex-wrap gap-4 items-center mb-4 p-4 bg-main rounded-lg">
        <div className="flex items-center gap-4">
          {/* Status Filter */}
          <div className="min-w-[150px]">
            <Select
              options={statusOptions}
              value={statusOptions.find(option => option.value === statusFilter)}
              onChange={(selected) => setStatusFilter(selected.value)}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {/* Aging Filter */}
          <div className="min-w-[150px]">
            <Select
              options={agingOptions}
              value={agingOptions.find(option => option.value === agingFilter)}
              onChange={(selected) => setAgingFilter(selected.value)}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>
      </div>

      {/* AR Records */}
      {filteredData.map((ar, index) => {
        const booking = ar.booking;
        const isExpanded = expandedCards[ar.id || index];
        const agingColor = getAgingBadgeColor(ar.aging_bucket);

        return (
          <div
            key={ar.id || index}
            className="bg-surface rounded-lg border border-main overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted" />
                    <span className="font-semibold text-heading">
                      {booking?.first_name} {booking?.last_name}
                    </span>
                    {ar.is_paid ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    {booking?.booking_number && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-muted">BOOKING #:</span>
                        <span className="text-heading font-mono font-semibold">{booking.booking_number}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ar.is_paid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {ar.is_paid ? 'Paid' : 'Unpaid'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${agingColor}-100 text-${agingColor}-800`}>
                    {agingBuckets.find(b => b.value === ar.aging_bucket)?.label || ar.aging_bucket}
                  </span>
                </div>
              </div>

              {/* Financial Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm mb-3 border-t border-b border-main py-3">
                {/* Collectible Amount */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">COLLECTIBLE:</div>
                  <div className={`text-lg font-semibold ${
                    ar.collectible_amount > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(ar.collectible_amount)}
                  </div>
                </div>
{/* Due Date */}
<div>
  <div className="text-xs font-bold text-muted mb-1 uppercase">DUE DATE:</div>
  <div className={`text-heading text-sm ${ar.is_overdue ? 'text-red-600 font-semibold' : ''}`}>
    {ar.due_date ? formatDate(ar.due_date, false) : 'Not Set'}
    {ar.is_overdue && <AlertTriangle className="w-3 h-3 text-red-600 inline ml-1" />}
  </div>
</div>
                {/* Total Payment */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">TOTAL PAYMENT:</div>
                  <div className="text-heading font-semibold">
                    {formatCurrency(ar.total_payment)}
                  </div>
                </div>

                {/* Expenses */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">EXPENSES:</div>
                  <div className="text-heading">
                    {formatCurrency(ar.total_expenses)}
                  </div>
                </div>

                {/* Profit */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">PROFIT:</div>
                  <div className={`font-semibold ${
                    ar.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(ar.profit)}
                  </div>
                </div>

                {/* Aging */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">AGING:</div>
                  <div className="text-heading text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted" />
                    {ar.aging_days} days
                  </div>
                </div>
              </div>

              {/* Route and Container Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-3 h-3 text-muted" />
                  <span className="text-heading">
                    {booking?.origin?.route_name || booking?.origin?.name || 'N/A'} → {booking?.destination?.route_name || booking?.destination?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Anchor className="w-3 h-3 text-muted" />
                  <span className="text-heading">
                    {booking?.container_quantity} x {booking?.container_size?.size || booking?.container_size?.name || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Actions and Expand */}
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-main">
                <button
                  onClick={() => toggleCard(ar.id || index)}
                  className="text-sm flex items-center gap-2 font-semibold text-heading hover:text-heading transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {isExpanded ? 'Hide Details' : 'View Details'}
                </button>

                {!ar.is_paid && (
                  <button
                    onClick={() => onMarkAsPaid && onMarkAsPaid(ar.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  {/* Financial Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-heading mb-2">Income Breakdown</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted">Gross Income:</span>
                          <span className="font-medium text-heading">{formatCurrency(ar.gross_income)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Total Expenses:</span>
                          <span className="font-medium text-heading">{formatCurrency(ar.total_expenses)}</span>
                        </div>
                        <div className="flex justify-between border-t border-main pt-1">
                          <span className="text-muted font-medium">Net Revenue:</span>
                          <span className={`font-semibold ${
                            ar.net_revenue >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(ar.net_revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
{/* Invoice Dates */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
  <div>
    <span className="text-muted">Invoice Date:</span>
    <span className="text-heading ml-2">{ar.invoice_date ? formatDate(ar.invoice_date, false) : 'Not Set'}</span>
  </div>
  <div>
    <span className="text-muted">Due Date:</span>
    <span className={`ml-2 ${ar.is_overdue ? 'text-red-600 font-semibold' : 'text-heading'}`}>
      {ar.due_date ? formatDate(ar.due_date, false) : 'Not Set'}
      {ar.is_overdue && ' (Overdue)'}
    </span>
  </div>
</div>
                    <div>
                      <h4 className="font-medium text-heading mb-2">Payment Status</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted">Total Payment:</span>
                          <span className="font-medium text-heading">{formatCurrency(ar.total_payment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Amount Collected:</span>
                          <span className="font-medium text-heading">{formatCurrency(ar.total_payment - ar.collectible_amount)}</span>
                        </div>
                        <div className="flex justify-between border-t border-main pt-1">
                          <span className="text-muted font-medium">Balance Due:</span>
                          <span className={`font-semibold ${
                            ar.collectible_amount > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(ar.collectible_amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted">Created:</span>
                      <span className="text-heading ml-2">{formatDate(ar.created_at, true)}</span>
                    </div>
                    <div>
                      <span className="text-muted">Last Updated:</span>
                      <span className="text-heading ml-2">{formatDate(ar.updated_at, true)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccountsReceivableTable;