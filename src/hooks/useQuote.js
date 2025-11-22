// src/hooks/useQuote.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const QUOTE_KEY = ['quotes'];

// API functions
const quoteApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/quotes', { params });
    return data;
  },
  getOne: async (id) => {
    const { data } = await api.get(`/quotes/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/quotes', payload);
    return data;
  },
  send: async ({ id, ...payload }) => {
    const { data } = await api.post(`/quotes/${id}/send`, payload);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/quotes/${id}`);
    return data;
  },
send: async ({ id, ...payload }) => {
  const { data } = await api.post(`/quotes/${id}/send`, payload);
  return data;
},
};

// Hook
export const useQuote = () => {
  const queryClient = useQueryClient();

  // Fetch all quotes with optional params
  const quotesQuery = (params = {}) => useQuery({
    queryKey: [...QUOTE_KEY, params],
    queryFn: () => quoteApi.getAll(params),
  });

  // Fetch single quote
  const quoteQuery = (id) => useQuery({
    queryKey: [...QUOTE_KEY, id],
    queryFn: () => quoteApi.getOne(id),
    enabled: !!id,
  });

  // Create quote
  const createQuote = useMutation({
    mutationFn: quoteApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries(QUOTE_KEY);
      console.log('Quote created successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('Create quote error:', error.response?.data || error.message);
      throw error;
    },
  });

  // Send quote
  const sendQuote = useMutation({
    mutationFn: quoteApi.send,
    onSuccess: (data) => {
      queryClient.invalidateQueries(QUOTE_KEY);
      console.log('Quote sent successfully', data);
      return data;
    },
    onError: (error) => {
      console.error('Send quote error:', error.response?.data || error.message);
      throw error;
    },
  });

  // Delete quote
  const deleteQuote = useMutation({
    mutationFn: quoteApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(QUOTE_KEY);
      console.log('Quote deleted successfully');
    },
    onError: (error) => {
      console.error('Delete quote error:', error.response?.data || error.message);
    },
  });

  return {
    // Queries
    quotesQuery,
    quoteQuery,
    // Mutations
    createQuote,
    sendQuote,
    deleteQuote,
  };
};