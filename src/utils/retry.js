// src/utils/retry.js
export const retryWithBackoff = async (
  fn, 
  maxRetries = 3, 
  baseDelay = 1000,
  timeout = 30000
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout to individual requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const result = await fn(controller.signal);
        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      // Don't retry on 4xx errors (except 429)
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        throw error;
      }
      
      // Don't retry on abort
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      if (attempt === maxRetries) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = delay * 0.1 * Math.random();
      const totalDelay = delay + jitter;
      
      console.log(`🔄 Retry ${attempt}/${maxRetries} after ${Math.round(totalDelay)}ms`);
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }
};