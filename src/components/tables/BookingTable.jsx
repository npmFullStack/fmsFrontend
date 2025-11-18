import React, { useState, useCallback, useMemo } from 'react';
import {
    Calendar,
    Package,
    CheckCircle,
    XCircle,
    Truck,
    Ship,
    User,
    Weight,
    Box,
    ArrowRight,
    Clock,
    ChevronDown,
    ChevronUp,
    Printer,
    FileText,
    MapPin,
    Container,
    CreditCard,
    UserCheck,
    UserCog
} from 'lucide-react';
import BulkActionBar from '../ui/BulkActionBar';
import { formatDate } from '../../utils/formatters';

const BookingTable = ({
  data = [],
  onSortChange,
  sortField = 'id',
  sortDirection = 'asc',
  isLoading = false,
}) => {
    const [selected, setSelected] = useState([]);
    const [expandedCards, setExpandedCards] = useState({});

    // Filter to show only approved bookings
    const approvedBookings = useMemo(() => {
        return data.filter(booking => booking.status === 'approved');
    }, [data]);

    const toggleCard = (id) => {
        setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSelect = useCallback((id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
        );
    }, []);

    const toggleSelectAll = useCallback(() => {
        const allSelected = selected.length === approvedBookings.length && approvedBookings.length > 0;
        setSelected(allSelected ? [] : approvedBookings.map((item) => item.id));
    }, [selected, approvedBookings]);

    const getBookingStatusBadge = (bookingStatus) => {
        switch (bookingStatus) {
            case 'delivered': return 'bg-green-500 text-white border-green-600';
            case 'in_transit': return 'bg-blue-500 text-white border-blue-600';
            default: return 'bg-gray-500 text-white border-gray-600';
        }
    };

    const getBookingStatusIcon = (bookingStatus) => {
        switch (bookingStatus) {
            case 'delivered': return <CheckCircle className="w-4 h-4" />;
            case 'in_transit': return <Truck className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const calculateTotalWeight = (items) => items?.reduce((sum, i) => sum + i.weight * i.quantity, 0) || 0;
    const calculateTotalItems = (items) => items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
    const formatWeight = (w) => `${parseFloat(w).toFixed(2)} kg`;

    // Print handlers
    const handlePrintWaybill = useCallback((booking) => {
        console.log('Print waybill for:', booking);
        // Implement waybill printing logic
    }, []);

    const handlePrintBillingStatement = useCallback((booking) => {
        console.log('Print billing statement for:', booking);
        // Implement billing statement printing logic
    }, []);

    const handleBulkPrintWaybill = useCallback(() => {
        const selectedBookings = approvedBookings.filter(item => selected.includes(item.id));
        console.log('Bulk print waybill for:', selectedBookings);
        // Implement bulk waybill printing logic
    }, [selected, approvedBookings]);

    const handleBulkPrintBilling = useCallback(() => {
        const selectedBookings = approvedBookings.filter(item => selected.includes(item.id));
        console.log('Bulk print billing for:', selectedBookings);
        // Implement bulk billing printing logic
    }, [selected, approvedBookings]);

    const handleBulkCancel = useCallback(() => {
        setSelected([]);
    }, []);

    if (isLoading) return (
        <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (approvedBookings.length === 0) return <div className="text-center py-12 text-gray-500">No approved bookings found.</div>;

    return (
        <div className="space-y-4">
            {approvedBookings.map((item, index) => {
                const totalWeight = calculateTotalWeight(item.items);
                const totalItems = calculateTotalItems(item.items);
                const isExpanded = expandedCards[item.id || index];
                const isSelected = selected.includes(item.id);

                return (
                    <div
                        key={item.id || index}
                        className={`bg-surface rounded-lg border overflow-hidden hover:shadow-md transition-shadow ${
                            isSelected ? 'border-blue-600 ring-2 ring-blue-700' : 'border-main'
                        }`}
                    >
                        <div className="p-4">
                            {/* Header with Checkbox and Booking Status */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        className="mt-1 table-checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleSelect(item.id)}
                                    />
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted" />
                                            <span className="font-semibold text-heading">{item.first_name} {item.last_name}</span>
                                            <div className="flex items-center gap-4 ml-4">
                                                {item.booking_number && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs font-bold text-muted">BOOKING #:</span>
                                                        <span className="text-content font-mono font-semibold">{item.booking_number}</span>
                                                    </div>
                                                )}
                                                {item.hwb_number && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs font-bold text-muted">HWB #:</span>
                                                        <span className="text-content font-mono font-semibold">{item.hwb_number}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted">{item.email}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    {/* Booking Status moved to top right */}
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getBookingStatusBadge(item.booking_status)} flex items-center gap-1`}>
                                        {getBookingStatusIcon(item.booking_status)}
                                        {item.booking_status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                                    </span>
                                    <div className="text-xs text-muted flex items-center gap-1">
                                        <Calendar className="w-3 h-3"/>
                                        {formatDate(item.created_at)}
                                    </div>
                                </div>
                            </div>

                            {/* Compact Grid with Icons on Data */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3 border-t border-b border-main py-3">
                                {/* Route */}
                                <div>
                                    <div className="text-xs font-bold text-muted mb-1 uppercase">ROUTE:</div>
                                    <div className="flex items-center gap-1 text-content">
                                        <MapPin className="w-3 h-3 text-muted" />
                                        <span className="truncate">{item.origin?.route_name || item.origin?.name || 'N/A'}</span>
                                        <ArrowRight className="w-3 h-3 text-muted" />
                                        <MapPin className="w-3 h-3 text-muted" />
                                        <span className="truncate">{item.destination?.route_name || item.destination?.name || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Container with VAN # */}
                                <div>
                                    <div className="text-xs font-bold text-muted mb-1 uppercase">CONTAINER:</div>
                                    <div className="text-content">
                                        <div className="flex items-center gap-1">
                                            <Container className="w-3 h-3 text-muted" />
                                            {item.container_quantity} x {item.container_size?.size || item.container_size?.name}
                                        </div>
                                        {item.van_number && (
                                            <div className="text-base font-mono text-content mt-1 flex items-center gap-1">
                                                <Box className="w-3 h-3" />
                                                VAN #: {item.van_number}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <div className="text-xs font-bold text-muted mb-1 uppercase">ITEMS:</div>
                                    <div className="flex flex-col gap-1">
                                        <div className="text-content flex items-center gap-1">
                                            <Package className="w-3 h-3 text-muted"/>
                                            {item.items?.length || 0} types, {totalItems} units
                                        </div>
                                        <div className="text-xs text-muted flex items-center gap-1">
                                            <Weight className="w-3 h-3"/>
                                            {formatWeight(totalWeight)} total
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Extra Info (Toggle) */}
                            <button
                                onClick={() => toggleCard(item.id || index)}
                                className="w-full text-left mt-2 pt-2 border-t border-main text-sm flex items-center gap-1 font-semibold text-heading"
                            >
                                {isExpanded ? (
                                    <>
                                        <ChevronUp className="w-4 h-4" /> Hide Details
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" /> View All Details
                                    </>
                                )}
                            </button>

                            {isExpanded && (
                                <div className="mt-3 text-xs space-y-3 border-t pt-3">
                                    {/* Payment Terms */}
                                    {item.terms !== undefined && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <div className="text-xs font-bold text-muted mb-1 uppercase">PAYMENT TERMS:</div>
                                                <div className="text-content flex items-center gap-1">
                                                    <CreditCard className="w-3 h-3 text-muted" />
                                                    {item.terms === 0 ? 'Immediate' : `${item.terms} days`}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {/* Shipping Line */}
                                        <div>
                                            <div className="text-xs font-bold text-muted mb-1 uppercase">SHIPPING LINE:</div>
                                            <div className="text-content flex items-center gap-1">
                                                <Ship className="w-3 h-3 text-muted" />
                                                {item.shipping_line?.name || 'Not specified'}
                                            </div>
                                        </div>

                                        {/* Trucking */}
                                        <div>
                                            <div className="text-xs font-bold text-muted mb-1 uppercase">TRUCKING:</div>
                                            <div className="text-content flex items-center gap-1">
                                                <Truck className="w-3 h-3 text-muted" />
                                                {item.truck_comp?.name || 'Not specified'}
                                            </div>
                                        </div>

                                        {/* Parties */}
                                        <div>
                                            <div className="text-xs font-bold text-muted mb-1 uppercase">PARTIES:</div>
                                            <div className="text-content space-y-1">
                                                <div className="flex items-center gap-1">
                                                    <UserCheck className="w-3 h-3 text-muted" />
                                                    <span className="font-semibold">SHIPPER:</span> {item.shipper_first_name} {item.shipper_last_name}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <UserCog className="w-3 h-3 text-muted" />
                                                    <span className="font-semibold">CONSIGNEE:</span> {item.consignee_first_name} {item.consignee_last_name}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schedule Information inside expanded view */}
                                    {(item.departure_date || item.delivery_date) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            {item.departure_date && (
                                                <div>
                                                    <div className="text-xs font-bold text-muted mb-1 uppercase">PREFERRED DEPARTURE:</div>
                                                    <div className="text-content flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-muted"/>
                                                        {formatDate(item.departure_date)}
                                                    </div>
                                                </div>
                                            )}

                                            {item.delivery_date && (
                                                <div>
                                                    <div className="text-xs font-bold text-muted mb-1 uppercase">PREFERRED DELIVERY:</div>
                                                    <div className="text-content flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-muted"/>
                                                        {formatDate(item.delivery_date)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {item.items?.length > 0 && (
                                        <div>
                                            <div className="font-bold text-muted mb-1 uppercase">ITEMS ({item.items.length}):</div>
                                            <div className="space-y-2 pl-3 border-l-2 border-main">
                                                {item.items.map((i, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <Package className="w-3 h-3 text-muted" />
                                                        <div>
                                                            <div className="font-medium text-heading">{i.name}</div>
                                                            <div className="text-muted">{i.category} | {i.quantity} x {formatWeight(i.weight)}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Print Actions */}
                        <div className="bg-surface px-4 py-3 border-t border-main flex justify-end gap-2">
                            <button
                                onClick={() => handlePrintWaybill(item)}
                                className="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Printer className="w-4 h-4" />
                                Print Waybill
                            </button>
                            <button
                                onClick={() => handlePrintBillingStatement(item)}
                                className="bg-green-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                Print Billing Statement
                            </button>
                        </div>
                    </div>
                );
            })}

            {/* Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selected.length}
                onEdit={handleBulkPrintWaybill}
                onDelete={handleBulkPrintBilling}
                onCancel={handleBulkCancel}
                editLabel="Print Waybill"
                deleteLabel="Print Billing Statement"
                disableEdit={false}
            />
        </div>
    );
};

export default BookingTable;