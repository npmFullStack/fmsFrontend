// src/pages/Category.jsx
import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useCategoryStore } from '../stores/useCategoryStore';
import CategoryTable from '../components/tables/CategoryTable';
import AddCategory from '../components/modals/AddCategory';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

const Category = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const { 
    categories, 
    loading, 
    fetchCategories, 
    addCategory, 
    updateCategory, 
    deleteCategory 
  } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSave = async (categoryData) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await addCategory(categoryData);
      }
      setEditingCategory(null);
      setIsModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  if (loading && categories.length === 0) {
    return <LoadingSkeleton type="table" rows={5} columns={4} />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      <CategoryTable
        data={categories}
        onEdit={handleEdit}
        onDelete={deleteCategory}
        isLoading={loading}
      />

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