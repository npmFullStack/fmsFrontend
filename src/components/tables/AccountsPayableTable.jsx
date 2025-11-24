// src/components/tables/AccountsPayableTable.jsx
import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Truck,
  Anchor,
  FileText,
  ChevronUp,
  ChevronDown,
  User,
  Calendar,
  Printer,
  Filter
} from 'lucide-react';
import Select from 'react-select';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AccountsPayableTable = ({ 
  data = [],
  onView,
  isLoading = false,
  onPrint,
  onBulkPrint,
  selectedRecords = [],
  onSelectRecord,
  onSelectAllRecords,
  onPrintBRFP // Add this new prop
}) => {
  const [expandedCards, setExpandedCards] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');

  const toggleCard = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate total amount for each AP record
  const calculateTotalAmount = (ap) => {
    let total = 0;

    if (ap.freight_charge) {
      total += parseFloat(ap.freight_charge.amount) || 0;
    }

    if (ap.trucking_charges) {
      total += ap.trucking_charges.reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
    }

    if (ap.port_charges) {
      total += ap.port_charges.reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
    }

    if (ap.misc_charges) {
      total += ap.misc_charges.reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
    }

    return total;
  };

  // Filter data by date
  const filteredData = useMemo(() => {
    if (dateFilter === 'all') return data;

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
        return data;
    }

    return data.filter(ap => {
      const apDate = new Date(ap.created_at);
      return apDate >= startDate;
    });
  }, [data, dateFilter]);

  // Filter duplicate charges - only show unique types
  const getUniqueCharges = (charges, typeField = 'type') => {
    const uniqueCharges = [];
    const seenTypes = new Set();
    
    charges.forEach(charge => {
      if (!seenTypes.has(charge[typeField])) {
        seenTypes.add(charge[typeField]);
        uniqueCharges.push(charge);
      }
    });
    
    return uniqueCharges;
  };

  // Date filter options for React Select
  const dateFilterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  if (isLoading) return (
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (filteredData.length === 0) return (
    <div className="text-center py-12 text-muted">
      No accounts payable records found.
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
        
        {/* React Select for Date Filter */}
        <div className="min-w-[200px]">
          <Select
            options={dateFilterOptions}
            value={dateFilterOptions.find(option => option.value === dateFilter)}
            onChange={(selected) => setDateFilter(selected.value)}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select time period"
          />
        </div>
        
        {/* Bulk Print Selector */}
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={selectedRecords.length === filteredData.length && filteredData.length > 0}
            onChange={(e) => onSelectAllRecords && onSelectAllRecords(e.target.checked ? filteredData.map(ap => ap.id) : [])}
            className="w-4 h-4 text-primary border-main rounded focus:ring-primary"
          />
          <span className="text-sm text-muted">Select All for Print</span>
          
          {selectedRecords.length > 0 && (
            <button
              onClick={() => onBulkPrint && onBulkPrint(selectedRecords)}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Accounts Payable ({selectedRecords.length})
            </button>
          )}
        </div>
      </div>

      {/* AP Records */}
      {filteredData.map((ap, index) => {
        const booking = ap.booking;
        const totalAmount = calculateTotalAmount(ap);
        const isExpanded = expandedCards[ap.id || index];
        const isSelected = selectedRecords.includes(ap.id);

        // Get unique charges to avoid duplicates
        const uniqueTruckingCharges = ap.trucking_charges ? getUniqueCharges(ap.trucking_charges, 'type') : [];
        const uniquePortCharges = ap.port_charges ? getUniqueCharges(ap.port_charges, 'charge_type') : [];
        const uniqueMiscCharges = ap.misc_charges ? getUniqueCharges(ap.misc_charges, 'charge_type') : [];

        return (
          <div
            key={ap.id || index}
            className={`bg-surface rounded-lg border border-main overflow-hidden hover:shadow-md transition-shadow ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="p-4">
              {/* Header with Customer and Status */}
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
                    {ap.voucher_number && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-muted">VOUCHER #:</span>
                        <span className="text-heading font-mono font-semibold">{ap.voucher_number}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Bulk Print Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectRecord && onSelectRecord(ap.id, e.target.checked)}
                    className="w-4 h-4 text-primary border-main rounded focus:ring-primary"
                    title="Select for bulk printing"
                  />
                </div>
              </div>

              {/* Compact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm mb-3 border-t border-b border-main py-3">
                {/* Total Expenses */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">TOTAL EXPENSES:</div>
                  <div className="text-heading font-semibold text-lg">
                    {formatCurrency(totalAmount)}
                  </div>
                </div>

                {/* Route Info */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">ROUTE:</div>
                  <div className="text-heading">
                    {booking?.origin?.route_name || booking?.origin?.name || 'N/A'} → {booking?.destination?.route_name || booking?.destination?.name || 'N/A'}
                  </div>
                </div>

                {/* Container Info */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">CONTAINER:</div>
                  <div className="text-heading">
                    {booking?.container_quantity} x {booking?.container_size?.size || booking?.container_size?.name || 'N/A'}
                    {booking?.van_number && (
                      <div className="text-xs text-muted mt-1">VAN: {booking.van_number}</div>
                    )}
                  </div>
                </div>

                {/* Last Updated */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">LAST UPDATED:</div>
                  <div className="text-heading text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted" />
                    {ap.updated_at ? formatDate(ap.updated_at, false) : 'Not Updated'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-main">
                {/* Expand/Collapse Button */}
                <button
                  onClick={() => toggleCard(ap.id || index)}
                  className="text-sm flex items-center gap-2 font-semibold text-heading hover:text-heading transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {isExpanded ? 'Hide All Charges' : 'View All Charges'}
                </button>

                {/* Print BRFP Button */}
                <button
                  onClick={() => onPrintBRFP && onPrintBRFP(ap)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  title="Print Booking/Request for Payment"
                >
                  <Printer className="w-4 h-4" />
                  Print BFRP
                </button>

                {/* Individual Print Button */}
                <button
                  onClick={() => onPrint && onPrint(ap)}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  title="Print this record"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>

              {/* Expanded Charges Details - Compact with smaller text */}
              {isExpanded && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  {/* Freight Charges */}
                  {ap.freight_charge && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3 h-3 text-muted" />
                        <span className="font-medium text-heading text-sm">Freight Charge</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 text-xs pl-5">
                        <div className="flex items-center gap-1">
                          <span className="text-muted">Amount:</span>
                          <span className="font-medium text-heading">{formatCurrency(ap.freight_charge.amount)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted">Check Date:</span>
                          <span className="text-heading">{ap.freight_charge.check_date ? formatDate(ap.freight_charge.check_date, false) : 'Not Set'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted">Voucher:</span>
                          <span className="font-mono text-heading">{ap.freight_charge.voucher_number || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trucking Charges */}
                  {uniqueTruckingCharges.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Truck className="w-3 h-3 text-muted" />
                        <span className="font-medium text-heading text-sm">Trucking Charges</span>
                      </div>
                      <div className="space-y-2 pl-5">
                        {uniqueTruckingCharges.map((charge, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-1 text-xs border-b border-main pb-2 last:border-0">
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Type:</span>
                              <span className="font-normal text-heading">{charge.type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Amount:</span>
                              <span className="font-medium text-heading">{formatCurrency(charge.amount)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Check Date:</span>
                              <span className="text-heading">{charge.check_date ? formatDate(charge.check_date, false) : 'Not Set'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Voucher:</span>
                              <span className="font-mono text-heading">{charge.voucher_number || 'N/A'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Port Charges */}
                  {uniquePortCharges.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Anchor className="w-3 h-3 text-muted" />
                        <span className="font-medium text-heading text-sm">Port Charges</span>
                      </div>
                      <div className="space-y-2 pl-5">
                        {uniquePortCharges.map((charge, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-1 text-xs border-b border-main pb-2 last:border-0">
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Type:</span>
                              <span className="font-normal text-heading">{charge.charge_type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Payee:</span>
                              <span className="text-heading">{charge.payee || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Amount:</span>
                              <span className="font-medium text-heading">{formatCurrency(charge.amount)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Voucher:</span>
                              <span className="font-mono text-heading">{charge.voucher_number || 'N/A'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Miscellaneous Charges */}
                  {uniqueMiscCharges.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3 text-muted" />
                        <span className="font-medium text-heading text-sm">Miscellaneous Charges</span>
                      </div>
                      <div className="space-y-2 pl-5">
                        {uniqueMiscCharges.map((charge, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-1 text-xs border-b border-main pb-2 last:border-0">
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Type:</span>
                              <span className="font-normal text-heading">{charge.charge_type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Payee:</span>
                              <span className="text-heading">{charge.payee || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Amount:</span>
                              <span className="font-medium text-heading">{formatCurrency(charge.amount)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted">Voucher:</span>
                              <span className="font-mono text-heading">{charge.voucher_number || 'N/A'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccountsPayableTable;