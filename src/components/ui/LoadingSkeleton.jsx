// src/components/ui/LoadingSkeleton.jsx
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import clsx from 'clsx';

const LoadingSkeleton = ({ 
  type = "generic", 
  rows = 3, 
  columns = 4, 
  className = "" 
}) => {
  const renderTableSkeleton = () => (
    <div className={clsx("p-4", className)}>
      <div className="overflow-x-auto border rounded-md bg-base-100 shadow-sm">
        <table className="table table-xs w-full">
          <thead>
            <tr>
              {Array(columns).fill(0).map((_, i) => (
                <th key={i}>
                  <Skeleton height={16} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array(rows).fill(0).map((_, i) => (
              <tr key={i}>
                {Array(columns).fill(0).map((_, j) => (
                  <td key={j}>
                    <Skeleton height={14} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGenericSkeleton = () => (
    <div className={clsx("flex flex-col items-center justify-center min-h-screen bg-base-100 px-4", className)}>
      <div className="w-full max-w-md space-y-4 text-center">
        <Skeleton height={40} width="60%" className="mx-auto" />
        <Skeleton count={3} height={20} />
        <div className="flex justify-center">
          <Skeleton height={36} width={120} />
        </div>
      </div>
    </div>
  );

  const renderHomeSkeleton = () => (
    <div className="hero min-h-screen bg-base-100 text-base-content">
      <div className="hero-content text-center">
        <div className="max-w-md w-full space-y-4">
          <Skeleton height={48} width={70} className="mx-auto" />
          <Skeleton count={3} height={16} />
          <div className="flex justify-center">
            <Skeleton height={40} width={140} />
          </div>
        </div>
      </div>
    </div>
  );

  switch (type) {
    case "table":
      return renderTableSkeleton();
    case "home":
      return renderHomeSkeleton();
    case "generic":
    default:
      return renderGenericSkeleton();
  }
};

export default LoadingSkeleton;