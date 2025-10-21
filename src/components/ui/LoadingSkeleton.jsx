// src/components/ui/LoadingSkeleton.jsx
import React from 'react';
import clsx from 'clsx';

const LoadingSkeleton = ({ 
  type = "generic", 
  rows = 3, 
  columns = 4, 
  className = "" 
}) => {
  const renderClaudeSkeleton = () => (
    <div className={clsx("p-6 space-y-4 animate-pulse", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-3">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 w-64 rounded-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 w-48 rounded-full"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 bg-gray-300 dark:bg-gray-700 w-32 rounded-lg"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 w-32 rounded-lg"></div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {Array(columns).fill(0).map((_, i) => (
          <div key={i} className="col-span-3">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {Array(rows).fill(0).map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-4">
            {Array(columns).fill(0).map((_, j) => (
              <div key={j} className="col-span-3">
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 w-24 rounded-lg"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 w-32 rounded-full"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 w-24 rounded-lg"></div>
      </div>
    </div>
  );

  const renderGenericSkeleton = () => (
    <div className={clsx("flex flex-col items-center justify-center min-h-[400px] bg-base-100 px-4 animate-pulse", className)}>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="h-12 bg-gray-300 dark:bg-gray-700 w-48 rounded-full mx-auto"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 w-64 rounded-full mx-auto"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 w-56 rounded-full mx-auto"></div>
        </div>
        <div className="flex justify-center gap-4 mt-6">
          <div className="h-10 bg-gray-300 dark:bg-gray-700 w-28 rounded-lg"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 w-28 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  const renderHomeSkeleton = () => (
    <div className={clsx("hero min-h-screen bg-base-100 animate-pulse", className)}>
      <div className="hero-content text-center">
        <div className="max-w-md w-full space-y-6">
          <div className="h-16 bg-gray-300 dark:bg-gray-700 w-20 rounded-2xl mx-auto"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 w-full rounded-full"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 w-5/6 rounded-full mx-auto"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 w-4/6 rounded-full mx-auto"></div>
          </div>
          <div className="h-12 bg-gray-300 dark:bg-gray-700 w-40 rounded-xl mx-auto mt-6"></div>
        </div>
      </div>
    </div>
  );

  switch (type) {
    case "table":
      return renderClaudeSkeleton();
    case "home":
      return renderHomeSkeleton();
    case "generic":
    default:
      return renderGenericSkeleton();
  }
};

export default LoadingSkeleton;