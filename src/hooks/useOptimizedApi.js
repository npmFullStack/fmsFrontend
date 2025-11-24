// src/hooks/useOptimizedApi.js
import { useCallback, useRef } from 'react';
import { retryWithBackoff } from '../utils/retry';
import { apiCache } from '../utils/cache';

export const useOptimizedApi = () => {
  const abortControllers = useRef(new Map());
  
  const optimizedRequest = useCallback(async (key, apiCall, options = {}) => {
    const {
      useCache = true,
      ttl = 5 * 60 * 1000,
      retry = true,
      timeout = 30000
    } = options;
    
    // Check cache first
    if (useCache) {
      const cached = apiCache.get(key);
      if (cached) return cached;
    }
    
    // Cancel previous request with same key
    if (abortControllers.current.has(key)) {
      abortControllers.current.get(key).abort();
    }
    
    const controller = new AbortController();
    abortControllers.current.set(key, controller);
    
    try {
      const requestFn = retry 
        ? () => retryWithBackoff(
            () => apiCall(controller.signal),
            3,
            1000,
            timeout
          )
        : () => apiCall(controller.signal);
      
      const result = await requestFn();
      
      // Cache successful responses
      if (useCache) {
        apiCache.set(key, result, ttl);
      }
      
      return result;
    } finally {
      abortControllers.current.delete(key);
    }
  }, []);
  
  const cancelRequest = useCallback((key) => {
    if (abortControllers.current.has(key)) {
      abortControllers.current.get(key).abort();
      abortControllers.current.delete(key);
    }
  }, []);
  
  const clearCache = useCallback((key) => {
    if (key) {
      apiCache.delete(key);
    } else {
      apiCache.clear();
    }
  }, []);
  
  return {
    optimizedRequest,
    cancelRequest,
    clearCache
  };
};