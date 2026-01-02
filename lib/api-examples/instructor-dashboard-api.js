/**
 * API Integration Reference for Instructor Dashboard
 * Examples and endpoints used in the instructor dashboard
 */

// =======================
// INSTRUCTOR INFO API
// =======================
// Endpoint: /api/instructor_info
// Method: POST
// Purpose: Fetch instructor profile details

const fetchInstructorInfo = async (userId) => {
  const response = await apiPost('/api/instructor_info', { u_id: userId });
  const data = await response.json();
  // Returns: [{ name, email, subject, course_count, reg_date, ... }]
  return data[0]; // First result is instructor info
};

// =======================
// INSTRUCTOR COURSES API
// =======================
// Endpoint: /api/instructor_courses
// Method: POST
// Purpose: Get all courses created by instructor

const fetchInstructorCourses = async (userId) => {
  const response = await apiPost('/api/instructor_courses', { u_id: userId });
  const courses = await response.json();
  // Returns: [{ c_id, title, description, ... }, ...]
  return courses;
};

// =======================
// ANALYTICS APIS
// =======================
// Base Endpoint: /api/instructor-analytics
// Method: GET
// Purpose: Comprehensive analytics data

// 1. OVERVIEW - Quick stats summary
const fetchAnalyticsOverview = async (instructorId) => {
  const response = await fetch(
    `/api/instructor-analytics?instructorId=${instructorId}&action=overview`
  );
  const data = await response.json();
  // Returns: {
  //   overview: {
  //     totalCourses: number,
  //     totalStudents: number,
  //     totalEnrollments: number,
  //     avgRating: number,
  //     totalReviews: number,
  //     totalRevenue: number,
  //     recentEnrollments: number,
  //     topCourse: { id, name, enrollments }
  //   }
  // }
  return data.overview;
};

// 2. COURSE ANALYTICS - Individual course performance
const fetchCourseAnalytics = async (instructorId, courseId) => {
  const response = await fetch(
    `/api/instructor-analytics?instructorId=${instructorId}&action=course&courseId=${courseId}`
  );
  const data = await response.json();
  // Returns: {
  //   courseId: number,
  //   enrollments: {
  //     total: number,
  //     completionRate: number,
  //     trend: [{ date, count }, ...]
  //   },
  //   ratings: {
  //     distribution: { 1: n, 2: n, 3: n, 4: n, 5: n }
  //   },
  //   exams: {
  //     avgScore: number,
  //     minScore: number,
  //     maxScore: number,
  //     totalAttempts: number
  //   }
  // }
  return data;
};

// 3. REVENUE ANALYTICS - Financial metrics
const fetchRevenueAnalytics = async (instructorId, period = '30d') => {
  const response = await fetch(
    `/api/instructor-analytics?instructorId=${instructorId}&action=revenue&period=${period}`
  );
  const data = await response.json();
  // Returns: {
  //   revenue: {
  //     total: number,
  //     byCourse: [
  //       { courseId, courseName, revenue, sales },
  //       ...
  //     ],
  //     trend: [{ date, amount }, ...]
  //   },
  //   period: '30d' | '7d' | '90d' | '365d'
  // }
  return data.revenue;
};

// 4. ENGAGEMENT ANALYTICS - Student interaction metrics
const fetchEngagementAnalytics = async (instructorId, period = '30d') => {
  const response = await fetch(
    `/api/instructor-analytics?instructorId=${instructorId}&action=engagement&period=${period}`
  );
  const data = await response.json();
  // Returns: {
  //   engagement: {
  //     discussionThreads: number,
  //     discussionReplies: number,
  //     assignmentSubmissions: number,
  //     quizAttempts: number
  //   }
  // }
  return data.engagement;
};

// 5. STUDENT ANALYTICS - Detailed student information
const fetchStudentAnalytics = async (instructorId, courseId = null) => {
  const url = courseId
    ? `/api/instructor-analytics?instructorId=${instructorId}&action=students&courseId=${courseId}`
    : `/api/instructor-analytics?instructorId=${instructorId}&action=students`;
  
  const response = await fetch(url);
  const data = await response.json();
  // Returns: {
  //   students: [
  //     {
  //       userId: number,
  //       name: string,
  //       email: string,
  //       courseId: number,
  //       courseName: string,
  //       enrollDate: date,
  //       completed: boolean,
  //       progress: number (0-100)
  //     },
  //     ...
  //   ],
  //   summary: {
  //     total: number,
  //     completed: number,
  //     inProgress: number,
  //     notStarted: number
  //   }
  // }
  return data;
};

// =======================
// USAGE EXAMPLES IN COMPONENTS
// =======================

