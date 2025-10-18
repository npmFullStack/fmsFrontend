import { create } from 'zustand';
import api from '../api';
import toast from 'react-hot-toast';

export const useCategoryStore = create((set, get) => ({
  categories: [],
  pagination: { current_page: 1, last_page: 1, total: 0, per_page: 10 },
  search: '',
  sort: 'id',
  direction: 'asc',
  loading: false,
  error: null,

  /** 🔹 Fetch all categories (supports pagination, search, sort) */
  fetchCategories: async (params = {}) => {
    set({ loading: true, error: null });

    try {
      const { search, page, sort, direction, per_page } = {
        search: get().search,
        sort: get().sort,
        direction: get().direction,
        page: get().pagination.current_page,
        per_page: get().pagination.per_page,
        ...params,
      };

      const response = await api.get('/categories', {
        params: { search, page, sort, direction, per_page },
      });

      const data = response.data;

      // ✅ Safe ID mapping (avoids NaN)
      const categories = (data.data || []).map((item, index) => ({
        id: item.id ?? index,
        ...item,
      }));

      set({
        categories,
        pagination: {
          current_page: data.current_page,
          last_page: data.last_page,
          total: data.total,
          per_page: data.per_page,
        },
        search,
        sort,
        direction,
        loading: false,
      });
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to load categories';
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  /** 🔹 Add new category */
  addCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      const newCategory = response.data;

      set((state) => ({
        categories: [...state.categories, newCategory],
      }));

      toast.success('Category added successfully');
      await get().fetchCategories();
      return newCategory;
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
      const updated = response.data;

      set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === id ? updated : cat
        ),
      }));

      toast.success('Category updated successfully');
      return updated;
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

      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
      }));

      toast.success('Category deleted successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete category';
      toast.error(message);
      throw new Error(message);
    }
  },
}));
