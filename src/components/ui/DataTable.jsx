import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { BarChart3 } from 'lucide-react';
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
    <div className={clsx('w-full overflow-x-auto rounded-lg', className)}>
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-700 text-gray-400">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className={clsx(
                    'px-6 py-4 font-medium tracking-wider',
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
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-12 text-gray-400"
              >
                <div className="flex flex-col items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-gray-600 mb-3" />
                  <p className="text-base font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={clsx(
                  'hover:bg-gray-750 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={clsx(
                      'px-6 py-4 text-gray-300',
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