// Example 1: Fetch all data on component mount
const fetchAllData = async (instructorId, userId) => {
  try {
    const [instructorInfo, courses, overview, students] = await Promise.all([
      fetchInstructorInfo(userId),
      fetchInstructorCourses(userId),
      fetchAnalyticsOverview(instructorId),
      fetchStudentAnalytics(instructorId)
    ]);

    return { instructorInfo, courses, overview, students };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return null;
  }
};

// Example 2: Fetch specific course analytics
const handleViewCourseAnalytics = async (instructorId, courseId) => {
  try {
    const courseData = await fetchCourseAnalytics(instructorId, courseId);
    // Process and display course analytics
    console.log('Course Analytics:', courseData);
  } catch (error) {
    console.error('Error fetching course analytics:', error);
  }
};

// Example 3: Fetch revenue with period filter
const handleFilterRevenue = async (instructorId, period) => {
  try {
    const revenueData = await fetchRevenueAnalytics(instructorId, period);
    // Update UI with filtered revenue data
    console.log(`Revenue for ${period}:`, revenueData);
  } catch (error) {
    console.error('Error fetching revenue:', error);
  }
};

// =======================
// AVAILABLE QUERY PARAMETERS
// =======================

/**
 * Period Values for Analytics:
 * - '7d': Last 7 days
 * - '30d': Last 30 days (default)
 * - '90d': Last 90 days
 * - '365d': Last year
 */

// =======================
// ERROR HANDLING PATTERNS
// =======================

const fetchWithErrorHandling = async (url) => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    // Return default/empty data
    return null;
  }
};

// =======================
// RATE LIMITING & CACHING
// =======================

// Simple cache for avoiding repeated requests
const analyticsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const fetchWithCache = async (key, fetchFn) => {
  const cached = analyticsCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fetchFn();
  analyticsCache.set(key, { data, timestamp: Date.now() });
  
  return data;
};

// Usage: await fetchWithCache('overview', () => fetchAnalyticsOverview(instructorId));

// =======================
// REAL-TIME UPDATES
// =======================

// Example: Poll for new student enrollments
const pollForNewEnrollments = (instructorId, intervalMs = 30000) => {
  const interval = setInterval(async () => {
    const overview = await fetchAnalyticsOverview(instructorId);
    // Emit event or update state with new enrollment count
    console.log('Updated enrollments:', overview.totalEnrollments);
  }, intervalMs);
  
  return () => clearInterval(interval); // Cleanup function
};

// =======================
// DATA TRANSFORMATION HELPERS
// =======================

// Format revenue for display
const formatRevenue = (amount) => {
  return `$${parseFloat(amount).toFixed(2)}`;
};

// Calculate average rating display
const formatRating = (rating) => {
  return parseFloat(rating).toFixed(1);
};

// Format dates for display
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Calculate percentage
const calculatePercentage = (current, total) => {
  return total > 0 ? Math.round((current / total) * 100) : 0;
};

// =======================
// VALIDATION FUNCTIONS
// =======================

// Validate instructor ID
const isValidInstructorId = (id) => {
  return id && !isNaN(id) && parseInt(id) > 0;
};

// Validate period parameter
const isValidPeriod = (period) => {
  return ['7d', '30d', '90d', '365d'].includes(period);
};

// =======================
// COMPLETE DASHBOARD INITIALIZATION
// =======================

async function initializeDashboard(userId) {
  // Step 1: Validate user
  if (!userId) {
    console.error('User ID is required');
    return null;
  }

  // Step 2: Fetch instructor info
  const instructor = await fetchInstructorInfo(userId);
  if (!instructor) {
    console.error('Failed to fetch instructor info');
    return null;
  }

  const instructorId = instructor.i_id; // Or extract from wherever it's stored

  // Step 3: Fetch all dashboard data in parallel
  const [courses, overview, students] = await Promise.all([
    fetchInstructorCourses(userId),
    fetchAnalyticsOverview(instructorId),
    fetchStudentAnalytics(instructorId)
  ]);

  // Step 4: Return complete dashboard state
  return {
    instructor,
    courses,
    overview,
    students,
    lastUpdated: new Date()
  };
}

export {
  fetchInstructorInfo,
  fetchInstructorCourses,
  fetchAnalyticsOverview,
  fetchCourseAnalytics,
  fetchRevenueAnalytics,
  fetchEngagementAnalytics,
  fetchStudentAnalytics,
  initializeDashboard,
  formatRevenue,
  formatRating,
  formatDate,
  calculatePercentage,
  isValidInstructorId,
  isValidPeriod
};
