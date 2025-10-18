import React from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

const SharedModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = "md",
  closeOnOverlayClick = true 
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8"> {/* Changed to items-start and added pt-8 */}
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className={clsx(
        "relative bg-base-100 rounded-lg shadow-xl w-full mx-4 mt-4", // Added mt-4
        sizeClasses[size]
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300"> {/* Reduced padding from p-6 to p-4 */}
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4"> {/* Reduced padding from p-6 to p-4 */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default SharedModal;