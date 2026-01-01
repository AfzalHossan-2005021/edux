/**
 * Caching Layer for EduX
 * Supports Redis and in-memory fallback
 */

// In-memory cache fallback
const memoryCache = new Map();
const memoryCacheTTL = new Map();

// Check if Redis is available
let redisClient = null;
let isRedisAvailable = false;

// Initialize Redis connection
async function initRedis() {
  if (typeof window !== 'undefined') return; // Only server-side
  
  try {
    const Redis = require('ioredis');
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
    });

    await redisClient.connect();
    isRedisAvailable = true;
    console.log('✅ Redis connected successfully');
  } catch (error) {
    console.log('⚠️ Redis not available, using in-memory cache');
    isRedisAvailable = false;
  }
}

// Initialize on module load (server-side only)
if (typeof window === 'undefined') {
  initRedis().catch(() => {});
}

/**
 * Cache utility functions
 */
const cache = {
  /**
   * Get value from cache
   */
  async get(key) {
    try {
      if (isRedisAvailable && redisClient) {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
      }
      
      // In-memory fallback
      const ttl = memoryCacheTTL.get(key);
      if (ttl && Date.now() > ttl) {
        memoryCache.delete(key);
        memoryCacheTTL.delete(key);
        return null;
      }
      return memoryCache.get(key) || null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Set value in cache with optional TTL (seconds)
   */
  async set(key, value, ttlSeconds = 3600) {
    try {
      const serialized = JSON.stringify(value);
      
      if (isRedisAvailable && redisClient) {
        await redisClient.setex(key, ttlSeconds, serialized);
      } else {
        // In-memory fallback
        memoryCache.set(key, value);
        memoryCacheTTL.set(key, Date.now() + ttlSeconds * 1000);
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  /**
   * Delete value from cache
   */
  async del(key) {
    try {
      if (isRedisAvailable && redisClient) {
        await redisClient.del(key);
      } else {
        memoryCache.delete(key);
        memoryCacheTTL.delete(key);
      }
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  /**
   * Clear all cache (or by pattern)
   */
  async clear(pattern = null) {
    try {
      if (isRedisAvailable && redisClient) {
        if (pattern) {
          const keys = await redisClient.keys(pattern);
          if (keys.length > 0) {
            await redisClient.del(...keys);
          }
        } else {
          await redisClient.flushdb();
        }
      } else {
        if (pattern) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          for (const key of memoryCache.keys()) {
            if (regex.test(key)) {
              memoryCache.delete(key);
              memoryCacheTTL.delete(key);
            }
          }
        } else {
          memoryCache.clear();
          memoryCacheTTL.clear();
        }
      }
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  },

  /**
   * Get or set with callback (cache-aside pattern)
   */
  async getOrSet(key, callback, ttlSeconds = 3600) {
    let value = await this.get(key);
    if (value !== null) {
      return value;
    }
    
    value = await callback();
    await this.set(key, value, ttlSeconds);
    return value;
  },

  /**
   * Check if key exists
   */
  async has(key) {
    try {
      if (isRedisAvailable && redisClient) {
        return (await redisClient.exists(key)) === 1;
      }
      return memoryCache.has(key) && (!memoryCacheTTL.has(key) || Date.now() <= memoryCacheTTL.get(key));
    } catch (error) {
      return false;
    }
  },

  /**
   * Get remaining TTL in seconds
   */
  async ttl(key) {
    try {
      if (isRedisAvailable && redisClient) {
        return await redisClient.ttl(key);
      }
      const expiry = memoryCacheTTL.get(key);
      if (!expiry) return -1;
      return Math.max(0, Math.floor((expiry - Date.now()) / 1000));
    } catch (error) {
      return -1;
    }
  },
};

/**
 * Cache key generators for different entities
 */
export const CacheKeys = {
  // Course cache keys
  course: (id) => `course:${id}`,
  allCourses: () => 'courses:all',
  popularCourses: () => 'courses:popular',
  topRatedCourses: () => 'courses:top-rated',
  coursesByCategory: (category) => `courses:category:${category}`,
  courseSearch: (query) => `courses:search:${query.toLowerCase().replace(/\s+/g, '-')}`,
  
  // User cache keys
  user: (id) => `user:${id}`,
  userCourses: (userId) => `user:${userId}:courses`,
  userWishlist: (userId) => `user:${userId}:wishlist`,
  userProgress: (userId, courseId) => `user:${userId}:progress:${courseId}`,
  
  // Instructor cache keys
  instructor: (id) => `instructor:${id}`,
  instructorCourses: (id) => `instructor:${id}:courses`,
  
  // Content cache keys
  lecture: (id) => `lecture:${id}`,
  examQuestions: (examId) => `exam:${examId}:questions`,
  courseReviews: (courseId) => `course:${courseId}:reviews`,
  
  // Session cache keys
  session: (token) => `session:${token}`,
};

/**
 * Cache TTL values (in seconds)
 */
export const CacheTTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 3600,          // 1 hour
  VERY_LONG: 86400,    // 24 hours
  SESSION: 604800,     // 7 days
};

/**
 * API response caching middleware
 */
export function withCache(handler, keyGenerator, ttl = CacheTTL.MEDIUM) {
  return async (req, res) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return handler(req, res);
    }

    const cacheKey = typeof keyGenerator === 'function' 
      ? keyGenerator(req) 
      : keyGenerator;

    // Try to get from cache
    const cached = await cache.get(cacheKey);
    if (cached !== null) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached);
    }

    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to cache the response
    res.json = async (data) => {
      if (res.statusCode === 200) {
        await cache.set(cacheKey, data, ttl);
        res.setHeader('X-Cache', 'MISS');
      }
      return originalJson(data);
    };

    return handler(req, res);
  };
}

/**
 * Invalidate related caches when data changes
 */
export const invalidateCache = {
  async course(courseId) {
    await Promise.all([
      cache.del(CacheKeys.course(courseId)),
      cache.del(CacheKeys.allCourses()),
      cache.del(CacheKeys.popularCourses()),
      cache.del(CacheKeys.topRatedCourses()),
      cache.clear('courses:category:*'),
      cache.clear('courses:search:*'),
    ]);
  },

  async user(userId) {
    await Promise.all([
      cache.del(CacheKeys.user(userId)),
      cache.del(CacheKeys.userCourses(userId)),
      cache.del(CacheKeys.userWishlist(userId)),
    ]);
  },

  async enrollment(userId, courseId) {
    await Promise.all([
      cache.del(CacheKeys.userCourses(userId)),
      cache.del(CacheKeys.course(courseId)),
      cache.del(CacheKeys.popularCourses()),
    ]);
  },

  async review(courseId) {
    await Promise.all([
      cache.del(CacheKeys.courseReviews(courseId)),
      cache.del(CacheKeys.course(courseId)),
      cache.del(CacheKeys.topRatedCourses()),
    ]);
  },
};

export default cache;
