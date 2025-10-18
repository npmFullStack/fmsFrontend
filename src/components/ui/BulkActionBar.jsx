import React from 'react';
import { Edit, Trash2, X, CheckSquare } from 'lucide-react';

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
  className="
    fixed bottom-6 left-1/2 -translate-x-1/2
    bg-base-100 border shadow-xl rounded-xl
    px-5 py-3 flex flex-col sm:flex-row
    items-center sm:items-center justify-center sm:justify-between
    gap-3 sm:gap-4
    z-50 transition-all duration-300
    animate-fadeInUp
    w-[90%] sm:w-auto
  "
>
      {/* Selected indicator */}
      <div className="flex items-center gap-2">
        <CheckSquare className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">
          {selectedCount} selected
        </span>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        <button
          onClick={onEdit}
          disabled={disableEdit}
          className="btn btn-sm btn-warning min-w-[90px]"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </button>

        <button
          onClick={onDelete}
          className="btn btn-sm btn-error min-w-[90px]"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </button>

        <button
          onClick={onCancel}
          className="btn btn-sm btn-ghost min-w-[90px]"
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BulkActionBar;
