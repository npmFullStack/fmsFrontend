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
        <div className="modal-overlay">
            {/* Overlay */}
            <div
                className="modal-backdrop"
                onClick={closeOnOverlayClick ? onClose : undefined}
            />

            {/* Modal */}
            <div className={clsx('modal-container', sizeClasses[size])}>
                {/* Header */}
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="modal-close-btn"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="modal-content">{children}</div>
            </div>
        </div>
    );
};

export default SharedModal;