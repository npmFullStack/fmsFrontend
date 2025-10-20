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
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4',
        'px-6 py-4 w-[90%] sm:w-auto rounded-lg border shadow-2xl',
        'bg-gray-800 border-gray-700 text-gray-200 animate-slideUpBounce'
      )}
    >
      {/* Selected indicator */}
      <div className="flex items-center gap-2 text-gray-200">
        <CheckSquare className="w-5 h-5 text-blue-400" />
        <span className="text-sm font-semibold">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        <button
          onClick={onEdit}
          disabled={disableEdit}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            disableEdit
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
              : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg'
          )}
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>

        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>

        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-all"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BulkActionBar;