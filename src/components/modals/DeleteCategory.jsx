// components/modals/DeleteCategory.jsx
import React from 'react';
import SharedModal from '../ui/SharedModal';
import { AlertTriangle, Loader2 } from 'lucide-react';

const DeleteCategory = ({ 
  isOpen, 
  onClose, 
  onDelete, 
  category,
  categories, // ← NEW: for bulk delete
  isLoading = false 
}) => {
  // Check if we have either single or bulk delete
  if (!category && !categories) return null;

  const isBulk = categories && categories.length > 0;
  const displayName = isBulk 
    ? `${categories.length} categories` 
    : category?.name;

  const handleDelete = () => {
    onDelete(); 
  };

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title={isBulk ? "Delete Categories" : "Delete Category"}
      size="sm"
    >
      <div className="flex flex-col items-center text-center py-2">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        {/* Message */}
        <div className="text-gray-200 mb-6">
          <p className="text-base">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-red-400">
              {isBulk ? displayName : `"${displayName}"`}
            </span>?
          </p>
          <p className="text-sm text-gray-400 mt-2">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 w-full pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 min-w-[120px] justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </SharedModal>
  );
};

export default DeleteCategory;