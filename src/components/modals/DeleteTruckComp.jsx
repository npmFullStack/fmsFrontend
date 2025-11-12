import React from 'react';
import SharedModal from '../ui/SharedModal';
import { AlertTriangle, Loader2 } from 'lucide-react';

const DeleteTruckComp = ({ isOpen, onClose, onDelete, truckComp, truckComps, isLoading = false }) => {
  if (!truckComp && !truckComps) return null;

  const isBulk = truckComps && truckComps.length > 0;
  const displayName = isBulk ? `${truckComps.length} truck companies` : truckComp?.name;

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title={isBulk ? 'Delete Truck Companies' : 'Delete Truck Company'} size="sm">
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <p className="mb-4">
          Are you sure you want to delete <span className="font-semibold text-red-400">{isBulk ? displayName : `"${displayName}"`}</span>?
          <br />
          <small className="text-muted">This action cannot be undone.</small>
        </p>

        <div className="flex justify-end gap-3 w-full pt-2">
          <button type="button" onClick={onClose} className="modal-btn-cancel" disabled={isLoading}>Cancel</button>
          <button type="button" onClick={onDelete} className="modal-btn-danger" disabled={isLoading}>
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : 'Delete'}
          </button>
        </div>
      </div>
    </SharedModal>
  );
};

export default DeleteTruckComp;
