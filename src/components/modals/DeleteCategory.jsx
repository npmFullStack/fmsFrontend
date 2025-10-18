import React from 'react';
import { AlertTriangle } from 'lucide-react';
import SharedModal from '../ui/SharedModal';

const DeleteCategory = ({ 
  isOpen, 
  onClose, 
  onDelete, 
  category,
  isLoading = false 
}) => {
  if (!category) return null;

  const handleDelete = () => {
    onDelete(category.id);
  };

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Category"
      size="sm"
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="w-12 h-12 text-warning" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
          <p className="text-base-content/70">
            Are you sure you want to delete the category 
            <span className="font-semibold text-base-content"> "{category.name}"</span>?
          </p>
          <p className="text-sm text-warning mt-2">
            This action cannot be undone.
          </p>
        </div>

        <div className="modal-action mt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-error"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </SharedModal>
  );
};

export default DeleteCategory;