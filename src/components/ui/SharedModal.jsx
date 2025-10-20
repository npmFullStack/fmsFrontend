// components/ui/SharedModal.jsx
import React from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

const SharedModal = ({ isOpen, onClose, title, children, size = 'md', closeOnOverlayClick = true }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay - fixed full screen */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={closeOnOverlayClick ? onClose : undefined}
            />

            {/* Modal */}
            <div className={clsx('relative bg-base-100 rounded-lg shadow-xl w-full mx-auto border border-base-300', sizeClasses[size])}>
                {/* Header with primary color */}
                <div className="flex items-center justify-between p-6 border-b border-base-300 bg-primary">
                    <h3 className="text-lg font-semibold text-primary-content">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="btn btn-ghost btn-sm btn-circle hover:bg-primary-focus"
                    >
                        <X className="w-5 h-5 text-primary-content" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 bg-base-100 rounded-b-lg">{children}</div>
            </div>
        </div>
    );
};

export default SharedModal;