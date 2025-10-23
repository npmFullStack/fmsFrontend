import React from 'react';
import SharedModal from '../ui/SharedModal';
import { Loader2, Trash2 } from 'lucide-react';

const DeleteItem = ({
  isOpen,
  onClose,
  onDelete,
  item = null,
  items = null,
  isLoading = false,
}) => {
  const isBulk = Array.isArray(items) && items.length > 1;
  const totalCount = isBulk ? items.length : item ? 1 : 0;

  const handleConfirm = () => {
    if (isLoading) return;
    onDelete();
  };

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title="Delete Item" size="sm">
      <div className="space-y-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 text-red-500">
            <Trash2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold mt-3 text-gray-800">
            {isBulk
              ? `Delete ${totalCount} items?`
              : `Delete item "${item?.name}"?`}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isBulk
              ? 'This will permanently delete the selected items.'
              : 'This action cannot be undone.'}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-3">
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
            onClick={handleConfirm}
            className={`modal-btn-danger ${isLoading ? 'modal-btn-disabled' : ''}`}
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

export default DeleteItem;