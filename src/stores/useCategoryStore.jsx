// src/stores/useCategoryStore.js
import { create } from 'zustand';
import api from '../api';

export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/categories');
      set({ categories: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },
  
  addCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      set((state) => ({ 
        categories: [...state.categories, response.data] 
      }));
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
  
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      set((state) => ({
        categories: state.categories.map(cat => 
          cat.id === id ? response.data : cat
        )
      }));
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
  
  deleteCategory: async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      set((state) => ({
        categories: state.categories.filter(cat => cat.id !== id)
      }));
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
  
  clearError: () => set({ error: null })
}));