// src/components/tables/QuoteRequestTable.jsx
import React, { useState, useCallback } from 'react';
import { 
  Mail, 
  Clock, 
  User, 
  MapPin, 
  Package, 
  Container,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const QuoteRequestTable = ({ 
  data = [],
  onSendQuote,
  onSortChange,
  sortField = 'created_at',
  sortDirection = 'desc',
  isLoading = false,
  isUpdating = false
}) => {
  const [expandedCards, setExpandedCards] = useState([]);

  const toggleCard = (id) => {
    setExpandedCards(prev => ({ 
      ...prev, 
      [id]: !prev[id] 
    }));
  };

  const calculateTotalWeight = (items) => 
    items?.reduce((sum, i) => sum + i.weight * i.quantity, 0) || 0;

  const calculateTotalItems = (items) => 
    items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  const formatWeight = (w) => `${parseFloat(w).toFixed(2)} kg`;

  

  if (isLoading) return (
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (data.length === 0) return (
    <div className="text-center py-12 text-gray-500">
      No quote requests found.
    </div>
  );

  return (
    <div className="space-y-4">
      {data.map((quote, index) => {
        const totalWeight = calculateTotalWeight(quote.items);
        const totalItems = calculateTotalItems(quote.items);
        const isExpanded = expandedCards[quote.id || index];
        const isSent = quote.status === 'sent';

        return (
          <div
            key={quote.id || index}
            className="bg-surface rounded-lg border border-main overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted" />
                      <span className="font-semibold text-heading">
                        {quote.first_name} {quote.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Mail className="w-3 h-3 text-muted" />
                      <span className="text-sm text-muted">{quote.email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">

                  {/* Send Quote Button */}
                  {!isSent && (
                    <button
                      onClick={() => onSendQuote(quote)}
                      disabled={isUpdating}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                        isUpdating 
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-primary text-white hover:bg-primary-dark'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      {isUpdating ? 'Sending...' : 'Send Quote'}
                    </button>
                  )}
                </div>
              </div>

              {/* Quote Date */}
              <div className="text-xs text-muted flex items-center gap-1 mb-3">
                <Calendar className="w-3 h-3"/>
                Requested: {formatDate(quote.created_at)}
                {quote.sent_at && (
                  <>
                    <span className="mx-2">•</span>
                    <Mail className="w-3 h-3"/>
                    Sent: {formatDate(quote.sent_at)}
                  </>
                )}
              </div>

              {/* Compact Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3 border-t border-b border-main py-3">
                {/* Route */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">ROUTE:</div>
                  <div className="flex items-center gap-1 text-content">
                    <MapPin className="w-3 h-3 text-muted" />
                    <span className="truncate">{quote.origin?.route_name || 'N/A'}</span>
                    <span className="text-muted">→</span>
                    <MapPin className="w-3 h-3 text-muted" />
                    <span className="truncate">{quote.destination?.route_name || 'N/A'}</span>
                  </div>
                </div>

                {/* Container */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">CONTAINER:</div>
                  <div className="text-content flex items-center gap-1">
                    <Container className="w-3 h-3 text-muted" />
                    {quote.container_quantity} x {quote.container_size?.size || 'N/A'}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div className="text-xs font-bold text-muted mb-1 uppercase">ITEMS:</div>
                  <div className="flex flex-col gap-1">
                    <div className="text-content flex items-center gap-1">
                      <Package className="w-3 h-3 text-muted"/>
                      {quote.items?.length || 0} types, {totalItems} units
                    </div>
                    <div className="text-xs text-muted flex items-center gap-1">
                      <span>Total weight: {formatWeight(totalWeight)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Details */}
              <button
                onClick={() => toggleCard(quote.id || index)}
                className="w-full text-left mt-2 pt-2 border-t border-main text-sm flex items-center gap-1 font-semibold text-heading"
              >
                {isExpanded ? (
                  <> <ChevronUp className="w-4 h-4" /> Hide Details </>
                ) : (
                  <> <ChevronDown className="w-4 h-4" /> View All Details </>
                )}
              </button>

              {isExpanded && (
                <div className="mt-3 text-xs space-y-3 border-t pt-3">
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-bold text-muted mb-1 uppercase">CONTACT:</div>
                      <div className="text-content">
                        {quote.contact_number && (
                          <div>Phone: {quote.contact_number}</div>
                        )}
                        <div>Terms: {quote.terms} days</div>
                        <div>Service: {quote.mode_of_service}</div>
                      </div>
                    </div>
                    
                    {/* Service Providers */}
                    <div>
                      <div className="text-xs font-bold text-muted mb-1 uppercase">SERVICE PROVIDERS:</div>
                      <div className="text-content space-y-1">
                        <div>Shipping Line: {quote.shipping_line?.name || 'Not specified'}</div>
                        <div>Trucking: {quote.truck_comp?.name || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Parties */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-bold text-muted mb-1 uppercase">SHIPPER:</div>
                      <div className="text-content">
                        {quote.shipper_first_name} {quote.shipper_last_name}
                        {quote.shipper_contact && (
                          <div>Contact: {quote.shipper_contact}</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-muted mb-1 uppercase">CONSIGNEE:</div>
                      <div className="text-content">
                        {quote.consignee_first_name} {quote.consignee_last_name}
                        {quote.consignee_contact && (
                          <div>Contact: {quote.consignee_contact}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items Details */}
                  <div>
                    <div className="font-bold text-muted mb-1 uppercase">ITEMS:</div>
                    <div className="space-y-2 pl-3 border-l-2 border-main">
                      {quote.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Package className="w-3 h-3 text-muted" />
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-muted">
                              {item.category} | {item.quantity} units | {item.weight} kg each
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quote Amount if sent */}
                  {isSent && quote.total_amount && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-green-800">QUOTE AMOUNT:</span>
                        <span className="text-lg font-bold text-green-800">
                          ${parseFloat(quote.total_amount).toFixed(2)}
                        </span>
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

export default QuoteRequestTable;