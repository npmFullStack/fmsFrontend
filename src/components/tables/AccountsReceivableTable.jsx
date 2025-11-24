// [file name]: AccountsReceivableTable.jsx
import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  User,
  Truck,
  Anchor,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Send,
  Clock,
  FileText,
  Calculator,
  AlertTriangle,
  Printer,
  Filter,
  Calendar
} from 'lucide-react';
import Select from 'react-select';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { agingBuckets } from '../../schemas/arSchema';

const AccountsReceivableTable = ({ 
  data = [],
  onMarkAsPaid,
  onSendPayment,
  onView,
  isLoading = false,
  onPrint,
  onBulkPrint,
  selectedRecords = [],
  onSelectRecord,
  onSelectAllRecords
}) => {
  const [expandedCards, setExpandedCards] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [agingFilter, setAgingFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

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
    } else if (statusFilter === 'ready') {
      filtered = filtered.filter(ar => 
        !ar.is_paid && 
        ar.total_expenses > 0 && 
        (!ar.total_payment || ar.total_payment === 0)
      );
    }

    // Filter by aging
    if (agingFilter !== 'all') {
      filtered = filtered.filter(ar => ar.aging_bucket === agingFilter);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate;

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          return filtered;
      }

      filtered = filtered.filter(ar => {
        const arDate = new Date(ar.created_at);
        return arDate >= startDate;
      });
    }

    return filtered;
  }, [data, statusFilter, agingFilter, dateFilter]);

  // Get aging badge color
  const getAgingBadgeColor = (bucket) => {
    const agingConfig = agingBuckets.find(b => b.value === bucket);
    return agingConfig?.color || 'gray';
  };

  // Get status badge for AR record
  const getStatusBadge = (ar) => {
    if (ar.is_paid) {
      return { label: 'Paid', color: 'green', icon: CheckCircle };
    }
    
    if (ar.total_payment > 0) {
      return { label: 'Invoice Sent', color: 'blue', icon: Send };
    }
    
    if (ar.total_expenses > 0) {
      return { label: 'Ready for Invoice', color: 'orange', icon: Clock };
    }
    
    return { label: 'No Charges', color: 'gray', icon: FileText };
  };

  // Status filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'ready', label: 'Ready for Invoice' },
    { value: 'unpaid', label: 'Invoice Sent' },
    { value: 'paid', label: 'Paid' }
  ];

  // Aging filter options
  const agingOptions = [
    { value: 'all', label: 'All Aging' },
    ...agingBuckets.map(bucket => ({
      value: bucket.value,
      label: bucket.label
    }))
  ];

  // Date filter options
  const dateFilterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const getChargeBreakdown = (ar) => {
    console.log('AR data for breakdown:', ar);
    
    // First, check if we have charges saved in the AR record (from SendTotalPayment)
    if (ar.charges && Array.isArray(ar.charges) && ar.charges.length > 0) {
      console.log('Using charges from AR record:', ar.charges);
      return ar.charges.map(charge => ({
        description: charge.description,
        amount: charge.amount,
        markup: charge.markup,
        markup_amount: charge.markup_amount,
        total: charge.total
      }));
    }
    
    // Fallback: If no charges array but we have total payment and expenses
    if (ar.total_payment && ar.total_payment > 0 && ar.total_expenses > 0) {
      console.log('Using fallback calculation');
      const totalMarkup = ar.total_payment - ar.total_expenses;
      const markupPercentage = (totalMarkup / ar.total_expenses) * 100;
      
      return [
        {
          description: 'Total Expenses',
          amount: ar.total_expenses,
          markup: 0,
          markup_amount: 0,
          total: ar.total_expenses
        },
        {
          description: 'Service Fee',
          amount: totalMarkup,
          markup: markupPercentage.toFixed(1),
          markup_amount: totalMarkup,
          total: totalMarkup
        }
      ];
    }
    
    return [];
  };

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
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <span className="text-sm font-medium text-heading">Filter by:</span>
        </div>
        
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

        {/* Date Filter */}
        <div className="min-w-[150px]">
          <Select
            options={dateFilterOptions}
            value={dateFilterOptions.find(option => option.value === dateFilter)}
            onChange={(selected) => setDateFilter(selected.value)}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
        
        {/* Bulk Print Selector */}
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={selectedRecords.length === filteredData.length && filteredData.length > 0}
            onChange={(e) => onSelectAllRecords && onSelectAllRecords(e.target.checked ? filteredData.map(ar => ar.id) : [])}
            className="w-4 h-4 text-primary border-main rounded focus:ring-primary"
          />
          <span className="text-sm text-muted">Select All for Print</span>
          
          {selectedRecords.length > 0 && (
            <button
              onClick={() => onBulkPrint && onBulkPrint(selectedRecords)}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Invoices ({selectedRecords.length})
            </button>
          )}
        </div>
      </div>

      {/* AR Records */}
      {filteredData.map((ar, index) => {
        const booking = ar.booking;
        const isExpanded = expandedCards[ar.id || index];
        const agingColor = getAgingBadgeColor(ar.aging_bucket);
        const statusBadge = getStatusBadge(ar);
        const StatusIcon = statusBadge.icon;
        const chargeBreakdown = getChargeBreakdown(ar);
        const isSelected = selectedRecords.includes(ar.id);

        return (
          <div
            key={ar.id || index}
            className={`bg-surface rounded-lg border border-main overflow-hidden hover:shadow-md transition-shadow ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
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
                
                <div className="flex items-center gap-3">
                  {/* Bulk Print Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectRecord && onSelectRecord(ar.id, e.target.checked)}
                    className="w-4 h-4 text-primary border-main rounded focus:ring-primary"
                  />
                  
                  {/* Status Badges */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      statusBadge.color === 'green' ? 'bg-green-100 text-green-800' :
                      statusBadge.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      statusBadge.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusBadge.label}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${agingColor}-100 text-${agingColor}-800`}>
                      {agingBuckets.find(b => b.value === ar.aging_bucket)?.label || ar.aging_bucket}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Grid - Simplified */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm mb-3 border-t border-b border-main py-3">
                {/* Collectible Amount */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">COLLECTIBLE:</div>
                  <div className={`text-lg font-semibold ${
                    ar.collectible_amount > 0 ? 'text-green-600' : 'text-content'
                  }`}>
                    {formatCurrency(ar.collectible_amount)}
                  </div>
                </div>

                {/* Total Payment */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">TOTAL PAYMENT:</div>
                  <div className="text-heading font-semibold">
                    {formatCurrency(ar.total_payment || 0)}
                  </div>
                </div>

                {/* Expenses */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">EXPENSES:</div>
                  <div className="text-heading">
                    {formatCurrency(ar.total_expenses || 0)}
                  </div>
                </div>

                {/* Profit */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">PROFIT:</div>
                  <div className={`font-semibold ${
                    ar.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(ar.profit || 0)}
                  </div>
                </div>
              </div>

              {/* Actions and Expand */}
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-main">
                <div className="flex items-center gap-4">
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

                  {/* Print Single Invoice Button */}
                  {ar.total_payment > 0 && (
                    <button
                      onClick={() => onPrint && onPrint(ar)}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      Print Invoice
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  {/* Create Invoice Button - Show when expenses exist and not paid */}
                  {!ar.is_paid && ar.total_expenses > 0 && (
                    <button
                      onClick={() => onSendPayment && onSendPayment(ar)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {ar.total_payment > 0 ? 'Send Invoice' : 'Add Invoice'}
                    </button>
                  )}

                  {/* Mark as Paid Button - Show when payment is set but not paid */}
                  {!ar.is_paid && ar.total_payment > 0 && (
                    <button
                      onClick={() => onMarkAsPaid && onMarkAsPaid(ar.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                    >
                      Mark as Paid
                    </button>
                  )}

                  {/* No Charges Warning */}
                  {!ar.is_paid && (!ar.total_expenses || ar.total_expenses === 0) && (
                    <span className="text-xs text-orange-600 flex items-center gap-1 px-2 py-1 bg-orange-100 rounded">
                      <AlertTriangle className="w-3 h-3" />
                      Add AP Charges First
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 space-y-4 border-t pt-4">
                  {/* Charge Breakdown - Using AccountsPayable Layout */}
                  {chargeBreakdown.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-muted" />
                        <span className="font-medium text-heading text-sm">Invoice Breakdown</span>
                      </div>
                      <div className="space-y-2 pl-5">
                        {chargeBreakdown.map((charge, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-1 text-xs border-b border-main pb-2 last:border-0">
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Charge Type:</span>
                              <span className="font-normal text-heading">{charge.description}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Base Amount:</span>
                              <span className="font-medium text-heading">{formatCurrency(charge.amount)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Markup ({charge.markup}%):</span>
                              <span className="font-medium text-green-600">{formatCurrency(charge.markup_amount)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Total:</span>
                              <span className="font-bold text-heading">{formatCurrency(charge.total)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Total Summary */}
                      <div className="flex justify-between items-center pt-3 border-t border-main/30 font-bold text-heading text-sm">
                        <div>Invoice Total:</div>
                        <div>{formatCurrency(ar.total_payment)}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-main border border-main rounded-lg p-4 text-center">
                      <Calculator className="w-8 h-8 mx-auto mb-2 text-muted opacity-50" />
                      <p className="text-sm text-muted">No invoice breakdown available</p>
                      <p className="text-xs text-muted mt-1">
                        Invoice breakdown will appear here after creating an invoice
                      </p>
                    </div>
                  )}

                  {/* Financial Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-heading mb-2">Financial Summary</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted">Total Expenses:</span>
                          <span className="font-medium text-heading">{formatCurrency(ar.total_expenses || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Total Payment:</span>
                          <span className="font-medium text-heading">{formatCurrency(ar.total_payment || 0)}</span>
                        </div>
                        <div className="flex justify-between border-t border-main pt-1">
                          <span className="text-muted font-medium">Net Profit:</span>
                          <span className={`font-semibold ${
                            ar.profit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(ar.profit || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-heading mb-2">Payment Status</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted">Amount Collected:</span>
                          <span className="font-medium text-heading">
                            {formatCurrency((ar.total_payment || 0) - (ar.collectible_amount || 0))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Remaining Balance:</span>
                          <span className={`font-medium ${
                            ar.collectible_amount > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(ar.collectible_amount || 0)}
                          </span>
                        </div>
                      </div>
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