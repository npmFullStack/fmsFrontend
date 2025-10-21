// src/components/layout/TableLayout.jsx
import React from 'react';

const TableLayout = ({ children, searchBar, actions, showingText }) => {
  return (
    <div className="bg-surface rounded-lg border border-main overflow-hidden">
      {/* Top Bar - Search and Actions */}
      <div className="bg-surface px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-main">
        {/* Left - Search Bar */}
        <div className="flex-1 max-w-md">
          {searchBar}
        </div>

        {/* Right - Action Buttons */}
        <div className="flex items-center gap-3">
          {actions}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {children}
      </div>

      {/* Bottom Bar - Showing text */}
      {showingText && (
        <div className="bg-surface px-6 py-3 border-t border-main">
          <p className="text-sm text-muted">{showingText}</p>
        </div>
      )}
    </div>
  );
};

export default TableLayout;