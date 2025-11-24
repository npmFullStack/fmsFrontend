// src/utils/queue.js
class PriorityQueue {
  constructor(concurrentLimit = 5) {
    this.queue = [];
    this.running = 0;
    this.concurrentLimit = concurrentLimit;
  }
  
  add(request, priority = 0) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, priority, resolve, reject });
      this.queue.sort((a, b) => b.priority - a.priority);
      this.process();
    });
  }
  
  async process() {
    if (this.running >= this.concurrentLimit || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { request, resolve, reject } = this.queue.shift();
    
    try {
      const result = await request();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

export const requestQueue = new PriorityQueue();