import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from '../ui/DataTable';
import BulkActionBar from '../ui/BulkActionBar';
import DeleteTruckComp from '../modals/DeleteTruckComp';
import { ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { toUpperCase } from '../../utils/formatters';

const TruckCompTable = ({ data = [], onEdit, onDelete, onSortChange, sortField = 'id', sortDirection = 'asc', isLoading = false }) => {
  const [selected, setSelected] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTruckComps, setDeletingTruckComps] = useState([]);

  useEffect(() => setSelected([]), [data]);

  const allSelected = selected.length === data.length && data.length > 0;

  const toggleSelect = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  const toggleSelectAll = () => setSelected(allSelected ? [] : data.map((item) => item.id));

  const handleBulkDelete = () => {
    if (!selected.length) return;
    const itemsToDelete = data.filter((item) => selected.includes(item.id));
    setDeletingTruckComps(itemsToDelete);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(deletingTruckComps);
    setDeleteModalOpen(false);
    setDeletingTruckComps([]);
  };

  const handleBulkEdit = () => {
    if (selected.length === 1) {
      const item = data.find((i) => i.id === selected[0]);
      onEdit?.(item);
    } else toast.error('Please select only one truck company to edit');
  };

  const handleSort = (field) => {
    const newDir = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange?.(field, newDir);
  };

  const getSortIcon = (field) =>
    sortField !== field ? (
      <ChevronUp className="table-sort-inactive" />
    ) : sortDirection === 'asc' ? (
      <ChevronUp className="table-sort-active" />
    ) : (
      <ChevronDown className="table-sort-active" />
    );

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <div className="flex justify-center">
            <input type="checkbox" className="table-checkbox" checked={allSelected} onChange={toggleSelectAll} />
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
      },
      {
        accessorKey: 'id',
        header: () => (
          <button onClick={() => handleSort('id')} className="table-header-button">
            ID {getSortIcon('id')}
          </button>
        ),
        cell: ({ getValue }) => <span className="table-cell-monospace">{getValue()}</span>,
      },
      {
        accessorKey: 'name',
        header: () => (
          <button onClick={() => handleSort('name')} className="table-header-button">
            NAME {getSortIcon('name')}
          </button>
        ),
        cell: ({ getValue }) => <span className="table-cell-heading">{toUpperCase(getValue())}</span>,
      },
    ],
    [selected, allSelected, sortField, sortDirection]
  );

  return (
    <div className="table-container">
      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="No truck companies found." />
      <DeleteTruckComp
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDelete={handleConfirmDelete}
        truckComps={deletingTruckComps}
      />
      <BulkActionBar
        selectedCount={selected.length}
        onEdit={handleBulkEdit}
        onDelete={handleBulkDelete}
        onCancel={() => setSelected([])}
        disableEdit={selected.length !== 1}
      />
    </div>
  );
};

export default TruckCompTable;
