import React from 'react';

const TableLayout = ({ children, searchBar, actions, showingText }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Top Bar - Search and Actions */}
      <div className="bg-gray-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-700">
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
        <div className="bg-gray-900 px-6 py-3 border-t border-gray-700">
          <p className="text-sm text-gray-400">{showingText}</p>
        </div>
      )}
    </div>
  );
};

export default TableLayout;