/**
 * Course Store - Zustand state management for courses
 */
import { create } from 'zustand';

const useCourseStore = create((set, get) => ({
  // State
  courses: [],
  popularCourses: [],
  topRatedCourses: [],
  myCourses: [],
  selectedCourse: null,
  searchResults: [],
  isLoading: false,
  error: null,
  filters: {
    category: '',
    level: '',
    rating: 0,
    search: '',
  },

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch all courses
  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/all_courses', { method: 'POST' });
      const data = await response.json();
      if (Array.isArray(data)) {
        set({ courses: data, isLoading: false });
      } else {
        set({ courses: [], isLoading: false, error: 'Failed to fetch courses' });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Fetch popular courses
  fetchPopularCourses: async () => {
    try {
      const response = await fetch('/api/popular_courses', { method: 'POST' });
      const data = await response.json();
      if (Array.isArray(data)) {
        set({ popularCourses: data });
      }
    } catch (error) {
      console.error('Failed to fetch popular courses:', error);
    }
  },

  // Fetch top rated courses
  fetchTopRatedCourses: async () => {
    try {
      const response = await fetch('/api/top_rated_courses', { method: 'POST' });
      const data = await response.json();
      if (Array.isArray(data)) {
        set({ topRatedCourses: data });
      }
    } catch (error) {
      console.error('Failed to fetch top rated courses:', error);
    }
  },

  // Fetch user's enrolled courses
  fetchMyCourses: async (userId) => {
    if (!userId) return;
    set({ isLoading: true });
    try {
      const response = await fetch('/api/user_courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ u_id: userId }),
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        set({ myCourses: data, isLoading: false });
      } else {
        set({ myCourses: [], isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Fetch single course details
  fetchCourseDetails: async (courseId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/selected_course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ c_id: courseId }),
      });
      const data = await response.json();
      set({ selectedCourse: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return null;
    }
  },

  // Search courses
  searchCourses: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    try {
      const response = await fetch('/api/course_suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ search: query }),
      });
      const data = await response.json();
      set({ searchResults: Array.isArray(data) ? data : [] });
    } catch (error) {
      set({ searchResults: [] });
    }
  },

  // Update filters
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),

  // Get filtered courses
  getFilteredCourses: () => {
    const { courses, filters } = get();
    return courses.filter((course) => {
      if (filters.category && course.field !== filters.category) return false;
      if (filters.rating && course.rating < filters.rating) return false;
      if (filters.search && !course.title?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  },

  // Clear selected course
  clearSelectedCourse: () => set({ selectedCourse: null }),

  // Enroll in course
  enrollInCourse: async (studentId, courseId) => {
    try {
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s_id: studentId, c_id: courseId }),
      });
      const data = await response.json();
      if (response.ok) {
        // Refresh my courses after enrollment
        get().fetchMyCourses(studentId);
        return { success: true };
      }
      return { success: false, error: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
}));

export default useCourseStore;
