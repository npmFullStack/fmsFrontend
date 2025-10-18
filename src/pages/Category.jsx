import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useCategoryStore } from '../stores/useCategoryStore';
import CategoryTable from '../components/tables/CategoryTable';
import AddCategory from '../components/modals/AddCategory';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

const Category = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    categories,
    loading,
    pagination,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryStore();

  /** 🔹 Fetch categories on mount */
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 🔹 Debounced search */
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchCategories({ search: searchTerm, page: 1 });
    }, 600);
    return () => clearTimeout(delay);
  }, [searchTerm, fetchCategories]);

  /** 🔹 Pagination */
  const handlePageChange = (page) => {
    fetchCategories({ page });
  };

  /** 🔹 Save handler (add or update) */
  const handleSave = async (categoryData) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, categoryData);
    } else {
      await addCategory(categoryData);
    }
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  /** 🔹 Edit handler */
  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  /** 🔹 Close modal */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  /** 🔹 Simple loading text */
  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Category Management</h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
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
        onDelete={deleteCategory}
        isLoading={loading}
      />

      {/* Pagination */}
      {pagination?.last_page > 1 && (
        <Pagination
          currentPage={pagination.current_page || 1}
          totalPages={pagination.last_page}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modal */}
      <AddCategory
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingCategory={editingCategory}
        isLoading={loading}
      />
    </div>
  );
};

export default Category;
