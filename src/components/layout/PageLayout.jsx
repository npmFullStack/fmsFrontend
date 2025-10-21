// src/components/layout/PageLayout.jsx
import React from 'react';

const PageLayout = ({
  title,
  subtitle,
  children,
  actions,
  className = '',
}) => {
  return (
    <div className={`p-6 bg-surface rounded-2xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 border-b border-main pb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="mt-4 md:mt-0 flex gap-2">
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