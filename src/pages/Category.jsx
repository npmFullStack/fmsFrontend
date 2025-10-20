// pages/Category.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Plus, Filter } from 'lucide-react';
import api from '../api';
import TableLayout from '../components/layout/TableLayout';
import CategoryTable from '../components/tables/CategoryTable';
import AddCategory from '../components/modals/AddCategory';
import DeleteCategory from '../components/modals/DeleteCategory';
import UpdateCategory from '../components/modals/UpdateCategory';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';

const Category = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [updatingCategory, setUpdatingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');

  const queryClient = useQueryClient();

  // Fetch categories
  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories', debouncedSearch, page],
    queryFn: async () => {
      const res = await api.get('/categories', {
        params: { search: debouncedSearch, page, per_page: 10 },
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
  });

  // Client-side sorting
  const sortedCategories = useMemo(() => {
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

  const categories = sortedCategories;
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
    mutationFn: async (categoryData) => (await api.post('/categories', categoryData)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category added successfully');
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, categoryData }) =>
      (await api.put(`/categories/${id}`, categoryData)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
      setIsUpdateModalOpen(false);
      setUpdatingCategory(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (category) => (await api.delete(`/categories/${category.id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingCategory(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (categoryIds) =>
      (await api.post('/categories/bulk-delete', { ids: categoryIds })).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(data.message || 'Categories deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete categories');
    },
  });

  // Handlers
  const handleAdd = useCallback(
    (categoryData) => addMutation.mutate(categoryData),
    [addMutation],
  );

  const handleUpdate = useCallback(
    (id, categoryData) => updateMutation.mutate({ id, categoryData }),
    [updateMutation],
  );

  const handleEditClick = useCallback((category) => {
    setUpdatingCategory(category);
    setIsUpdateModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback(
    (categoryOrCategories) => {
      if (Array.isArray(categoryOrCategories)) {
        const categoryIds = categoryOrCategories.map((cat) => cat.id);
        bulkDeleteMutation.mutate(categoryIds);
      } else {
        setDeletingCategory(categoryOrCategories);
        setIsDeleteModalOpen(true);
      }
    },
    [bulkDeleteMutation],
  );

  const handleDelete = useCallback(() => {
    if (deletingCategory) {
      deleteMutation.mutate(deletingCategory);
    }
  }, [deleteMutation, deletingCategory]);

  // Loading & error states
  if (isLoading && !data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 text-red-800 px-6 py-4 rounded-lg">
          Failed to load categories. Please try again.
        </div>
      </div>
    );
  }

  const showingText = `Showing ${pagination.from}-${pagination.to} of ${pagination.total}`;

  return (
    <div className="space-y-4">
      <TableLayout
        searchBar={
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
            placeholder="Search"
          />
        }
        actions={
          <>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </>
        }
        showingText={showingText}
      >
        <CategoryTable
          data={categories}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          sortField={sort}
          sortDirection={direction}
          onSortChange={handleSortChange}
          isLoading={isLoading}
        />
      </TableLayout>

      {pagination.last_page > 1 && (
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.last_page}
          onPageChange={setPage}
        />
      )}

      <AddCategory
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
        isLoading={addMutation.isPending}
      />

      <UpdateCategory
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdatingCategory(null);
        }}
        onUpdate={handleUpdate}
        category={updatingCategory}
        isLoading={updateMutation.isPending}
      />

      <DeleteCategory
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingCategory(null);
        }}
        onDelete={handleDelete}
        category={deletingCategory}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Category;