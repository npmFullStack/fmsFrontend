// src/pages/QuoteRequest.jsx
import React, { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Filter } from 'lucide-react';
import { useQuote } from '../hooks/useQuote';
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

  const { 
    quotesQuery,
    sendQuote,
    deleteQuote 
  } = useQuote();

  // Fetch quotes with filters
  const { data, isLoading, isError, refetch } = quotesQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort: sortField,
    direction: sortDirection,
    status: 'pending' // Only show pending quotes by default
  });

  const quotes = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    from: data?.from || 0,
    to: data?.to || 0,
    total: data?.total || 0,
  };

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
      
      toast.success('Quote sent successfully! Email has been sent to the customer.');
      setIsSendQuoteModalOpen(false);
      setSelectedQuote(null);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send quote');
    }
  }, [selectedQuote, sendQuote, refetch]);

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
          Failed to load quote requests. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Quote Requests</h1>
        <p className="page-subtitle">Manage and send quotes to customers</p>
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