// src/pages/QuoteRequest.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Filter, RefreshCw } from 'lucide-react';
import { useQuote } from '../hooks/useQuote';
import { useOptimizedApi } from '../hooks/useOptimizedApi';
import TableLayout from '../components/layout/TableLayout';
import QuoteRequestTable from '../components/tables/QuoteRequestTable';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import SendQuoteCharge from '../components/modals/SendQuoteCharge';
import toast from 'react-hot-toast';

const QuoteRequest = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isSendQuoteModalOpen, setIsSendQuoteModalOpen] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);

  // Optimized API hook
  const { optimizedRequest, cancelRequest, clearCache } = useOptimizedApi();

  const { 
    quotesQuery,
    sendQuote,
    deleteQuote 
  } = useQuote();

  // ✅ Enhanced quotes query with optimization
  const { data, isLoading, isError, refetch } = quotesQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort: sortField,
    direction: sortDirection,
    status: 'pending', // Only show pending quotes by default
    _refresh: forceRefresh // Add refresh trigger
  });

  const quotes = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    from: data?.from || 0,
    to: data?.to || 0,
    total: data?.total || 0,
  };

  // Refresh data function
  const handleRefresh = useCallback(() => {
    clearCache('quotes');
    setForceRefresh(prev => prev + 1);
    toast.success('Quote requests refreshed');
  }, [clearCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest('quotes');
    };
  }, [cancelRequest]);

  const handleSortChange = useCallback((field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  // Handle Send Quote button click
  const handleSendQuote = useCallback((quote) => {
    setSelectedQuote(quote);
    setIsSendQuoteModalOpen(true);
  }, []);

  // Handle quote submission from modal
  const handleQuoteSubmit = useCallback(async (quoteData) => {
    if (!selectedQuote) return;

    try {
      await sendQuote.mutateAsync({ 
        id: selectedQuote.id,
        charges: quoteData.charges,
        total_amount: quoteData.totalAmount
      });
      
      // Clear cache after successful send
      clearCache('quotes');
      toast.success('Quote sent successfully! Email has been sent to the customer.');
      setIsSendQuoteModalOpen(false);
      setSelectedQuote(null);
      refetch();
    } catch (error) {
      console.error('Send quote error:', error);
      toast.error(error.response?.data?.message || 'Failed to send quote');
    }
  }, [selectedQuote, sendQuote, clearCache, refetch]);

  // Loading & error states
  if (isLoading && !data) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-error">
        <div className="page-error-content">
          <p>Failed to load quote requests. Please try again.</p>
          <button 
            onClick={handleRefresh}
            className="page-btn-primary mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">Quote Requests</h1>
            <p className="page-subtitle">Manage and send quotes to customers</p>
          </div>
          <button
            onClick={handleRefresh}
            className="page-btn-secondary flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="page-table-section">
        <TableLayout
          searchBar={
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search quotes by name, email, or route"
            />
          }
          actions={
            <div className="page-actions">
              <span className="text-sm text-muted">
                Showing {quotes.length} of {pagination.total} requests
              </span>
            </div>
          }
        >
          <QuoteRequestTable
            data={quotes}
            onSendQuote={handleSendQuote}
            isLoading={isLoading}
            isUpdating={sendQuote.isPending}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />
        </TableLayout>
      </div>

      {pagination.last_page > 1 && (
        <div className="page-pagination">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Send Quote Modal */}
      <SendQuoteCharge
        isOpen={isSendQuoteModalOpen}
        onClose={() => {
          setIsSendQuoteModalOpen(false);
          setSelectedQuote(null);
        }}
        onSave={handleQuoteSubmit}
        quote={selectedQuote}
        isLoading={sendQuote.isPending}
      />
    </div>
  );
};

export default QuoteRequest;