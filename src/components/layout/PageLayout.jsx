import React from 'react';

const PageLayout = ({ 
  title, 
  subtitle, 
  children, 
  actions,
  className = '' 
}) => {
  return (
    <div className={`page-container p-6 ${className}`}>
      {/* Header */}
      <div className="page-header">
        <div className="flex-1">
          <h1 className="page-title text-2xl font-bold">{title}</h1>
          {subtitle && (
            <p className="page-subtitle mt-2">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="header-actions">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;