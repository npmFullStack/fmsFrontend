import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from '../ui/DataTable';
import BulkActionBar from '../ui/BulkActionBar';
import DeletePort from '../modals/DeletePort';
import { ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const PortTable = ({
  data = [],
  onEdit,
  onDelete,
  onSortChange,
  sortField = 'id',
  sortDirection = 'asc',
  isLoading = false,
}) => {
  const [selected, setSelected] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingPorts, setDeletingPorts] = useState([]);

  useEffect(() => setSelected([]), [data]);

  const allSelected = selected.length === data.length && data.length > 0;

  const toggleSelect = useCallback((id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected(allSelected ? [] : data.map((item) => item.id));
  }, [allSelected, data]);

  const handleBulkDelete = useCallback(() => {
    if (!selected.length) return;
    const portsToDelete = data.filter(item => selected.includes(item.id));
    setDeletingPorts(portsToDelete);
    setDeleteModalOpen(true);
  }, [selected, data]);

  const handleConfirmDelete = useCallback(async () => {
    try {
      onDelete(deletingPorts);
      setDeleteModalOpen(false);
      setDeletingPorts([]);
    } catch (err) {
      toast.error(err.message || 'Failed to delete ports');
    }
  }, [deletingPorts, onDelete]);

  const handleBulkEdit = useCallback(() => {
    if (selected.length === 1) {
      const portToEdit = data.find(item => item.id === selected[0]);
      if (portToEdit && onEdit) {
        onEdit(portToEdit);
      }
    } else {
      toast.error("Please select only one port to edit");
    }
  }, [selected, data, onEdit]);

  const handleBulkCancel = useCallback(() => setSelected([]), []);

  const handleSort = useCallback((field) => {
    if (!onSortChange) return;
    const newDirection =
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newDirection);
  }, [sortField, sortDirection, onSortChange]);

  const getSortIcon = useCallback(
    (field) => {
      const baseClass = "table-sort-icon";
      if (sortField !== field) {
        return <ChevronUp className={`${baseClass} table-sort-inactive`} />;
      }
      return sortDirection === 'asc' 
        ? <ChevronUp className={`${baseClass} table-sort-active`} /> 
        : <ChevronDown className={`${baseClass} table-sort-active`} />;
    },
    [sortField, sortDirection]
  );

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              className="table-checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              className="table-checkbox"
              checked={selected.includes(row.original.id)}
              onChange={() => toggleSelect(row.original.id)}
            />
          </div>
        ),
        meta: { headerClassName: 'w-12', cellClassName: 'w-12' },
      },
      {
        accessorKey: 'id',
        header: () => (
          <button
            onClick={() => handleSort('id')}
            className="table-header-button"
          >
            ID {getSortIcon('id')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="table-cell-monospace table-cell-content">{getValue()}</span>
        ),
        meta: { cellClassName: 'table-cell-center' },
      },
      {
        accessorKey: 'route_name',
        header: () => (
          <button
            onClick={() => handleSort('route_name')}
            className="table-header-button"
          >
            ROUTE NAME {getSortIcon('route_name')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="table-cell-heading">{getValue()}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: () => (
          <button
            onClick={() => handleSort('name')}
            className="table-header-button"
          >
            PORT NAME {getSortIcon('name')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="table-cell-content">{getValue()}</span>
        ),
      },
      {
        accessorKey: 'address',
        header: () => (
          <button
            onClick={() => handleSort('address')}
            className="table-header-button"
          >
            ADDRESS {getSortIcon('address')}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="table-cell-content">{getValue() || 'N/A'}</span>
        ),
      },
    ],
    [selected, allSelected, sortField, sortDirection, toggleSelectAll, toggleSelect, handleSort, getSortIcon]
  );

  return (
    <div className="table-container">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage="No ports found. Add your first port above."
      />

      <DeletePort
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingPorts([]);
        }}
        onDelete={handleConfirmDelete}
        port={deletingPorts.length === 1 ? deletingPorts[0] : null}
        ports={deletingPorts.length > 1 ? deletingPorts : null}
        isLoading={false}
      />

      <BulkActionBar
        selectedCount={selected.length}
        onEdit={handleBulkEdit}
        onDelete={handleBulkDelete}
        onCancel={handleBulkCancel}
        disableEdit={selected.length !== 1}
      />
    </div>
  );
};

export default PortTable;