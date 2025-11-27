// src/components/tables/CargoMonitoringTable.jsx
import React, { useState, useMemo } from 'react';
import {
  Package,
  Calendar,
  MapPin,
  Container,
  User,
  Edit,
  Clock,
  Truck,
  Ship,
  CheckCircle,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Printer
} from 'lucide-react';
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

  const calculateTotalWeight = (items) => items?.reduce((sum, i) => sum + i.weight * i.quantity, 0) || 0;
  const calculateTotalItems = (items) => items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const formatWeight = (w) => `${parseFloat(w).toFixed(2)} kg`;

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
      {/* Bulk Print Selector - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-main rounded-lg">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedRecords.length === filteredData.length && filteredData.length > 0}
            onChange={(e) => onSelectAllRecords && onSelectAllRecords(e.target.checked ? filteredData.map(monitoring => monitoring.id) : [])}
            className="w-4 h-4 text-primary border-main rounded focus:ring-primary"
          />
          <span className="text-sm text-muted">Select All for Print</span>
        </div>
        
        {selectedRecords.length > 0 && (
          <button
            onClick={() => onBulkPrint && onBulkPrint(selectedRecords)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto"
          >
            <Printer className="w-4 h-4" />
            Print Cargo Monitoring ({selectedRecords.length})
          </button>
        )}
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
              {/* Header with Customer and Status - Mobile Responsive */}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 mb-3">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted flex-shrink-0" />
                    <span className="font-semibold text-heading text-sm lg:text-base truncate">
                      {booking.first_name} {booking.last_name}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 ml-0 sm:ml-4">
                    {booking.booking_number && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-muted">BOOKING #:</span>
                        <span className="text-heading font-mono font-semibold text-sm">{booking.booking_number}</span>
                      </div>
                    )}
                    {booking.hwb_number && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-muted">HWB #:</span>
                        <span className="text-heading font-mono font-semibold text-sm">{booking.hwb_number}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  {/* Bulk Print Checkbox for Mobile */}
                  <div className="flex items-center gap-2 sm:hidden w-full justify-between">
                    <span className="text-sm text-muted">Select for print</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectRecord && onSelectRecord(monitoring.id, e.target.checked)}
                      className="w-4 h-4 text-primary border-main rounded focus:ring-primary"
                    />
                  </div>
                  
                  {/* Current Status */}
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadge(monitoring.current_status)} flex items-center gap-2 justify-center sm:justify-start`}>
                    {getStatusIcon(monitoring.current_status)}
                    <span className="hidden sm:inline">{monitoring.current_status || 'Not Set'}</span>
                    <span className="sm:hidden">{monitoring.current_status?.split(' ')[0] || 'N/A'}</span>
                  </span>
                  
                  {/* Update Button */}
                  <button
                    onClick={() => onUpdateStatus && onUpdateStatus(monitoring)}
                    className="bg-blue-600 text-white px-3 py-1 text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center sm:justify-start w-full sm:w-auto"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Update</span>
                  </button>

                  {/* Bulk Print Checkbox for Desktop */}
                  <div className="hidden sm:flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectRecord && onSelectRecord(monitoring.id, e.target.checked)}
                      className="w-4 h-4 text-primary border-main rounded focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Compact Grid - Mobile Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-3 border-t border-b border-main py-3">
                {/* Route */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <div className="text-xs font-bold text-muted mb-1 uppercase">ROUTE:</div>
                  <div className="flex items-center gap-1 text-heading flex-wrap">
                    <MapPin className="w-3 h-3 text-muted flex-shrink-0" />
                    <span className="truncate text-sm">{booking.origin?.route_name || booking.origin?.name || 'N/A'}</span>
                    <ArrowRight className="w-3 h-3 text-muted flex-shrink-0" />
                    <MapPin className="w-3 h-3 text-muted flex-shrink-0" />
                    <span className="truncate text-sm">{booking.destination?.route_name || booking.destination?.name || 'N/A'}</span>
                  </div>
                </div>

                {/* Container Info */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">CONTAINER:</div>
                  <div className="text-heading">
                    <div className="flex items-center gap-1">
                      <Container className="w-3 h-3 text-muted flex-shrink-0" />
                      <span className="text-sm">{booking.container_quantity} x {booking.container_size?.size || booking.container_size?.name}</span>
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
                      <Package className="w-3 h-3 text-muted flex-shrink-0"/>
                      <span className="text-sm">{booking.items?.length || 0} types, {totalItems} units</span>
                    </div>
                    <div className="text-xs text-muted flex items-center gap-1">
                      <span>Total: {formatWeight(totalWeight)}</span>
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <div className="text-xs font-bold text-muted mb-1 uppercase">LAST UPDATE:</div>
                  <div className="text-heading text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted flex-shrink-0" />
                    <span>{monitoring.updated_at ? formatDate(monitoring.updated_at, false) : 'Not Updated'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleCard(monitoring.id || index)}
                className="w-full text-left mt-2 pt-2 border-t border-main text-sm flex items-center justify-between gap-2 font-semibold text-heading hover:text-heading transition-colors"
              >
                <span>
                  {isExpanded ? 'Hide Status Timeline' : 'View Status Timeline'}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                )}
              </button>

              {/* Status Timeline - Fixed Colors */}
              {isExpanded && (
                <div className="mt-3 text-xs space-y-2 border-t pt-3">
                  <div className="font-bold text-heading mb-2 text-sm uppercase">STATUS TIMELINE:</div>
                  <div className="space-y-1">
                    {['Pending', 'Picked Up', 'Origin Port', 'In Transit', 'Destination Port', 'Out for Delivery', 'Delivered'].map((status, index) => {
                      const dateField = `${status.toLowerCase().replace(' ', '_')}_at`;
                      const date = monitoring[dateField];
                      const isCurrent = monitoring.current_status === status;
                      const isCompleted = date !== null;
                      
                      return (
                        <div 
                          key={status} 
                          className="relative flex items-center gap-3 py-2"
                        >
                          {/* Timeline dot - FIXED COLOR LOGIC */}
                          <div className={`
                            w-3 h-3 rounded-full z-10 flex-shrink-0
                            ${isCurrent 
                              ? 'bg-blue-500 ring-2 ring-blue-200' 
                              : isCompleted 
                                ? 'bg-green-500' 
                                : 'bg-gray-300'
                            }
                          `} />
                          
                          {/* Timeline connector (except for last item) - FIXED COLOR LOGIC */}
                          {index < 6 && (
                            <div className={`
                              absolute left-1.5 top-full w-0.5 h-4 -ml-px z-0
                              ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                            `} />
                          )}
                          
                          {/* Status content */}
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(status)}
                              <span className={`
                                font-medium text-sm
                                ${isCurrent 
                                  ? 'text-blue-700 font-semibold' 
                                  : isCompleted 
                                    ? 'text-green-700' 
                                    : 'text-gray-500'
                                }
                              `}>
                                {status}
                              </span>
                            </div>
                            
                            {date && (
                              <div className="flex items-center gap-1 text-xs text-muted ml-6 sm:ml-0">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span className="font-medium whitespace-nowrap text-xs">
                                  {new Date(date).toLocaleString()}
                                </span>
                              </div>
                            )}
                            
                            {!date && (
                              <div className="flex items-center gap-1 text-xs text-gray-400 ml-6 sm:ml-0">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span className="italic whitespace-nowrap text-xs">
                                  Not Set
                                </span>
                              </div>
                            )}
                          </div>
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