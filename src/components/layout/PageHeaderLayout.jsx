// src/components/layout/PageHeaderLayout.jsx
import React from 'react';

const PageHeader = ({ 
  title, 
  subtitle,
  className = "" 
}) => {
  return (
    <div className={`${className}`}>
      <div>
        <h1 className="text-4xl font-bold text-heading">{title}</h1>
        {subtitle && (
          <p className="mt-3 text-lg text-muted">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;