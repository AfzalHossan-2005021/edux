/**
 * API Response Caching Middleware
 * Implements in-memory caching with TTL support
 */

// In-memory cache store
const cacheStore = new Map();

// Cache configuration
const CACHE_CONFIG = {
  // Course listings - cache for 5 minutes
  courses: {
    ttl: 5 * 60 * 1000,
    maxEntries: 100,
  },
  // Individual course details - cache for 2 minutes
  courseDetails: {
    ttl: 2 * 60 * 1000,
    maxEntries: 200,
  },
  // Search results - cache for 1 minute
  search: {
    ttl: 60 * 1000,
    maxEntries: 500,
  },
  // AI recommendations - cache for 10 minutes (expensive to generate)
  aiRecommendations: {
    ttl: 10 * 60 * 1000,
    maxEntries: 100,
  },
  // Popular courses - cache for 15 minutes
  popular: {
    ttl: 15 * 60 * 1000,
    maxEntries: 10,
  },
  // Default configuration
  default: {
    ttl: 60 * 1000,
    maxEntries: 1000,
  },
};

/**
 * Generate cache key from request
 * @param {Object} req - Request object
 * @param {string} prefix - Cache key prefix
 * @returns {string} - Cache key
 */
function generateCacheKey(req, prefix = '') {
  const userId = req.user?.id || 'anonymous';
  const query = JSON.stringify(req.query || {});
  const body = JSON.stringify(req.body || {});
  
  return `${prefix}:${userId}:${req.url}:${query}:${body}`;
}

/**
 * Check if cached entry is expired
 * @param {Object} entry - Cache entry
 * @returns {boolean} - True if expired
 */
function isExpired(entry) {
  return Date.now() > entry.expiresAt;
}

/**
 * Clean up expired entries from a specific cache category
 * @param {string} category - Cache category
 */
function cleanupCategory(category) {
  const prefix = `${category}:`;
  for (const [key, entry] of cacheStore.entries()) {
    if (key.startsWith(prefix) && isExpired(entry)) {
      cacheStore.delete(key);
    }
  }
}

/**
 * Enforce max entries limit for a category using LRU
 * @param {string} category - Cache category
 * @param {number} maxEntries - Maximum entries
 */
function enforceMaxEntries(category, maxEntries) {
  const prefix = `${category}:`;
  const entries = [];
  
  for (const [key, entry] of cacheStore.entries()) {
    if (key.startsWith(prefix)) {
      entries.push({ key, lastAccessed: entry.lastAccessed });
    }
  }
  
  if (entries.length >= maxEntries) {
    // Sort by last accessed (oldest first)
    entries.sort((a, b) => a.lastAccessed - b.lastAccessed);
    
    // Remove oldest entries
    const toRemove = entries.slice(0, entries.length - maxEntries + 1);
    toRemove.forEach(({ key }) => cacheStore.delete(key));
  }
}

/**
 * Get cached value
 * @param {string} key - Cache key
 * @returns {*} - Cached value or null
 */
export function getCache(key) {
  const entry = cacheStore.get(key);
  
  if (!entry) {
    return null;
  }
  
  if (isExpired(entry)) {
    cacheStore.delete(key);
    return null;
  }
  
  // Update last accessed time
  entry.lastAccessed = Date.now();
  return entry.value;
}

/**
 * Set cache value
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {string} category - Cache category
 */
export function setCache(key, value, category = 'default') {
  const config = CACHE_CONFIG[category] || CACHE_CONFIG.default;
  
  // Clean up and enforce limits
  cleanupCategory(category);
  enforceMaxEntries(category, config.maxEntries);
  
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + config.ttl,
    lastAccessed: Date.now(),
    category,
  });
}

/**
 * Invalidate cache entries matching a pattern
 * @param {string} pattern - Pattern to match (prefix)
 */
export function invalidateCache(pattern) {
  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      cacheStore.delete(key);
    }
  }
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  cacheStore.clear();
}

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
export function getCacheStats() {
  const stats = {
    totalEntries: cacheStore.size,
    categories: {},
  };
  
  for (const [key, entry] of cacheStore.entries()) {
    const category = entry.category || 'default';
    if (!stats.categories[category]) {
      stats.categories[category] = { count: 0, expired: 0 };
    }
    stats.categories[category].count++;
    if (isExpired(entry)) {
      stats.categories[category].expired++;
    }
  }
  
  return stats;
}

/**
 * Caching middleware factory
 * @param {string} category - Cache category
 * @returns {Function} - Middleware function
 */
export function cacheMiddleware(category = 'default') {
  return async (req, res, next) => {
    // Only cache GET and POST requests
    if (!['GET', 'POST'].includes(req.method)) {
      return next?.();
    }
    
    const cacheKey = generateCacheKey(req, category);
    const cached = getCache(cacheKey);
    
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached);
    }
    
    res.setHeader('X-Cache', 'MISS');
    
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json to cache the response
    res.json = (data) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setCache(cacheKey, data, category);
      }
      return originalJson(data);
    };
    
    return next?.();
  };
}

/**
 * HOC to wrap API handlers with caching
 * @param {Function} handler - API route handler
 * @param {string} category - Cache category
 * @returns {Function} - Wrapped handler
 */
export function withCache(handler, category = 'default') {
  return async (req, res) => {
    // Only cache GET and POST requests
    if (!['GET', 'POST'].includes(req.method)) {
      return handler(req, res);
    }
    
    const cacheKey = generateCacheKey(req, category);
    const cached = getCache(cacheKey);
    
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached);
    }
    
    res.setHeader('X-Cache', 'MISS');
    
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json to cache the response
    res.json = (data) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setCache(cacheKey, data, category);
      }
      return originalJson(data);
    };
    
    return handler(req, res);
  };
}

export default {
  getCache,
  setCache,
  invalidateCache,
  clearAllCache,
  getCacheStats,
  cacheMiddleware,
  withCache,
};
