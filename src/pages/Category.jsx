import React, { useState, useCallback, useMemo } from 'react';
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
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');

  const queryClient = useQueryClient();

  // Fetch categories WITHOUT sorting parameters (we'll sort locally)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories', debouncedSearch, page], // Remove sort/direction from queryKey
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
      
      // Handle string comparison
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

  // Client-side sort handler (no API call)
  const handleSortChange = useCallback((field, dir) => {
    setSort(field);
    setDirection(dir);
    // Don't setPage(1) and don't trigger API call
  }, []);

  // Rest of your mutations remain the same...
  const addMutation = useMutation({
    mutationFn: (categoryData) => api.post('/categories', categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category added successfully');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
      setEditingCategory(null);
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    },
  });

  const handleSave = useCallback((categoryData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: categoryData });
    } else {
      addMutation.mutate(categoryData);
    }
  }, [editingCategory, addMutation, updateMutation]);

  const handleDelete = useCallback((id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleEdit = useCallback((category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  }, []);

  // Only show loading on initial load
  if (isLoading && !data) {
    return <LoadingSkeleton type="table" rows={5} columns={3} />; // 3 columns now (no actions)
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        Failed to load categories. Please try again.
      </div>
    );
  }

  return (
    <div className="page-container p-4">
      {/* Header */}
      <div className="page-header mb-6">
        <h1 className="page-title text-2xl font-bold">Category Management</h1>
        <div className="header-actions flex items-center gap-4 mt-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
            placeholder="Search categories..."
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Table - No loading prop needed since we handle loading above */}
      <div className="bg-base-100 rounded-lg shadow">
        <CategoryTable
          data={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          sortField={sort}
          sortDirection={direction}
          onSortChange={handleSortChange}
          isLoading={false} // No loading for client-side sorting
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