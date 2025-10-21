// src/components/ui/SharedModal.jsx
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
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-70"
                onClick={closeOnOverlayClick ? onClose : undefined}
            />

            {/* Modal */}
            <div className={clsx('relative bg-surface rounded-xl shadow-2xl w-full mx-auto', sizeClasses[size])}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-main">
                    <h3 className="text-xl font-semibold text-heading">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="text-muted hover:text-content transition-colors p-1 hover-surface rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

export default SharedModal;