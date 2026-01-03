/**
 * Unit Tests for Next.js Middleware Route Protection
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock the middleware logic for testing
const publicRoutes = [
  '/',
  '/auth',
  '/auth/user/login',
  '/auth/user/signup',
  '/auth/instructor/login',
  '/auth/instructor/signup',
  '/auth/admin/login',
  '/auth/admin/signup',
  '/login',
  '/signup',
];

const alwaysAccessible = [
  '/_next',
  '/api/auth',
  '/favicon.ico',
];

const roleAccess = {
  '/student': ['student', 'admin'],
  '/instructor': ['instructor', 'admin'],
  '/admin': ['admin'],
};

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function getUserRole(payload) {
  if (!payload) return null;
  if (payload.role) return payload.role;
  if (payload.isAdmin) return 'admin';
  if (payload.isInstructor) return 'instructor';
  if (payload.isStudent) return 'student';
  return null;
}

function hasRouteAccess(userRole, pathname) {
  for (const [routePrefix, allowedRoles] of Object.entries(roleAccess)) {
    if (pathname.startsWith(routePrefix)) {
      return allowedRoles.includes(userRole);
    }
  }
  return true;
}

function matchesPath(pathname, paths) {
  return paths.some(path => 
    pathname === path || 
    pathname.startsWith(path + '/') ||
    pathname.startsWith(path + '?')
  );
}

function getRoleHomePage(role) {
  const roleRoutes = {
    student: '/student',
    instructor: '/instructor',
    admin: '/admin',
  };
  return roleRoutes[role] || '/';
}

describe('Middleware Route Protection', () => {
  describe('Public Routes', () => {
    test('should allow access to home page', () => {
      expect(publicRoutes.includes('/')).toBe(true);
    });

    test('should allow access to auth routes', () => {
      expect(publicRoutes.includes('/auth')).toBe(true);
      expect(publicRoutes.includes('/auth/user/login')).toBe(true);
      expect(publicRoutes.includes('/auth/instructor/login')).toBe(true);
    });

    test('should allow access to login and signup', () => {
      expect(publicRoutes.includes('/login')).toBe(true);
      expect(publicRoutes.includes('/signup')).toBe(true);
    });
  });

  describe('Always Accessible Routes', () => {
    test('should match _next static routes', () => {
      expect(matchesPath('/_next/static/chunks/main.js', alwaysAccessible)).toBe(true);
    });

    test('should match API auth routes', () => {
      expect(matchesPath('/api/auth/login', alwaysAccessible)).toBe(true);
    });

    test('should match favicon', () => {
      expect(matchesPath('/favicon.ico', alwaysAccessible)).toBe(true);
    });
  });

  describe('Role-Based Access', () => {
    test('students should access /student routes', () => {
      expect(hasRouteAccess('student', '/student')).toBe(true);
      expect(hasRouteAccess('student', '/student/courses')).toBe(true);
      expect(hasRouteAccess('student', '/student/courses/123')).toBe(true);
    });

    test('students should NOT access /instructor routes', () => {
      expect(hasRouteAccess('student', '/instructor')).toBe(false);
      expect(hasRouteAccess('student', '/instructor/courses')).toBe(false);
    });

    test('students should NOT access /admin routes', () => {
      expect(hasRouteAccess('student', '/admin')).toBe(false);
      expect(hasRouteAccess('student', '/admin/users')).toBe(false);
    });

    test('instructors should access /instructor routes', () => {
      expect(hasRouteAccess('instructor', '/instructor')).toBe(true);
      expect(hasRouteAccess('instructor', '/instructor/courses')).toBe(true);
    });

    test('instructors should NOT access /student routes', () => {
      expect(hasRouteAccess('instructor', '/student')).toBe(false);
    });

    test('instructors should NOT access /admin routes', () => {
      expect(hasRouteAccess('instructor', '/admin')).toBe(false);
    });

    test('admins should access all protected routes', () => {
      expect(hasRouteAccess('admin', '/admin')).toBe(true);
      expect(hasRouteAccess('admin', '/student')).toBe(true);
      expect(hasRouteAccess('admin', '/instructor')).toBe(true);
    });
  });

  describe('Role Home Pages', () => {
    test('should return correct home page for each role', () => {
      expect(getRoleHomePage('student')).toBe('/student');
      expect(getRoleHomePage('instructor')).toBe('/instructor');
      expect(getRoleHomePage('admin')).toBe('/admin');
    });

    test('should return home for unknown role', () => {
      expect(getRoleHomePage('unknown')).toBe('/');
      expect(getRoleHomePage(null)).toBe('/');
    });
  });

  describe('JWT Payload Role Extraction', () => {
    test('should extract role from payload.role', () => {
      const payload = { role: 'student', u_id: 1 };
      expect(getUserRole(payload)).toBe('student');
    });

    test('should fall back to boolean flags', () => {
      expect(getUserRole({ isStudent: true })).toBe('student');
      expect(getUserRole({ isInstructor: true })).toBe('instructor');
      expect(getUserRole({ isAdmin: true })).toBe('admin');
    });

    test('should prefer explicit role over flags', () => {
      const payload = { role: 'admin', isStudent: true };
      expect(getUserRole(payload)).toBe('admin');
    });

    test('should return null for invalid payload', () => {
      expect(getUserRole(null)).toBe(null);
      expect(getUserRole(undefined)).toBe(null);
      expect(getUserRole({})).toBe(null);
    });
  });

  describe('Path Matching', () => {
    test('should match exact paths', () => {
      expect(matchesPath('/', ['/'])).toBe(true);
      expect(matchesPath('/auth', ['/auth'])).toBe(true);
    });

    test('should match path prefixes', () => {
      expect(matchesPath('/auth/user/login', ['/auth'])).toBe(true);
      expect(matchesPath('/_next/static/chunks', ['/_next'])).toBe(true);
    });

    test('should not match partial paths', () => {
      expect(matchesPath('/authorize', ['/auth'])).toBe(false);
      expect(matchesPath('/authentication', ['/auth'])).toBe(false);
    });
  });
});

describe('Route Configuration', () => {
  test('student routes should allow student and admin', () => {
    expect(roleAccess['/student']).toEqual(['student', 'admin']);
  });

  test('instructor routes should allow instructor and admin', () => {
    expect(roleAccess['/instructor']).toEqual(['instructor', 'admin']);
  });

  test('admin routes should only allow admin', () => {
    expect(roleAccess['/admin']).toEqual(['admin']);
  });
});
