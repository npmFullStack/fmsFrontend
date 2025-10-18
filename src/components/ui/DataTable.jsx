// components/ui/DataTable.jsx
import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import LoadingSkeleton from './LoadingSkeleton';

const DataTable = ({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data found.',
  onRowClick,
  className = '',
}) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <LoadingSkeleton type="table" rows={5} columns={columns.length} />;
  }

  return (
    <div className={clsx('w-full overflow-x-auto', className)}>
      <table className="table table-lg w-full">
        <thead className="bg-base-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={clsx(
                    'font-bold text-sm uppercase tracking-wide',
                    header.column.columnDef.meta?.headerClassName
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                className="text-center py-8 text-gray-500"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-lg font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={clsx(
                  'border-b border-base-200 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-base-200'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={clsx(
                      'py-3',
                      cell.column.columnDef.meta?.cellClassName
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

export default DataTable;