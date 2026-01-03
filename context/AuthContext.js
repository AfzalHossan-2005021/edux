/**
 * Authentication Context Provider
 * Manages user authentication state across the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiPost, apiGet } from '../lib/api';

const AuthContext = createContext(null);

// Role-based route mapping
const ROLE_ROUTES = {
  student: '/student',
  instructor: '/instructor',
  admin: '/admin',
};

// Role hierarchy for access control
const ROLE_ACCESS = {
  '/student': ['student', 'admin'],
  '/instructor': ['instructor', 'admin'],
  '/admin': ['admin'],
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Derived role from user object
  const userRole = useMemo(() => {
    if (!user) return null;
    if (user.role) return user.role;
    if (user.isAdmin) return 'admin';
    if (user.isInstructor) return 'instructor';
    if (user.isStudent) return 'student';
    return null;
  }, [user]);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Helper to safely parse JSON response
      const safeJsonParse = async (response) => {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response.json();
        }
        throw new Error('Response is not JSON');
      };

      // Try to get current user from token
      const response = await apiGet('/api/me');
      if (response.ok) {
        const data = await safeJsonParse(response);
        if (data.success && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        }
      } else {
        // Try to refresh token
        const refreshResponse = await apiPost('/api/refresh-token');
        if (refreshResponse.ok) {
          const refreshData = await safeJsonParse(refreshResponse);
          if (refreshData.success && refreshData.user) {
            setUser(refreshData.user);
            setIsAuthenticated(true);
          }
        }
      }
    } catch (error) {
      // Silently fail auth check - user is not authenticated
      if (process.env.NODE_ENV === 'development') {
        console.debug('Auth check failed:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get the home route for a specific role
   * @param {string} role - The user role
   * @returns {string} The home route for the role
   */
  const getRoleHomePage = useCallback((role) => {
    return ROLE_ROUTES[role] || '/';
  }, []);

  /**
   * Check if user has access to a specific route
   * @param {string} pathname - The route pathname
   * @returns {boolean} Whether the user has access
   */
  const hasRouteAccess = useCallback((pathname) => {
    if (!userRole) return false;
    
    for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ACCESS)) {
      if (pathname.startsWith(routePrefix)) {
        return allowedRoles.includes(userRole);
      }
    }
    
    // Default: authenticated users can access other routes
    return isAuthenticated;
  }, [userRole, isAuthenticated]);

  /**
   * Get redirect URL based on user role
   * @returns {string} The redirect URL
   */
  const getRedirectUrl = useCallback(() => {
    return getRoleHomePage(userRole);
  }, [userRole, getRoleHomePage]);

  // Generic login handler (backward compatibility)
  const login = useCallback(async (email, password) => {
    try {
      const response = await apiPost('/api/login', { email, password });
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        if (data.accessToken && typeof window !== 'undefined') {
          localStorage.setItem('edux_access_token', data.accessToken);
        }
        return { success: true, user: data.user, redirectUrl: getRoleHomePage(data.user.role) };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  }, [getRoleHomePage]);

  // User/Student Login
  const userLogin = useCallback(async (email, password) => {
    try {
      const response = await apiPost('/api/auth/user/login', { email, password });
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        if (data.accessToken && typeof window !== 'undefined') {
          localStorage.setItem('edux_access_token', data.accessToken);
        }
        return { success: true, user: data.user, redirectUrl: '/student' };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('User login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  }, []);

  // Instructor Login
  const instructorLogin = useCallback(async (email, password) => {
    try {
      const response = await apiPost('/api/auth/instructor/login', { email, password });
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        if (data.accessToken && typeof window !== 'undefined') {
          localStorage.setItem('edux_access_token', data.accessToken);
        }
        return { success: true, user: data.user, redirectUrl: '/instructor' };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Instructor login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  }, []);

  // Admin Login
  const adminLogin = useCallback(async (email, password) => {
    try {
      const response = await apiPost('/api/auth/admin/login', { email, password });
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        if (data.accessToken && typeof window !== 'undefined') {
          localStorage.setItem('edux_access_token', data.accessToken);
        }
        return { success: true, user: data.user, redirectUrl: '/admin' };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  }, []);

  // Generic signup (backward compatibility)
  const signup = useCallback(async (userData) => {
    try {
      const response = await apiPost('/api/signup', userData);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        if (data.accessToken && typeof window !== 'undefined') {
          localStorage.setItem('edux_access_token', data.accessToken);
        }
        return { success: true, user: data.user, redirectUrl: '/student' };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  }, []);

  // User/Student Signup
  const userSignup = useCallback(async (userData) => {
    try {
      const response = await apiPost('/api/auth/user/signup', userData);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        if (data.accessToken && typeof window !== 'undefined') {
          localStorage.setItem('edux_access_token', data.accessToken);
        }
        return { success: true, user: data.user, redirectUrl: '/student' };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('User signup error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  }, []);

  // Instructor Signup
  const instructorSignup = useCallback(async (userData) => {
    try {
      const response = await apiPost('/api/auth/instructor/signup', userData);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        if (data.accessToken && typeof window !== 'undefined') {
          localStorage.setItem('edux_access_token', data.accessToken);
        }
        return { success: true, user: data.user, redirectUrl: '/instructor' };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Instructor signup error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  }, []);

  // Admin Signup
  const adminSignup = useCallback(async (userData) => {
    try {
      const response = await apiPost('/api/auth/admin/signup', userData);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        if (data.accessToken && typeof window !== 'undefined') {
          localStorage.setItem('edux_access_token', data.accessToken);
        }
        return { success: true, user: data.user, redirectUrl: '/admin' };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Admin signup error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost('/api/logout');
      setUser(null);
      setIsAuthenticated(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('edux_access_token');
        // Clear secure storage as well for backward compatibility
        try {
          const secureLocalStorage = require('react-secure-storage').default;
          secureLocalStorage.clear();
        } catch (e) {
          // Ignore if not available
        }
      }
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'An error occurred during logout' };
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await apiPost('/api/refresh-token');
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        if (data.accessToken && typeof window !== 'undefined') {
          localStorage.setItem('edux_access_token', data.accessToken);
        }
        return { success: true };
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return { success: false };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false };
    }
  }, []);

  const value = {
    user,
    userRole,
    loading,
    isAuthenticated,
    // Legacy/generic methods
    login,
    signup,
    instructorSignup,
    // Role-specific methods
    userLogin,
    userSignup,
    instructorLogin,
    adminLogin,
    adminSignup,
    logout,
    refreshToken,
    checkAuth,
    // Role-based routing helpers
    getRoleHomePage,
    hasRouteAccess,
    getRedirectUrl,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
