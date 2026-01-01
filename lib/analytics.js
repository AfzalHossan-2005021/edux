/**
 * PostHog Analytics Configuration for EduX
 * Product analytics and user behavior tracking
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

let posthogInstance = null;

// Initialize PostHog
export async function initPostHog() {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return null;

  try {
    const posthog = (await import('posthog-js')).default;
    
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      
      // Automatically capture page views
      capture_pageview: true,
      
      // Automatically capture page leaves
      capture_pageleave: true,
      
      // Autocapture clicks and form submissions
      autocapture: true,
      
      // Session recording
      disable_session_recording: !IS_PRODUCTION,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '.sensitive-data',
      },
      
      // Feature flags
      bootstrap: {
        featureFlags: {},
      },
      
      // Performance
      loaded: (posthog) => {
        // Disable in development unless explicitly enabled
        if (!IS_PRODUCTION && !process.env.POSTHOG_DEBUG) {
          posthog.opt_out_capturing();
        }
        posthogInstance = posthog;
      },
      
      // Privacy
      respect_dnt: true,
      secure_cookie: IS_PRODUCTION,
      
      // Debugging
      debug: !IS_PRODUCTION,
    });

    return posthog;
  } catch (error) {
    console.error('PostHog initialization failed:', error);
    return null;
  }
}

// Get PostHog instance
export function getPostHog() {
  return posthogInstance;
}

// Identify user
export function identifyUser(user) {
  if (!posthogInstance || !user) return;

  posthogInstance.identify(user.u_id?.toString(), {
    email: user.email,
    name: user.name,
    userType: user.s_id ? 'student' : user.i_id ? 'instructor' : 'user',
    studentId: user.s_id,
    instructorId: user.i_id,
    registrationDate: user.reg_date,
  });
}

// Reset user on logout
export function resetUser() {
  if (!posthogInstance) return;
  posthogInstance.reset();
}

// Track custom event
export function trackEvent(eventName, properties = {}) {
  if (!posthogInstance) {
    console.log('[Analytics]', eventName, properties);
    return;
  }

  posthogInstance.capture(eventName, {
    ...properties,
    timestamp: new Date().toISOString(),
  });
}

// Track page view
export function trackPageView(pageName, properties = {}) {
  trackEvent('$pageview', {
    $current_url: window.location.href,
    pageName,
    ...properties,
  });
}

// Pre-defined events for EduX

// Course events
export const CourseEvents = {
  viewed: (courseId, courseTitle) => 
    trackEvent('course_viewed', { courseId, courseTitle }),
  
  enrolled: (courseId, courseTitle) => 
    trackEvent('course_enrolled', { courseId, courseTitle }),
  
  completed: (courseId, courseTitle, completionTime) => 
    trackEvent('course_completed', { courseId, courseTitle, completionTime }),
  
  rated: (courseId, rating) => 
    trackEvent('course_rated', { courseId, rating }),
  
  searchPerformed: (query, resultsCount) => 
    trackEvent('course_search', { query, resultsCount }),
  
  addedToWishlist: (courseId) => 
    trackEvent('wishlist_added', { courseId }),
  
  removedFromWishlist: (courseId) => 
    trackEvent('wishlist_removed', { courseId }),
};

// Learning events
export const LearningEvents = {
  lectureStarted: (lectureId, courseId) => 
    trackEvent('lecture_started', { lectureId, courseId }),
  
  lectureCompleted: (lectureId, courseId, watchTime) => 
    trackEvent('lecture_completed', { lectureId, courseId, watchTime }),
  
  videoProgress: (lectureId, progress, duration) => 
    trackEvent('video_progress', { lectureId, progress, duration }),
  
  examStarted: (examId, courseId) => 
    trackEvent('exam_started', { examId, courseId }),
  
  examCompleted: (examId, score, totalMarks) => 
    trackEvent('exam_completed', { examId, score, totalMarks, percentage: (score/totalMarks)*100 }),
  
  questionAnswered: (questionId, isCorrect) => 
    trackEvent('question_answered', { questionId, isCorrect }),
};

// User events
export const UserEvents = {
  signedUp: (method = 'email') => 
    trackEvent('user_signed_up', { method }),
  
  loggedIn: (method = 'email') => 
    trackEvent('user_logged_in', { method }),
  
  loggedOut: () => 
    trackEvent('user_logged_out'),
  
  profileUpdated: (fields) => 
    trackEvent('profile_updated', { updatedFields: fields }),
  
  passwordChanged: () => 
    trackEvent('password_changed'),
};

// Engagement events
export const EngagementEvents = {
  reviewSubmitted: (courseId, rating) => 
    trackEvent('review_submitted', { courseId, rating }),
  
  aiFeatureUsed: (feature, query) => 
    trackEvent('ai_feature_used', { feature, queryLength: query?.length }),
  
  notificationClicked: (notificationType) => 
    trackEvent('notification_clicked', { notificationType }),
  
  featureDiscovered: (featureName) => 
    trackEvent('feature_discovered', { featureName }),
};

// Error tracking
export function trackError(errorType, errorMessage, context = {}) {
  trackEvent('error_occurred', {
    errorType,
    errorMessage,
    ...context,
  });
}

// Feature flag helpers
export function isFeatureEnabled(flagKey) {
  if (!posthogInstance) return false;
  return posthogInstance.isFeatureEnabled(flagKey);
}

export function getFeatureFlag(flagKey) {
  if (!posthogInstance) return null;
  return posthogInstance.getFeatureFlag(flagKey);
}

// A/B Testing helper
export function getExperimentVariant(experimentKey) {
  if (!posthogInstance) return null;
  return posthogInstance.getFeatureFlag(experimentKey);
}

export default {
  initPostHog,
  getPostHog,
  identifyUser,
  resetUser,
  trackEvent,
  trackPageView,
  trackError,
  CourseEvents,
  LearningEvents,
  UserEvents,
  EngagementEvents,
  isFeatureEnabled,
  getFeatureFlag,
  getExperimentVariant,
};
