import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Plus, Filter } from 'lucide-react';
import api from '../api';
import TableLayout from '../components/layout/TableLayout';
import ItemTable from '../components/tables/ItemTable';
import AddItem from '../components/modals/AddItem';
import UpdateItem from '../components/modals/UpdateItem';
import DeleteItem from '../components/modals/DeleteItem';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';

const Item = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deletingItems, setDeletingItems] = useState(null);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');

  const queryClient = useQueryClient();

  // Fetch items
  const { data, isLoading, isError } = useQuery({
    queryKey: ['items', debouncedSearch, page],
    queryFn: async () => {
      const res = await api.get('/items', {
        params: { search: debouncedSearch, page, per_page: 10 },
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
  });

  // Fetch categories for react-select
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const res = await api.get('/categories', { params: { per_page: 9999 } });
      return res.data?.data || [];
    },
  });

  // Client-side sorting
  const sortedItems = useMemo(() => {
    if (!data?.data) return [];
    return [...data.data].sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      return direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [data?.data, sort, direction]);

  const items = sortedItems;
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    from: data?.from || 0,
    to: data?.to || 0,
    total: data?.total || 0,
  };

  const handleSortChange = useCallback((field, dir) => {
    setSort(field);
    setDirection(dir);
  }, []);

  // Mutations
  const addMutation = useMutation({
    mutationFn: async (itemData) => (await api.post('/items', itemData)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item added successfully');
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add item');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, itemData }) => (await api.put(`/items/${id}`, itemData)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item updated successfully');
      setIsUpdateModalOpen(false);
      setUpdatingItem(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update item');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (item) => (await api.delete(`/items/${item.id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
      setDeletingItems(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (itemIds) => (await api.post('/items/bulk-delete', { ids: itemIds })).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success(data.message || 'Items deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
      setDeletingItems(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete items');
    },
  });

  // Handlers
  const handleAdd = useCallback((itemData) => addMutation.mutate(itemData), [addMutation]);

  const handleUpdate = useCallback(
    (id, itemData) => updateMutation.mutate({ id, itemData }),
    [updateMutation],
  );

  const handleEditClick = useCallback((item) => {
    setUpdatingItem(item);
    setIsUpdateModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((itemOrItems) => {
    if (Array.isArray(itemOrItems)) {
      setDeletingItems(itemOrItems);
      setDeletingItem(null);
      setIsDeleteModalOpen(true);
    } else {
      setDeletingItem(itemOrItems);
      setDeletingItems(null);
      setIsDeleteModalOpen(true);
    }
  }, []);

  const handleDelete = useCallback(() => {
    if (deletingItems) {
      const itemIds = deletingItems.map((i) => i.id);
      bulkDeleteMutation.mutate(itemIds);
    } else if (deletingItem) {
      deleteMutation.mutate(deletingItem);
    }
  }, [deleteMutation, bulkDeleteMutation, deletingItem, deletingItems]);

  if (isLoading && !data) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-error">
        <div className="page-error-content">Failed to load items. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Item Management</h1>
        <p className="page-subtitle">Manage your inventory items and pricing by weight</p>
      </div>

      <div className="page-table-section">
        <TableLayout
          searchBar={
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search items"
            />
          }
          actions={
            <div className="page-actions">
              <button onClick={() => setIsAddModalOpen(true)} className="page-btn-primary">
                <Plus className="page-btn-icon" />
                Add Item
              </button>
              <button className="page-btn-secondary">
                <Filter className="page-btn-icon" />
                Filter
              </button>
            </div>
          }
        >
          <ItemTable
            data={items}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            sortField={sort}
            sortDirection={direction}
            onSortChange={handleSortChange}
            isLoading={isLoading}
          />
        </TableLayout>
      </div>

      {pagination.last_page > 1 && (
        <div className="page-pagination">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            onPageChange={setPage}
          />
        </div>
      )}

      <AddItem
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
        categories={categoriesData}
        isLoading={addMutation.isPending}
      />

      <UpdateItem
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdatingItem(null);
        }}
        onUpdate={handleUpdate}
        item={updatingItem}
        categories={categoriesData}
        isLoading={updateMutation.isPending}
      />

      <DeleteItem
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingItem(null);
          setDeletingItems(null);
        }}
        onDelete={handleDelete}
        item={deletingItem}
        items={deletingItems}
        isLoading={deleteMutation.isPending || bulkDeleteMutation.isPending}
      />
    </div>
  );
};

export default Item;
