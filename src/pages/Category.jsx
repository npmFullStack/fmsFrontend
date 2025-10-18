import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Plus } from 'lucide-react';
import api from '../api';
import PageLayout from '../components/layout/PageLayout';
import CategoryTable from '../components/tables/CategoryTable';
import AddCategory from '../components/modals/AddCategory';
import UpdateCategory from '../components/modals/UpdateCategory';
import DeleteCategory from '../components/modals/DeleteCategory';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

const Category = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');

  const queryClient = useQueryClient();

  // Debug state changes
  useEffect(() => {
    console.log('Category state changed:', {
      isAddModalOpen,
      isUpdateModalOpen, 
      isDeleteModalOpen,
      editingCategory,
      deletingCategory
    });
  }, [isAddModalOpen, isUpdateModalOpen, isDeleteModalOpen, editingCategory, deletingCategory]);

  // Fetch categories
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories', debouncedSearch, page],
    queryFn: async () => {
      const res = await api.get('/categories', {
        params: { 
          search: debouncedSearch, 
          page, 
          per_page: 10 
        },
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
      
      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [data?.data, sort, direction]);

  const categories = sortedCategories;
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
  };

  // Client-side sort handler
  const handleSortChange = useCallback((field, dir) => {
    setSort(field);
    setDirection(dir);
  }, []);

  // Mutations
  const addMutation = useMutation({
    mutationFn: async (categoryData) => {
      console.log('Sending POST request:', categoryData);
      const response = await api.post('/categories', categoryData);
      console.log('POST Response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Add mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category added successfully');
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      console.error('Add mutation error:', error);
      toast.error(error.response?.data?.message || 'Failed to add category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      console.log('Sending PUT request:', { id, data });
      const response = await api.put(`/categories/${id}`, data);
      console.log('PUT Response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Update mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
      setIsUpdateModalOpen(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
      toast.error(error.response?.data?.message || 'Failed to update category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      console.log('Sending DELETE request for ID:', id);
      const response = await api.delete(`/categories/${id}`);
      console.log('DELETE Response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Delete mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingCategory(null);
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    },
  });

  const handleAdd = useCallback((categoryData) => {
    console.log('Handling add:', categoryData);
    addMutation.mutate(categoryData);
  }, [addMutation]);

  const handleUpdate = useCallback((id, categoryData) => {
    console.log('Handling update:', { id, categoryData });
    updateMutation.mutate({ id, data: categoryData });
  }, [updateMutation]);

  const handleDelete = useCallback((id) => {
    console.log('Handling delete for ID:', id);
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const handleEdit = useCallback((category) => {
    console.log('Edit clicked for:', category);
    setEditingCategory(category);
    setIsUpdateModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((category) => {
    console.log('Delete clicked for:', category);
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const closeUpdateModal = useCallback(() => {
    setIsUpdateModalOpen(false);
    setEditingCategory(null);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletingCategory(null);
  }, []);

  // Actions for the layout
  const pageActions = (
    <>
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        placeholder="Search categories..."
      />
      <button
        onClick={() => {
          console.log('Add category button clicked - current state:', { isAddModalOpen });
          setIsAddModalOpen(true);
        }}
        className="btn btn-primary"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Category
      </button>
    </>
  );

  // Only show loading on initial load
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
        <div className="alert alert-error">
          Failed to load categories. Please try again.
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Category Management" 
      subtitle="Manage your product categories and their base rates"
      actions={pageActions}
    >
      {/* Table */}
      <div className="bg-base-100 rounded-lg shadow">
        <CategoryTable
          data={categories}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          sortField={sort}
          sortDirection={direction}
          onSortChange={handleSortChange}
          isLoading={false}
        />
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Add Modal */}
      <AddCategory
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSave={handleAdd}
        isLoading={addMutation.isLoading}
      />

      {/* Update Modal */}
      <UpdateCategory
        isOpen={isUpdateModalOpen}
        onClose={closeUpdateModal}
        onUpdate={handleUpdate}
        category={editingCategory}
        isLoading={updateMutation.isLoading}
      />

      {/* Delete Modal */}
      <DeleteCategory
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        category={deletingCategory}
        isLoading={deleteMutation.isLoading}
      />
    </PageLayout>
  );
};

export default Category;