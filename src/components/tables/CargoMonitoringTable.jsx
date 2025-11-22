// src/components/tables/CargoMonitoringTable.jsx
import React, { useState, useMemo } from 'react';
import {
  Package,
  Calendar,
  MapPin,
  Container,
  Box,
  User,
  Edit,
  Clock,
  Truck,
  Ship,
  CheckCircle,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Filter,
  Printer
} from 'lucide-react';
import Select from 'react-select';
import { formatDate } from '../../utils/formatters';

const CargoMonitoringTable = ({ 
  data = [],
  onUpdateStatus,
  onPrint,
  onBulkPrint,
  dateFilter = 'all',
  onDateFilterChange,
  isLoading = false,
  selectedRecords = [],
  onSelectRecord,
  onSelectAllRecords
}) => {
  const [expandedCards, setExpandedCards] = useState([]);

  // Filter to show only cargo monitoring with bookings
  const cargoMonitoringData = useMemo(() => {
    return data.filter(item => item.booking && item.booking.status === 'approved');
  }, [data]);

  // Filter data by date
  const filteredData = useMemo(() => {
    if (dateFilter === 'all') return cargoMonitoringData;

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
        return cargoMonitoringData;
    }

    return cargoMonitoringData.filter(monitoring => {
      const monitoringDate = new Date(monitoring.created_at);
      return monitoringDate >= startDate;
    });
  }, [cargoMonitoringData, dateFilter]);

  const toggleCard = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': 'bg-gray-500 text-white border-gray-600',
      'Picked Up': 'bg-blue-500 text-white border-blue-600',
      'Origin Port': 'bg-purple-500 text-white border-purple-600',
      'In Transit': 'bg-orange-500 text-white border-orange-600',
      'Destination Port': 'bg-indigo-500 text-white border-indigo-600',
      'Out for Delivery': 'bg-yellow-500 text-black border-yellow-600',
      'Delivered': 'bg-green-500 text-white border-green-600'
    };
    return statusConfig[status] || 'bg-gray-500 text-white border-gray-600';
  };

  const getStatusIcon = (status) => {
    const iconConfig = {
      'Pending': <Clock className="w-4 h-4" />,
      'Picked Up': <Truck className="w-4 h-4" />,
      'Origin Port': <Ship className="w-4 h-4" />,
      'In Transit': <Ship className="w-4 h-4" />,
      'Destination Port': <MapPin className="w-4 h-4" />,
      'Out for Delivery': <Truck className="w-4 h-4" />,
      'Delivered': <CheckCircle className="w-4 h-4" />
    };
    return iconConfig[status] || <Clock className="w-4 h-4" />;
  };

  const formatStatusDate = (status, monitoring) => {
    const dateMap = {
      'Pending': monitoring.pending_at,
      'Picked Up': monitoring.picked_up_at,
      'Origin Port': monitoring.origin_port_at,
      'In Transit': monitoring.in_transit_at,
      'Destination Port': monitoring.destination_port_at,
      'Out for Delivery': monitoring.out_for_delivery_at,
      'Delivered': monitoring.delivered_at
    };
    
    const date = dateMap[status];
    return date ? formatDate(date, true) : 'Not Set';
  };

  const calculateTotalWeight = (items) => items?.reduce((sum, i) => sum + i.weight * i.quantity, 0) || 0;
  const calculateTotalItems = (items) => items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const formatWeight = (w) => `${parseFloat(w).toFixed(2)} kg`;

  // Date filter options for React Select
  const dateFilterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  if (isLoading) return (
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (filteredData.length === 0) return (
    <div className="text-center py-12 text-gray-500">
      No cargo monitoring data found.
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
            onChange={(selected) => onDateFilterChange && onDateFilterChange(selected.value)}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select time period"
          />
        </div>
        
        {/* Bulk Print Selector - EXACTLY like AccountsPayableTable */}
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={selectedRecords.length === filteredData.length && filteredData.length > 0}
            onChange={(e) => onSelectAllRecords && onSelectAllRecords(e.target.checked ? filteredData.map(monitoring => monitoring.id) : [])}
            className="w-4 h-4 text-primary border-main rounded focus:ring-primary"
          />
          <span className="text-sm text-muted">Select All for Print</span>
          
          {selectedRecords.length > 0 && (
            <button
              onClick={() => onBulkPrint && onBulkPrint(selectedRecords)}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Cargo Monitoring ({selectedRecords.length})
            </button>
          )}
        </div>
      </div>

      {/* Cargo Monitoring Cards */}
      {filteredData.map((monitoring, index) => {
        const booking = monitoring.booking;
        const totalWeight = calculateTotalWeight(booking.items);
        const totalItems = calculateTotalItems(booking.items);
        const isExpanded = expandedCards[monitoring.id || index];
        const isSelected = selectedRecords.includes(monitoring.id);

        return (
          <div
            key={monitoring.id || index}
            className={`bg-surface rounded-lg border border-main overflow-hidden hover:shadow-md transition-shadow ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="p-4">
              {/* Header with Customer and Status - EXACTLY like AccountsPayableTable */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted" />
                    <span className="font-semibold text-heading">
                      {booking.first_name} {booking.last_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    {booking.booking_number && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-muted">BOOKING #:</span>
                        <span className="text-heading font-mono font-semibold">{booking.booking_number}</span>
                      </div>
                    )}
                    {booking.hwb_number && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-muted">HWB #:</span>
                        <span className="text-heading font-mono font-semibold">{booking.hwb_number}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* REMOVED: Individual Print Button - Now only bulk print is available */}
                  
                  {/* Bulk Print Checkbox - EXACTLY like AccountsPayableTable */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectRecord && onSelectRecord(monitoring.id, e.target.checked)}
                    className="w-4 h-4 text-primary border-main rounded focus:ring-primary"
                  />
                  
                  {/* Current Status */}
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadge(monitoring.current_status)} flex items-center gap-2`}>
                    {getStatusIcon(monitoring.current_status)}
                    {monitoring.current_status || 'Not Set'}
                  </span>
                  
                  {/* Update Button */}
                  <button
                    onClick={() => onUpdateStatus && onUpdateStatus(monitoring)}
                    className="bg-blue-600 text-white px-3 py-1 text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Update
                  </button>
                </div>
              </div>

              {/* Compact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm mb-3 border-t border-b border-main py-3">
                {/* Route */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">ROUTE:</div>
                  <div className="flex items-center gap-1 text-heading">
                    <MapPin className="w-3 h-3 text-muted" />
                    <span className="truncate">{booking.origin?.route_name || booking.origin?.name || 'N/A'}</span>
                    <ArrowRight className="w-3 h-3 text-muted" />
                    <MapPin className="w-3 h-3 text-muted" />
                    <span className="truncate">{booking.destination?.route_name || booking.destination?.name || 'N/A'}</span>
                  </div>
                </div>

                {/* Container Info */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">CONTAINER:</div>
                  <div className="text-heading">
                    <div className="flex items-center gap-1">
                      <Container className="w-3 h-3 text-muted" />
                      {booking.container_quantity} x {booking.container_size?.size || booking.container_size?.name}
                    </div>
                    {booking.van_number && (
                      <div className="text-xs text-muted mt-1">VAN: {booking.van_number}</div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">ITEMS:</div>
                  <div className="flex flex-col gap-1">
                    <div className="text-heading flex items-center gap-1">
                      <Package className="w-3 h-3 text-muted"/>
                      {booking.items?.length || 0} types, {totalItems} units
                    </div>
                    <div className="text-xs text-muted flex items-center gap-1">
                      <span>Total: {formatWeight(totalWeight)}</span>
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">LAST UPDATE:</div>
                  <div className="text-heading text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted" />
                    {monitoring.updated_at ? formatDate(monitoring.updated_at, false) : 'Not Updated'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleCard(monitoring.id || index)}
                className="w-full text-left mt-2 pt-2 border-t border-main text-sm flex items-center gap-2 font-semibold text-heading hover:text-heading transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {isExpanded ? 'Hide Status Timeline' : 'View Status Timeline'}
              </button>

              {/* Status Timeline */}
              {isExpanded && (
                <div className="mt-3 text-xs space-y-2 border-t pt-3">
                  <div className="font-bold text-heading mb-2 text-sm uppercase">STATUS TIMELINE:</div>
                  <div className="flex flex-wrap gap-2">
                    {['Pending', 'Picked Up', 'Origin Port', 'In Transit', 'Destination Port', 'Out for Delivery', 'Delivered'].map(status => {
                      const dateField = `${status.toLowerCase().replace(' ', '_')}_at`;
                      const date = monitoring[dateField];
                      const isCurrent = monitoring.current_status === status;
                      const isCompleted = date !== null;
                      
                      return (
                        <div 
                          key={status} 
                          className={`
                            inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition-all
                            ${isCurrent 
                              ? 'border-blue-900 bg-surface text-blue-900 shadow-sm' 
                              : isCompleted 
                                ? 'border-green-200 bg-surface text-green-800' 
                                : 'border-gray-200 bg-surface text-gray-500'
                            }
                          `}
                        >
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(status)}
                            <span className="font-semibold whitespace-nowrap">{status}</span>
                          </div>
                          
                          {date && (
                            <div className="flex items-center gap-1 ml-1 pl-2 border-l border-current border-opacity-30">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs font-medium whitespace-nowrap">
                                {new Date(date).toLocaleString()}
                              </span>
                            </div>
                          )}
                          
                          {!date && (
                            <div className="flex items-center gap-1 ml-1 pl-2 border-l border-current border-opacity-30">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs italic whitespace-nowrap">
                                Not Set
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
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

export default CargoMonitoringTable;