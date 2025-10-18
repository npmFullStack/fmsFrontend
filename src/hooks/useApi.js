// src/hooks/useApi.js
import { useState } from 'react';
import toast from 'react-hot-toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);

  const callApi = async (apiCall, options = {}) => {
    const { showToast = true, successMessage } = options;
    
    setLoading(true);
    try {
      const result = await apiCall();
      if (showToast && successMessage) {
        toast.success(successMessage);
      }
      return result;
    } catch (error) {
      if (showToast) {
        toast.error(error.message || 'Something went wrong');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { callApi, loading };
};