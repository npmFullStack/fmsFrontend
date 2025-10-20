// components/modals/DeleteCategory.jsx
import React from 'react';
import SharedModal from '../ui/SharedModal';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

const DeleteCategory = ({ 
  isOpen, 
  onClose, 
  onDelete, 
  category,
  isLoading = false 
}) => {
  // Simple check - if no category, don't render
  if (!category) return null;

  const handleDelete = () => {
    onDelete(); 
  };

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Category"
      size="sm"
    >
      <div className="flex flex-col items-center text-center p-2">
        {/* Icon */}
        <div className="w-16 h-16 bg-error bg-opacity-20 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-error" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-base-content mb-2">
          Delete Category?
        </h2>

        {/* Message */}
        <div className="text-base-content mb-6">
          <div>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-error">"{category.name}"</span>?
            This action cannot be undone.
          </div>
        </div>

        {/* Warning Note */}
        <div className="bg-base-300 text-base-content border border-base-300 border-opacity-30 rounded-lg p-3 mb-6 w-full">
          <div className="flex items-center gap-2 text-warning-content text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            This action cannot be undone
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost flex-1 border border-base-300 gap-2"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-error flex-1 gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </SharedModal>
  );
};

export default DeleteCategory;