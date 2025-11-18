import React from 'react';
import SharedModal from '../ui/SharedModal';
import { Shield, Loader2 } from 'lucide-react';

const PromoteUser = ({ 
    isOpen,
    onClose,
    onPromote,
    user,
    isLoading = false
}) => {
    if (!user) return null;

    const handlePromote = () => {
        onPromote();
    };

    const fullName = `${user.first_name} ${user.last_name}`;

    return (
        <SharedModal
            isOpen={isOpen}
            onClose={onClose}
            title="Promote User to Admin"
            size="sm"
        >
            <div className="flex flex-col items-center text-center py-2">
                {/* Icon */}
                <div className="w-16 h-16 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-blue-500" />
                </div>

                {/* Message */}
                <div className="text-content mb-6">
                    <p className="text-base">
                        Are you sure you want to promote{' '}
                        <span className="font-semibold text-blue-600">
                            {fullName}
                        </span>{' '}
                        to Admin?
                    </p>
                    <p className="text-sm text-muted mt-2">
                        This user will gain admin privileges and access to admin features.
                    </p>
                    <p className="text-sm text-muted mt-1">
                        Email: <span className="font-medium">{user.email}</span>
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
                        onClick={handlePromote}
                        className={`modal-btn-primary ${isLoading ? 'modal-btn-disabled' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Promoting...
                            </>
                        ) : (
                            'Promote to Admin'
                        )}
                    </button>
                </div>
            </div>
        </SharedModal>
    );
};

export default PromoteUser;