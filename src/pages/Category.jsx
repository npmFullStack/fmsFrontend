// src/pages/Category.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCategory } from '../hooks/useCategory';
import { useOptimizedApi } from '../hooks/useOptimizedApi';
import TableLayout from '../components/layout/TableLayout';
import CategoryTable from '../components/tables/CategoryTable';
import AddCategory from '../components/modals/AddCategory';
import DeleteCategory from '../components/modals/DeleteCategory';
import UpdateCategory from '../components/modals/UpdateCategory';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const Category = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deletingCategories, setDeletingCategories] = useState([]);
  const [updatingCategory, setUpdatingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');
  const [forceRefresh, setForceRefresh] = useState(0);

  // Optimized API hook
  const { optimizedRequest, cancelRequest, clearCache } = useOptimizedApi();

  // useCategory hook handles everything
  const {
    categoriesQuery,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkDeleteCategories,
  } = useCategory();

  // Optimized categories query
  const { data, isLoading, isError, refetch } = categoriesQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort,
    direction,
    _refresh: forceRefresh // Add refresh trigger
  });

  // Client-side sorting (fallback if server-side sorting isn't working)
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

  // Refresh data function
  const handleRefresh = useCallback(() => {
    clearCache('categories'); // Clear cache for fresh data
    setForceRefresh(prev => prev + 1);
    toast.success('Data refreshed');
  }, [clearCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest('categories');
    };
  }, [cancelRequest]);

  /* =========================
   * CRUD ACTIONS
   * ========================= */
  const handleAdd = useCallback(async (categoryData) => {
    try {
      await createCategory.mutateAsync(categoryData);
      
      // Clear cache after successful creation
      clearCache('categories');
      toast.success('Category added successfully');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Add category error:', error);
      toast.error(error.response?.data?.message || 'Failed to add category');
    }
  }, [createCategory, clearCache]);

  const handleUpdate = useCallback(async (id, categoryData) => {
    try {
      await updateCategory.mutateAsync({
        id, 
        ...categoryData 
      });
      
      // Clear cache after successful update
      clearCache('categories');
      toast.success('Category updated successfully');
      setIsUpdateModalOpen(false);
      setUpdatingCategory(null);
    } catch (error) {
      console.error('Update category error:', error);
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  }, [updateCategory, clearCache]);

  const handleDelete = useCallback(() => {
    if (deletingCategories.length > 0) {
      const ids = deletingCategories.map((category) => category.id);
      bulkDeleteCategories.mutate(ids, {
        onSuccess: (res) => {
          clearCache('categories');
          toast.success(res?.message || 'Categories deleted successfully');
          setIsDeleteModalOpen(false);
          setDeletingCategory(null);
          setDeletingCategories([]);
        },
        onError: (error) => {
          console.error('Bulk delete error:', error);
          toast.error(error.response?.data?.message || 'Failed to delete categories');
        },
      });
    } else if (deletingCategory) {
      deleteCategory.mutate(deletingCategory.id, {
        onSuccess: () => {
          clearCache('categories');
          toast.success('Category deleted successfully');
          setIsDeleteModalOpen(false);
          setDeletingCategory(null);
          setDeletingCategories([]);
        },
        onError: (error) => {
          console.error('Delete category error:', error);
          toast.error(error.response?.data?.message || 'Failed to delete category');
        },
      });
    } else {
      setIsDeleteModalOpen(false);
      setDeletingCategory(null);
      setDeletingCategories([]);
    }
  }, [deleteCategory, bulkDeleteCategories, deletingCategory, deletingCategories, clearCache]);

  const handleEditClick = useCallback((category) => {
    setUpdatingCategory(category);
    setIsUpdateModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((categoryOrCategories) => {
    if (Array.isArray(categoryOrCategories)) {
      setDeletingCategories(categoryOrCategories);
      setDeletingCategory(null);
    } else {
      setDeletingCategory(categoryOrCategories);
      setDeletingCategories([]);
    }
    setIsDeleteModalOpen(true);
  }, []);

  /* =========================
   * STATES
   * ========================= */
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
        <div className="page-error-content">
          <p>Failed to load categories. Please try again.</p>
          <button 
            onClick={handleRefresh}
            className="page-btn-primary mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* =========================
   * UI
   * ========================= */
  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">Category Management</h1>
            <p className="page-subtitle">Manage your categories and their base rates</p>
          </div>
          <button
            onClick={handleRefresh}
            className="page-btn-secondary flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="page-table-section">
        <TableLayout
          searchBar={
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Search categories"
            />
          }
          actions={
            <div className="page-actions">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="page-btn-primary"
                disabled={createCategory.isPending}
              >
                <Plus className="page-btn-icon" />
                Add Category
              </button>
            </div>
          }
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

      {/* Modals */}
      <AddCategory
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
        isLoading={createCategory.isPending}
      />

      <UpdateCategory
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdatingCategory(null);
        }}
        onUpdate={handleUpdate}
        category={updatingCategory}
        isLoading={updateCategory.isPending}
      />

      <DeleteCategory
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingCategory(null);
          setDeletingCategories([]);
        }}
        onDelete={handleDelete}
        category={deletingCategory}
        categories={deletingCategories}
        isLoading={deleteCategory.isPending || bulkDeleteCategories.isPending}
      />
    </div>
  );
};

export default Category;