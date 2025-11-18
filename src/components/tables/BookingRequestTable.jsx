// Updated compact layout with detail structure matching provided example
// View All Details moved left + text-primary

import React, { useState } from 'react';
import {
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  Ship,
  User,
  Weight,
  Check,
  X,
  ArrowRight,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const BookingRequestTable = ({
  data = [],
  onApprove,
  onReject,
  isLoading = false,
  isUpdating = false,
}) => {
  const [expandedCards, setExpandedCards] = useState({});

  const toggleCard = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white border-green-600';
      case 'rejected': return 'bg-red-500 text-white border-red-600';
      default: return 'bg-yellow-500 text-white border-yellow-600';
    }
  };

  const calculateTotalWeight = (items) => items?.reduce((sum, i) => sum + i.weight * i.quantity, 0) || 0;
  const calculateTotalItems = (items) => items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const formatWeight = (w) => `${parseFloat(w).toFixed(2)} kg`;

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (data.length === 0)
    return <div className="text-center py-12 text-gray-500">No booking requests found.</div>;

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const isPending = item.status === 'pending';
        const totalWeight = calculateTotalWeight(item.items);
        const totalItems = calculateTotalItems(item.items);
        const isExpanded = expandedCards[item.id || index];

        return (
          <div
            key={item.id || index}
            className="bg-surface rounded-lg border border-main overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4">

              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-muted" />
                    <span className="font-semibold text-heading">{item.first_name} {item.last_name}</span>
                  </div>
                  <div className="text-xs text-muted">{item.email}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(item.status)}`}>
                    {item.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className="text-xs text-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.created_at)}
                  </div>
                </div>
              </div>

              {/* Compact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3 border-t border-b border-main py-3">

                <div>
                  <div className="text-xs font-semibold text-muted mb-1">Route:</div>
                  <div className="flex items-center gap-1 text-content">
                    <span className="truncate">{item.origin?.route_name || item.origin?.name || 'N/A'}</span>
                    <ArrowRight className="w-3 h-3 text-muted" />
                    <span className="truncate">{item.destination?.route_name || item.destination?.name || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted mb-1">Container:</div>
                  <div className="text-content">
                    {item.container_quantity} × {item.container_size?.size || item.container_size?.name}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted mb-1">Items:</div>
                  <div className="flex flex-col gap-1">
                    <div className="text-content flex items-center gap-1">
                      <Package className="w-3 h-3 text-muted" />
                      {item.items?.length || 0} types, {totalItems} units
                    </div>
                    <div className="text-xs text-muted flex items-center gap-1">
                      <Weight className="w-3 h-3" />
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="font-semibold text-muted">Shipping Line:</span>
                      <div className="flex items-center gap-1 text-content mt-1">
                        <Ship className="w-3 h-3" /> {item.shipping_line?.name || 'Not specified'}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-muted">Trucking:</span>
                      <div className="flex items-center gap-1 text-content mt-1">
                        <Truck className="w-3 h-3" /> {item.truck_comp?.name || 'Not specified'}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-muted">Parties:</span>
                      <div className="text-content mt-1">
                        Shipper: {item.shipper_first_name} {item.shipper_last_name}<br />
                        Consignee: {item.consignee_first_name} {item.consignee_last_name}
                      </div>
                    </div>
                  </div>

                  {item.items?.length > 0 && (
                    <div>
                      <div className="font-semibold text-muted mb-1">Items ({item.items.length}):</div>
                      <div className="space-y-2 pl-3 border-l-2 border-main">
                        {item.items.map((i, idx) => (
                          <div key={idx}>
                            <div className="font-medium text-heading">{i.name}</div>
                            <div className="text-muted">{i.category} | {i.quantity} × {formatWeight(i.weight)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-surface px-4 py-3 border-t border-main flex justify-end gap-2">
              {isPending ? (
                <>
                  <button
                    onClick={() => onReject(item)}
                    disabled={isUpdating}
                    className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${isUpdating ? 'bg-surface text-muted cursor-not-allowed border border-main' : 'bg-red-600 text-white hover:bg-red-700'}`}
                  >
                    {isUpdating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <X className="w-4 h-4" />} Reject
                  </button>

                  <button
                    onClick={() => onApprove(item)}
                    disabled={isUpdating}
                    className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${isUpdating ? 'bg-surface text-muted cursor-not-allowed border border-main' : 'bg-primary text-white hover:bg-blue-700'}`}
                  >
                    {isUpdating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />} Approve
                  </button>
                </>
              ) : (
                 <span className="text-xs text-muted px-2 py-1 flex items-center gap-1.5">
                  {item.status === "approved" ? <><CheckCircle className="w-3 h-3 text-green-500" /> Approved</> : <><XCircle className="w-3 h-3 text-red-500" /> Rejected</>}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BookingRequestTable;