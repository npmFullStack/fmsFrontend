// First, update the isCODPending function to be more accurate
const isCODPending = (booking) => {
  if (booking.accounts_receivable) {
    const ar = booking.accounts_receivable;
    return ar.payment_method === 'cod' && 
           ar.cod_pending === true;
  }
  return false;
};

// Also update the isFullyPaid function
const isFullyPaid = (booking) => {
  if (booking.accounts_receivable) {
    const ar = booking.accounts_receivable;
    // Fully paid if marked as paid OR if collectible_amount is 0 and not COD pending
    return ar.is_paid || (ar.collectible_amount === 0 && !ar.cod_pending);
  }
  return false;
};

// Get total payment due from AR record (updated)
const getTotalPaymentDue = (booking) => {
  if (booking.accounts_receivable) {
    const ar = booking.accounts_receivable;
    
    // If COD is pending, return 0 (no pay button should show)
    if (ar.payment_method === 'cod' && ar.cod_pending) {
      return 0;
    }
    
    return ar.collectible_amount > 0 ? ar.collectible_amount : 0;
  }
  return 0;
};

// Then update the action section logic:
{isApproved && (
  <div className="border-t border-gray-200">
    {/* CASE 1: Fully paid (GCash completed OR COD collected) */}
    {fullyPaid ? (
      <div className="bg-green-50 px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 text-green-700 mb-3 sm:mb-0">
          <BadgeCheck className="w-5 h-5" />
          <div>
            <span className="font-semibold">Fully Paid</span>
            <p className="text-sm text-green-600">Thank you for your payment</p>
          </div>
        </div>
        <button
          onClick={() => handleDownloadStatement(item)}
          className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Receipt
        </button>
      </div>
    ) : 
    
    /* CASE 2: COD booking pending - No payment button */
    isCODPending(item) ? (
      <div className="bg-blue-50 px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 text-blue-700 mb-3 sm:mb-0">
          <Truck className="w-5 h-5" />
          <div>
            <span className="font-semibold">Cash on Delivery - Pending</span>
            <p className="text-sm text-blue-600">Payment will be collected upon delivery</p>
          </div>
        </div>
        <button
          onClick={() => handleDownloadStatement(item)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Receipt className="w-4 h-4" />
          View Statement
        </button>
      </div>
    ) : 
    
    /* CASE 3: Has payment due (GCash or new COD booking) */
    totalPaymentDue > 0 ? (
      <div className="bg-white px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <button
          onClick={() => handleDownloadStatement(item)}
          className="w-full sm:w-auto bg-gray-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" />
          Download Statement
        </button>
        <button
          onClick={() => handlePayClick(item)}
          className="w-full sm:w-auto bg-primary text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <CreditCard className="w-4 h-4" />
          Pay {formatCurrency(totalPaymentDue)}
        </button>
      </div>
    ) : 
    
    /* CASE 4: No payment due and not pending COD (shouldn't happen normally) */
    null}
  </div>
)}