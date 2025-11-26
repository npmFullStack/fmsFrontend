import React from 'react';
import SharedModal from '../ui/SharedModal';
import { AlertTriangle, Loader2, UserCheck, UserX } from 'lucide-react';

const DeleteUser = ({ 
    isOpen,
    onClose,
    onDelete,
    user,
    isLoading = false,
    isRestore = false // Add this prop
}) => {
    const displayName = user ? `${user.first_name} ${user.last_name}` : '';

    const handleAction = () => {
        onDelete();
    };

    return (
        <SharedModal
            isOpen={isOpen}
            onClose={onClose}
            title={isRestore ? "Unrestrict User" : "Restrict User"}
            size="sm"
        >
            <div className="flex flex-col items-center text-center py-2">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    isRestore 
                        ? 'bg-green-500 bg-opacity-20' 
                        : 'bg-orange-500 bg-opacity-20'
                }`}>
                    {isRestore ? (
                        <UserCheck className="w-8 h-8 text-green-500" />
                    ) : (
                        <UserX className="w-8 h-8 text-orange-500" />
                    )}
                </div>

                {/* Message */}
                <div className="text-content mb-6">
                    <p className="text-base">
                        {isRestore 
                            ? `Are you sure you want to unrestrict `
                            : `Are you sure you want to restrict `
                        }
                        <span className={`font-semibold ${
                            isRestore ? 'text-green-400' : 'text-orange-400'
                        }`}>
                            "{displayName}"
                        </span>?
                    </p>
                    <p className="text-sm text-muted mt-2">
                        {isRestore 
                            ? "Unrestricted users will be able to access the system again."
                            : "Restricted users will not be able to access the system."
                        }
                    </p>
                    {user?.email && (
                        <p className="text-sm text-muted mt-1">
                            Email: <span className="font-medium">{user.email}</span>
                        </p>
                    )}
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
                        onClick={handleAction}
                        className={`${isRestore ? 'modal-btn-success' : 'modal-btn-warning'} ${isLoading ? 'modal-btn-disabled' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isRestore ? 'Unrestricting...' : 'Restricting...'}
                            </>
                        ) : (
                            isRestore ? 'Unrestrict' : 'Restrict'
                        )}
                    </button>
                </div>
            </div>
        </SharedModal>
    );
};

export default DeleteUser;