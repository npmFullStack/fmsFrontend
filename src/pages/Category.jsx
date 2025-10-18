// pages/Category.jsx
import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Plus } from 'lucide-react';
import api from '../api';
import CategoryTable from '../components/tables/CategoryTable';
import AddCategory from '../components/modals/AddCategory';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

const Category = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');

  const queryClient = useQueryClient();

  // Fetch categories
  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories', debouncedSearch, page, sort, direction],
    queryFn: async () => {
      const res = await api.get('/categories', {
        params: { search: debouncedSearch, page, sort, direction, per_page: 10 },
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const categories = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
  };

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (categoryData) => api.post('/categories', categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category added successfully');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add category');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category updated successfully');
      setEditingCategory(null);
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update category');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    },
  });

  // Handlers
  const handleSave = useCallback((categoryData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: categoryData });
    } else {
      addMutation.mutate(categoryData);
    }
  }, [editingCategory, addMutation, updateMutation]);

  const handleDelete = useCallback((id) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const handleEdit = useCallback((category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  }, []);

  const handleSortChange = useCallback((field, dir) => {
    setSort(field);
    setDirection(dir);
    setPage(1);
  }, []);

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton type="table" rows={5} columns={4} />;
  }

  // Error state
  if (isError) {
    return (
      <div className="error-container">
        Failed to load categories.
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Category Management</h1>
        <div className="header-actions">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
            placeholder="Search categories..."
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Table */}
      <CategoryTable
        data={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        sortField={sort}
        sortDirection={direction}
        onSortChange={handleSortChange}
      />

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.last_page}
          onPageChange={setPage}
        />
      )}

      {/* Modal */}
      <AddCategory
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSave}
        editingCategory={editingCategory}
        isLoading={addMutation.isLoading || updateMutation.isLoading}
      />
    </div>
  );
};

export default Category;