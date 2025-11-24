// src/utils/batch.js
class RequestBatcher {
  constructor(batchInterval = 50) {
    this.batchInterval = batchInterval;
    this.batch = [];
    this.timeoutId = null;
  }
  
  add(request) {
    return new Promise((resolve, reject) => {
      this.batch.push({ request, resolve, reject });
      
      if (!this.timeoutId) {
        this.timeoutId = setTimeout(() => this.processBatch(), this.batchInterval);
      }
    });
  }
  
  async processBatch() {
    const batchToProcess = [...this.batch];
    this.batch = [];
    this.timeoutId = null;
    
    if (batchToProcess.length === 0) return;
    
    try {
      // Process batch requests here
      const results = await Promise.all(
        batchToProcess.map(item => item.request())
      );
      
      results.forEach((result, index) => {
        batchToProcess[index].resolve(result);
      });
    } catch (error) {
      batchToProcess.forEach(item => {
        item.reject(error);
      });
    }
  }
}

export const requestBatcher = new RequestBatcher();