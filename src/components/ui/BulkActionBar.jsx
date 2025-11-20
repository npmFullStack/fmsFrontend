// src/components/ui/BulkActionBar.jsx
import React from 'react';
import { Edit, Trash2, X, CheckSquare } from 'lucide-react';
import clsx from 'clsx';

const BulkActionBar = ({
  selectedCount = 0,
  onEdit,
  onDelete,
  onCancel,
  disableEdit = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      className={clsx(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
        'flex flex-col sm:flex-row items-center justify-between gap-3',
        'px-4 py-3 sm:px-6 sm:py-4 w-[95%] sm:w-auto max-w-md sm:max-w-none rounded-xl border shadow-2xl',
        'bg-surface border-main text-content animate-slideUpBounce'
      )}
    >
      {/* Selected indicator - always visible */}
      <div className="flex items-center gap-2 text-content w-full sm:w-auto justify-center sm:justify-start">
        <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
        <span className="text-sm font-semibold whitespace-nowrap">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </span>
      </div>

      {/* Action buttons - responsive layout */}
      <div className="flex flex-wrap justify-center gap-2 w-full sm:w-auto">
        {/* Edit Button */}
        <button
          onClick={onEdit}
          disabled={disableEdit}
          className={clsx(
            'flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-none min-w-0',
            'justify-center sm:justify-start',
            disableEdit
              ? 'bg-surface text-muted cursor-not-allowed opacity-50 border border-main'
              : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg'
          )}
        >
          <Edit className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate hidden xs:inline">Edit</span>
        </button>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all flex-1 sm:flex-none min-w-0 justify-center sm:justify-start"
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate hidden xs:inline">Delete</span>
        </button>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium text-content hover-surface transition-all flex-1 sm:flex-none min-w-0 justify-center sm:justify-start"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate hidden xs:inline">Cancel</span>
        </button>
      </div>
    </div>
  );
};

export default BulkActionBar;