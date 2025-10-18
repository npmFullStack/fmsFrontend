import { create } from 'zustand';
import api from '../api';
import toast from 'react-hot-toast';

export const useCategoryStore = create(() => ({
  /** 🔹 Add new category */
  addCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      toast.success('Category added successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add category';
      toast.error(message);
      throw new Error(message);
    }
  },

  /** 🔹 Update existing category */
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      toast.success('Category updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update category';
      toast.error(message);
      throw new Error(message);
    }
  },

  /** 🔹 Delete category */
  deleteCategory: async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete category';
      toast.error(message);
      throw new Error(message);
    }
  },
})); 
