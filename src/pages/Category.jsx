import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Plus } from 'lucide-react';
import api from '../api';
import PageLayout from '../components/layout/PageLayout';
import CategoryTable from '../components/tables/CategoryTable';
import AddCategory from '../components/modals/AddCategory';
import DeleteCategory from '../components/modals/DeleteCategory';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

const Category = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
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
  };

  const handleSortChange = useCallback((field, dir) => {
    setSort(field);
    setDirection(dir);
  }, []);

  // Mutations
  const addMutation = useMutation({
    mutationFn: async (categoryData) => {
      return (await api.post('/categories', categoryData)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category added successfully');
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/categories/${id}`)).data,
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

  // Handlers
  const handleAdd = useCallback((categoryData) => addMutation.mutate(categoryData), [addMutation]);

  const handleDeleteClick = useCallback((category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDelete = useCallback((id) => deleteMutation.mutate(id), [deleteMutation]);

  // Layout actions
  const pageActions = (
    <>
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        placeholder="Search categories..."
      />
      <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
        <Plus className="w-4 h-4 mr-2" />
        Add Category
      </button>
    </>
  );

  // Loading & error states
  if (isLoading && !data) {
    return (
      <PageLayout title="Category Management" subtitle="Manage your product categories">
        <LoadingSkeleton type="table" rows={5} columns={3} />
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout title="Category Management" subtitle="Manage your product categories">
        <div className="alert alert-error">Failed to load categories. Please try again.</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Category Management"
      subtitle="Manage your product categories and their base rates"
      actions={pageActions}
    >
      <div className="bg-base-100 rounded-lg shadow">
        <CategoryTable
          data={categories}
          onEdit={() => {}}
          onDelete={handleDeleteClick}
          sortField={sort}
          sortDirection={direction}
          onSortChange={handleSortChange}
          isLoading={isLoading}
        />
      </div>

      {pagination.last_page > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            onPageChange={setPage}
          />
        </div>
      )}

      <AddCategory
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
        isLoading={addMutation.isLoading}
      />

      <DeleteCategory
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
        category={deletingCategory}
        isLoading={deleteMutation.isLoading}
      />
    </PageLayout>
  );
};

export default Category;
