/**
 * Next.js Middleware for Role-Based Route Protection
 * 
 * Route Access Rules:
 * - '/' and '/auth/*': Public (accessible without authentication)
 * - '/student/*': Students only
 * - '/instructor/*': Instructors only  
 * - '/admin/*': Admins only
 * - All other routes: Require authentication (any role)
 */

import { NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth',
  '/auth/user/login',
  '/auth/user/signup',
  '/auth/instructor/login',
  '/auth/instructor/signup',
  '/auth/admin/login',
  '/auth/admin/signup',
  '/offline',
  '/api-docs',
];

// Routes that are always accessible (static files, API auth routes)
const alwaysAccessible = [
  '/_next',
  '/api',  // All API routes handle their own auth
  '/favicon.ico',
  '/icons',
  '/images',
  '/locales',
  '/manifest.json',
  '/sw.js',
  '/workbox',
];

// Role-based route mapping
const roleRoutes = {
  student: '/student',
  instructor: '/instructor',
  admin: '/admin',
};

// Role hierarchy for access control
const roleAccess = {
  '/student': ['student', 'admin'],
  '/instructor': ['instructor', 'admin'],
  '/admin': ['admin'],
};

/**
 * Parse JWT token without verification (for middleware)
 * Note: Full verification happens on API routes
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * Check if a path matches any of the given prefixes
 */
function matchesPath(pathname, paths) {
  return paths.some(path => {
    // Exact match
    if (pathname === path) return true;
    // Prefix match (e.g., /api matches /api/me, /api/auth/login)
    if (pathname.startsWith(path + '/')) return true;
    // Query string match
    if (pathname.startsWith(path + '?')) return true;
    return false;
  });
}

/**
 * Get user role from token
 */
function getUserRole(payload) {
  if (!payload) return null;
  
  // Check explicit role field first
  if (payload.role) return payload.role;
  
  // Fall back to boolean flags
  if (payload.isAdmin) return 'admin';
  if (payload.isInstructor) return 'instructor';
  if (payload.isStudent) return 'student';
  
  return null;
}

/**
 * Check if user has access to a specific route
 */
function hasRouteAccess(userRole, pathname) {
  // Check role-specific routes
  for (const [routePrefix, allowedRoles] of Object.entries(roleAccess)) {
    if (pathname.startsWith(routePrefix)) {
      return allowedRoles.includes(userRole);
    }
  }
  
  // Default: authenticated users can access other routes
  return true;
}

/**
 * Get the redirect URL for a role after login
 */
function getRoleHomePage(role) {
  return roleRoutes[role] || '/';
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Always allow static files and system routes
  if (matchesPath(pathname, alwaysAccessible)) {
    return NextResponse.next();
  }
  
  // Allow public routes without authentication
  if (publicRoutes.includes(pathname) || pathname.startsWith('/auth/')) {
    // Get token to check if user is already logged in
    const token = request.cookies.get('edux_access_token')?.value;
    
    if (token) {
      const payload = parseJwt(token);
      const role = getUserRole(payload);
      
      // If user is already logged in and accessing login/signup pages,
      // redirect them to their dashboard
      if (role && (pathname.includes('/login') || pathname.includes('/signup') || pathname === '/auth')) {
        const homeUrl = new URL(getRoleHomePage(role), request.url);
        return NextResponse.redirect(homeUrl);
      }
    }
    
    return NextResponse.next();
  }
  
  // For protected routes, check authentication
  const token = request.cookies.get('edux_access_token')?.value;
  
  if (!token) {
    // No token - redirect to auth page
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Parse the token
  const payload = parseJwt(token);
  
  if (!payload) {
    // Invalid token - redirect to auth page
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check token expiration
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    // Token expired - redirect to auth page
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('expired', 'true');
    return NextResponse.redirect(loginUrl);
  }
  
  const userRole = getUserRole(payload);
  
  if (!userRole) {
    // No role found - redirect to auth page
    const loginUrl = new URL('/auth', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check if user has access to the requested route
  if (!hasRouteAccess(userRole, pathname)) {
    // User doesn't have access - redirect to their home page
    const homeUrl = new URL(getRoleHomePage(userRole), request.url);
    homeUrl.searchParams.set('unauthorized', 'true');
    return NextResponse.redirect(homeUrl);
  }
  
  // Handle legacy routes - redirect to new role-based routes
  if (pathname === '/user' || pathname.startsWith('/user/')) {
    // Redirect old /user routes to /student
    const newPath = pathname.replace('/user', '/student');
    return NextResponse.redirect(new URL(newPath, request.url));
  }
  
  // Add user info to headers for downstream use
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.u_id?.toString() || '');
  response.headers.set('x-user-role', userRole);
  response.headers.set('x-user-email', payload.email || '');
  
  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (icons, images, locales, etc.)
     * - static assets (.png, .jpg, .svg, .json in public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|icons/|images/|locales/|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.json$).*)',
  ],
};
