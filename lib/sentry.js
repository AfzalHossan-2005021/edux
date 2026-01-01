/**
 * Sentry Configuration for EduX
 * Error tracking and performance monitoring
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Browser-side Sentry initialization
export function initSentryBrowser() {
  if (typeof window === 'undefined' || !SENTRY_DSN) return;

  import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV,
      
      // Performance monitoring
      tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,
      
      // Session replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Integrations
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      
      // Filter out common non-errors
      beforeSend(event) {
        // Don't send events in development unless explicitly enabled
        if (!IS_PRODUCTION && !process.env.SENTRY_DEBUG) {
          return null;
        }
        
        // Filter out certain errors
        if (event.exception?.values) {
          const message = event.exception.values[0]?.value || '';
          
          // Ignore common browser errors
          const ignoredErrors = [
            'ResizeObserver loop',
            'Loading chunk',
            'ChunkLoadError',
            'Network request failed',
            'Load failed',
          ];
          
          if (ignoredErrors.some(err => message.includes(err))) {
            return null;
          }
        }
        
        return event;
      },
      
      // Add user context
      initialScope: {
        tags: {
          app: 'edux',
          version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        },
      },
    });
  });
}

// Server-side Sentry initialization
export function initSentryServer() {
  if (!SENTRY_DSN) return;

  import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,
      
      beforeSend(event) {
        if (!IS_PRODUCTION && !process.env.SENTRY_DEBUG) {
          return null;
        }
        return event;
      },
    });
  });
}

// Helper to capture custom errors with context
export async function captureError(error, context = {}) {
  if (!SENTRY_DSN) {
    console.error('Error:', error, context);
    return;
  }

  const Sentry = await import('@sentry/nextjs');
  
  Sentry.withScope((scope) => {
    // Add extra context
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    
    // Capture the error
    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(String(error), 'error');
    }
  });
}

// Helper to set user context
export async function setUserContext(user) {
  if (!SENTRY_DSN || !user) return;

  const Sentry = await import('@sentry/nextjs');
  
  Sentry.setUser({
    id: user.u_id?.toString(),
    email: user.email,
    username: user.name,
    segment: user.s_id ? 'student' : user.i_id ? 'instructor' : 'user',
  });
}

// Helper to clear user context on logout
export async function clearUserContext() {
  if (!SENTRY_DSN) return;

  const Sentry = await import('@sentry/nextjs');
  Sentry.setUser(null);
}

// Helper for API error tracking
export async function trackApiError(endpoint, error, requestData = {}) {
  await captureError(error, {
    type: 'api_error',
    endpoint,
    request: requestData,
    timestamp: new Date().toISOString(),
  });
}

// Performance tracking helper
export async function trackPerformance(name, duration, tags = {}) {
  if (!SENTRY_DSN) return;

  const Sentry = await import('@sentry/nextjs');
  
  const transaction = Sentry.startTransaction({
    name,
    op: 'custom',
  });
  
  Object.entries(tags).forEach(([key, value]) => {
    transaction.setTag(key, value);
  });
  
  transaction.setMeasurement('duration', duration, 'millisecond');
  transaction.finish();
}

// Breadcrumb helper for user actions
export async function addBreadcrumb(category, message, data = {}) {
  if (!SENTRY_DSN) return;

  const Sentry = await import('@sentry/nextjs');
  
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
}

export default {
  initSentryBrowser,
  initSentryServer,
  captureError,
  setUserContext,
  clearUserContext,
  trackApiError,
  trackPerformance,
  addBreadcrumb,
};
