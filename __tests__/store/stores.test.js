/**
 * Zustand Store Tests
 */
import { renderHook, act } from '@testing-library/react';
import useUserStore from '../../store/useUserStore';
import useCourseStore from '../../store/useCourseStore';
import useNotificationStore from '../../store/useNotificationStore';
import useWishlistStore from '../../store/useWishlistStore';

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock fetch
global.fetch = jest.fn();

describe('User Store', () => {
  beforeEach(() => {
    useUserStore.getState().logout();
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useUserStore());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should login user', () => {
    const { result } = renderHook(() => useUserStore());
    
    act(() => {
      result.current.login({ U_ID: 1, EMAIL: 'test@example.com', IS_STUDENT: 1 });
    });

    expect(result.current.user).toEqual({ U_ID: 1, EMAIL: 'test@example.com', IS_STUDENT: 1 });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should logout user', () => {
    const { result } = renderHook(() => useUserStore());
    
    act(() => {
      result.current.login({ U_ID: 1, EMAIL: 'test@example.com' });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should update user profile', () => {
    const { result } = renderHook(() => useUserStore());
    
    act(() => {
      result.current.login({ U_ID: 1, EMAIL: 'test@example.com', NAME: 'Test' });
    });

    act(() => {
      result.current.updateProfile({ NAME: 'Updated Name' });
    });

    expect(result.current.user.NAME).toBe('Updated Name');
    expect(result.current.user.EMAIL).toBe('test@example.com');
  });
});

describe('Course Store', () => {
  beforeEach(() => {
    useCourseStore.setState({
      courses: [],
      filteredCourses: [],
      selectedCourse: null,
      isLoading: false,
      error: null,
      filters: { category: null, level: null, priceRange: null, rating: null },
      searchQuery: '',
    });
    global.fetch.mockReset();
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useCourseStore());
    
    expect(result.current.courses).toEqual([]);
    expect(result.current.filteredCourses).toEqual([]);
    expect(result.current.selectedCourse).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should set courses', () => {
    const { result } = renderHook(() => useCourseStore());
    const courses = [
      { C_ID: 1, C_NAME: 'Course 1' },
      { C_ID: 2, C_NAME: 'Course 2' },
    ];

    act(() => {
      result.current.setCourses(courses);
    });

    expect(result.current.courses).toEqual(courses);
    expect(result.current.filteredCourses).toEqual(courses);
  });

  it('should set selected course', () => {
    const { result } = renderHook(() => useCourseStore());
    const course = { C_ID: 1, C_NAME: 'Course 1' };

    act(() => {
      result.current.setSelectedCourse(course);
    });

    expect(result.current.selectedCourse).toEqual(course);
  });

  it('should set search query and filter', () => {
    const { result } = renderHook(() => useCourseStore());
    const courses = [
      { C_ID: 1, C_NAME: 'React Course', CATEGORY: 'Web' },
      { C_ID: 2, C_NAME: 'Python Course', CATEGORY: 'Programming' },
    ];

    act(() => {
      result.current.setCourses(courses);
    });

    act(() => {
      result.current.setSearchQuery('react');
    });

    expect(result.current.searchQuery).toBe('react');
    expect(result.current.filteredCourses).toHaveLength(1);
    expect(result.current.filteredCourses[0].C_NAME).toBe('React Course');
  });
});

describe('Notification Store', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
    });
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useNotificationStore());
    
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should add notification', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.addNotification({
        id: '1',
        title: 'Test',
        message: 'Test message',
        type: 'info',
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(1);
  });

  it('should mark notification as read', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.addNotification({
        id: '1',
        title: 'Test',
        message: 'Test message',
        type: 'info',
      });
    });

    act(() => {
      result.current.markAsRead('1');
    });

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should remove notification', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.addNotification({
        id: '1',
        title: 'Test',
        message: 'Test message',
        type: 'info',
      });
    });

    act(() => {
      result.current.removeNotification('1');
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('should clear all notifications', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.addNotification({ id: '1', title: 'Test 1', message: 'Message 1', type: 'info' });
      result.current.addNotification({ id: '2', title: 'Test 2', message: 'Message 2', type: 'warning' });
    });

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.unreadCount).toBe(0);
  });
});

describe('Wishlist Store', () => {
  beforeEach(() => {
    useWishlistStore.getState().clearWishlist();
    mockLocalStorage.clear();
    global.fetch.mockReset();
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useWishlistStore());
    
    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should add to wishlist', () => {
    const { result } = renderHook(() => useWishlistStore());
    const course = { C_ID: 1, C_NAME: 'Course 1' };

    act(() => {
      result.current.addToWishlist(course);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].C_ID).toBe(1);
  });

  it('should not add duplicate to wishlist', () => {
    const { result } = renderHook(() => useWishlistStore());
    const course = { C_ID: 1, C_NAME: 'Course 1' };

    act(() => {
      result.current.addToWishlist(course);
      result.current.addToWishlist(course);
    });

    expect(result.current.items).toHaveLength(1);
  });

  it('should remove from wishlist', () => {
    const { result } = renderHook(() => useWishlistStore());
    const course = { C_ID: 1, C_NAME: 'Course 1' };

    act(() => {
      result.current.addToWishlist(course);
    });

    act(() => {
      result.current.removeFromWishlist(1);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('should check if course is in wishlist', () => {
    const { result } = renderHook(() => useWishlistStore());
    const course = { C_ID: 1, C_NAME: 'Course 1' };

    expect(result.current.isInWishlist(1)).toBe(false);

    act(() => {
      result.current.addToWishlist(course);
    });

    expect(result.current.isInWishlist(1)).toBe(true);
  });
});
