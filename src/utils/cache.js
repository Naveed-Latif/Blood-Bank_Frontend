/**
 * Simple in-memory cache with TTL (Time To Live) support
 */
class Cache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set(key, value, ttl = 5 * 60 * 1000) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set the value
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.timers.set(key, timer);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Check if a key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      entries: Array.from(this.cache.entries()).map(([key, item]) => ({
        key,
        timestamp: item.timestamp,
        ttl: item.ttl,
        age: Date.now() - item.timestamp
      }))
    };
  }

  /**
   * Create a cache key from multiple parts
   * @param {...string} parts - Parts to join
   * @returns {string} Cache key
   */
  static createKey(...parts) {
    return parts.filter(Boolean).join(':');
  }
}

// Create a global cache instance
export const apiCache = new Cache();

/**
 * Cache decorator for API functions
 * @param {string} keyPrefix - Prefix for cache key
 * @param {number} ttl - Time to live in milliseconds
 * @returns {function} Decorator function
 */
export const withCache = (keyPrefix, ttl = 5 * 60 * 1000) => {
  return (target, propertyName, descriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      // Create cache key
      const cacheKey = Cache.createKey(keyPrefix, JSON.stringify(args));
      
      // Try to get from cache first
      const cachedResult = apiCache.get(cacheKey);
      if (cachedResult !== null) {
        // Cache hit - no logging in production
        return cachedResult;
      }

      // Call original method
      try {
        const result = await originalMethod.apply(this, args);
        
        // Cache the result
        apiCache.set(cacheKey, result, ttl);
        // Cache set - no logging in production
        
        return result;
      } catch (error) {
        // Don't cache errors
        throw error;
      }
    };

    return descriptor;
  };
};

/**
 * Invalidate cache entries by pattern
 * @param {string|RegExp} pattern - Pattern to match keys
 */
export const invalidateCache = (pattern) => {
  const keys = Array.from(apiCache.cache.keys());
  const keysToDelete = keys.filter(key => {
    if (typeof pattern === 'string') {
      return key.includes(pattern);
    }
    if (pattern instanceof RegExp) {
      return pattern.test(key);
    }
    return false;
  });

  keysToDelete.forEach(key => apiCache.delete(key));
  // Cache invalidation - no logging in production
};

export default Cache;