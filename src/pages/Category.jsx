// src/pages/Category.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCategory } from '../hooks/useCategory';
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
  const [deletingCategories, setDeletingCategories] = useState(null);
  const [updatingCategory, setUpdatingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [direction, setDirection] = useState('asc');

  // ✅ useCategory hook handles everything
  const {
    categoriesQuery,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkDeleteCategories,
  } = useCategory();

  // ✅ Fetch categories (server-side pagination & search)
  const { data, isLoading, isError } = categoriesQuery({
    search: debouncedSearch,
    page,
    per_page: 10,
    sort,
    direction
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

  /* =========================
   * CRUD ACTIONS
   * ========================= */
  const handleAdd = useCallback(
    async (categoryData) => {
      try {
        await createCategory.mutateAsync(categoryData);
        toast.success('Category added successfully');
        setIsAddModalOpen(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to add category');
      }
    },
    [createCategory]
  );

  const handleUpdate = useCallback(
    async (id, categoryData) => {
      try {
        await updateCategory.mutateAsync({ id, ...categoryData });
        toast.success('Category updated successfully');
        setIsUpdateModalOpen(false);
        setUpdatingCategory(null);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update category');
      }
    },
    [updateCategory]
  );

  const handleDelete = useCallback(() => {
    if (deletingCategories) {
      const ids = deletingCategories.map((cat) => cat.id);
      bulkDeleteCategories.mutate(ids, {
        onSuccess: (res) => {
          toast.success(res?.message || 'Categories deleted successfully');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to delete categories');
        },
      });
    } else if (deletingCategory) {
      deleteCategory.mutate(deletingCategory.id, {
        onSuccess: () => {
          toast.success('Category deleted successfully');
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to delete category');
        },
      });
    }
    setIsDeleteModalOpen(false);
    setDeletingCategory(null);
    setDeletingCategories(null);
  }, [deleteCategory, bulkDeleteCategories, deletingCategory, deletingCategories]);

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
      setDeletingCategories(null);
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
          Failed to load categories. Please try again.
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
        <h1 className="page-title">Category Management</h1>
        <p className="page-subtitle">Manage your categories and their base rates</p>
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
              >
                <Plus className="page-btn-icon" />
                Add Category
              </button>
              <button className="page-btn-secondary">
                <Filter className="page-btn-icon" />
                Filter
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
          setDeletingCategories(null);
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