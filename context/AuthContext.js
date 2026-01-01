/**
 * Authentication Context Provider
 * Manages user authentication state across the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiPost, apiGet } from '../lib/api';

const AuthContext = createContext(null);

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

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Try to get current user from token
      const response = await apiGet('/api/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        }
      } else {
        // Try to refresh token
        const refreshResponse = await apiPost('/api/refresh-token');
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.success && refreshData.user) {
            setUser(refreshData.user);
            setIsAuthenticated(true);
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    try {
      const response = await apiPost('/api/login', { email, password });
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        // Store token for client-side if needed
        if (data.accessToken && typeof window !== 'undefined') {
          localStorage.setItem('edux_access_token', data.accessToken);
        }
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  }, []);

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
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  }, []);

  const instructorSignup = useCallback(async (userData) => {
    try {
      const response = await apiPost('/api/instructor_signup', userData);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        if (data.accessToken && typeof window !== 'undefined') {
          localStorage.setItem('edux_access_token', data.accessToken);
        }
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message, errors: data.errors };
      }
    } catch (error) {
      console.error('Instructor signup error:', error);
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
    loading,
    isAuthenticated,
    login,
    signup,
    instructorSignup,
    logout,
    refreshToken,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
