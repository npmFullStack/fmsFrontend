// src/components/ui/SharedTable.jsx
import React from 'react';
import clsx from 'clsx';
import LoadingSkeleton from './LoadingSkeleton';

const SharedTable = ({ 
  columns, 
  data, 
  isLoading = false,
  emptyMessage = "No data found.",
  className = "",
  tableClassName = "",
  zebra = true,
  compact = false
}) => {
  if (isLoading) {
    return <LoadingSkeleton type="table" rows={5} columns={columns.length} />;
  }

  return (
    <div className={clsx("overflow-x-auto border rounded-lg shadow-sm", className)}>
      <table className={clsx(
        "table w-full",
        {
          "table-zebra": zebra,
          "table-compact": compact
        },
        tableClassName
      )}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className={column.headerClassName}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className={row.rowClassName}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={column.cellClassName}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SharedTable;