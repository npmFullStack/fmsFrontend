import React from 'react';

const PageHeader = ({ 
  title, 
  subtitle,
  className = "" 
}) => {
  return (
    <div className={`${className}`}>
      <div>
        <h1 className="text-4xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="mt-3 text-lg text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;