import React from 'react';
import SharedModal from '../ui/SharedModal';
import { AlertTriangle, Loader2 } from 'lucide-react';

const DeletePort = ({ 
  isOpen, 
  onClose, 
  onDelete, 
  port,
  ports,
  isLoading = false 
}) => {
  // Check if we have either single or bulk delete
  if (!port && !ports) return null;

  const isBulk = ports && ports.length > 0;
  const displayName = isBulk 
    ? `${ports.length} ports` 
    : port?.name;

  const handleDelete = () => {
    onDelete(); 
  };

  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title={isBulk ? "Delete Ports" : "Delete Port"}
      size="sm"
    >
      <div className="flex flex-col items-center text-center py-2">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        {/* Message */}
        <div className="text-content mb-6">
          <p className="text-base">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-red-400">
              {isBulk ? displayName : `"${displayName}"`}
            </span>?
          </p>
          <p className="text-sm text-muted mt-2">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 w-full pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`modal-btn-cancel ${isLoading ? 'modal-btn-disabled' : ''}`}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className={`modal-btn-danger  ${isLoading ? 'modal-btn-disabled' : ''}`}
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

export default DeletePort;