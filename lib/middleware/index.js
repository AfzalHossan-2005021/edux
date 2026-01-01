/**
 * Middleware Barrel Export
 * Centralizes all middleware exports for easy importing
 * 
 * RECOMMENDED: Use the utility functions from './utils' instead of HOC wrappers
 * to avoid potential recursion issues with Next.js API routes.
 */

// ================== Utility Functions (RECOMMENDED) ==================
// These are simple function calls, not HOC wrappers - safer and easier to use
export {
  // Rate Limiting
  checkRateLimit,
  
  // Caching
  getCached,
  setCached,
  deleteCached,
  clearCache,
  getCacheStats,
  
  // Logging
  logDebug,
  logInfo,
  logWarn,
  logError,
  logRequest,
  logResponse,
  
  // Error Handling
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  handleError,
  
  // Request Helpers
  validateRequiredFields,
  validateMethod,
  getPagination,
  createPaginationMeta,
} from './utils';


// ================== HOC Wrappers (USE WITH CAUTION) ==================
// Note: These HOC-style wrappers can cause issues with Next.js if nested improperly

// Rate Limiting HOC
export {
  rateLimit,
  withRateLimit,
  authRateLimit,
  aiRateLimit,
} from './rateLimit';

// Caching HOC
export {
  getCache,
  setCache,
  invalidateCache,
  clearAllCache,
  getCacheStats as getCacheStatsHOC,
  cacheMiddleware,
  withCache,
} from './cache';

// Error Handling HOC
export {
  AppError,
  ValidationError as ValidationErrorHOC,
  AuthenticationError as AuthenticationErrorHOC,
  AuthorizationError as AuthorizationErrorHOC,
  NotFoundError as NotFoundErrorHOC,
  ConflictError,
  RateLimitError as RateLimitErrorHOC,
  DatabaseError,
  errorHandler,
  withErrorHandler,
  asyncHandler,
  setupGlobalErrorHandlers,
} from './errorHandler';

// Logging HOC
export {
  logger,
  requestLogger,
  withLogging,
  performanceTimer,
} from './logger';

/**
 * Compose multiple middleware functions
 * @param  {...Function} middlewares - Middleware functions
 * @returns {Function} - Composed middleware
 */
export function composeMiddleware(...middlewares) {
  return (handler) => {
    return middlewares.reduceRight((acc, middleware) => {
      return middleware(acc);
    }, handler);
  };
}

/**
 * Apply multiple middleware HOCs to a handler
 * @param {Function} handler - API route handler
 * @param {Object} options - Middleware options
 * @returns {Function} - Wrapped handler
 */
export function applyMiddleware(handler, options = {}) {
  const {
    rateLimit: rateLimitTier,
    cache: cacheCategory,
    logging = true,
    errorHandling = true,
  } = options;

  let wrappedHandler = handler;

  // Apply in reverse order (innermost first)
  if (errorHandling) {
    const { withErrorHandler } = require('./errorHandler');
    wrappedHandler = withErrorHandler(wrappedHandler);
  }

  if (cacheCategory) {
    const { withCache } = require('./cache');
    wrappedHandler = withCache(wrappedHandler, cacheCategory);
  }

  if (rateLimitTier) {
    const { withRateLimit } = require('./rateLimit');
    wrappedHandler = withRateLimit(wrappedHandler, rateLimitTier);
  }

  if (logging) {
    const { withLogging } = require('./logger');
    wrappedHandler = withLogging(wrappedHandler);
  }

  return wrappedHandler;
}

export default {
  composeMiddleware,
  applyMiddleware,
};
