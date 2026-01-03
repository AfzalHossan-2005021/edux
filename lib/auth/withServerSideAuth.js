/**
 * Server-Side Authentication HOC
 * 
 * Use this in getServerSideProps to protect pages and prevent
 * flash of unauthorized content during SSR.
 */

import { verifyAccessToken } from './jwt';

/**
 * Role access configuration
 */
const roleAccess = {
  '/student': ['student', 'admin'],
  '/instructor': ['instructor', 'admin'],
  '/admin': ['admin'],
};

/**
 * Get user role from token payload
 */
function getUserRole(payload) {
  if (!payload) return null;
  if (payload.role) return payload.role;
  if (payload.isAdmin) return 'admin';
  if (payload.isInstructor) return 'instructor';
  if (payload.isStudent) return 'student';
  return null;
}

/**
 * Check if user has access to a specific route
 */
function hasRouteAccess(userRole, pathname) {
  for (const [routePrefix, allowedRoles] of Object.entries(roleAccess)) {
    if (pathname.startsWith(routePrefix)) {
      return allowedRoles.includes(userRole);
    }
  }
  return true;
}

/**
 * Get the redirect URL for a role
 */
function getRoleHomePage(role) {
  const roleRoutes = {
    student: '/student',
    instructor: '/instructor',
    admin: '/admin',
  };
  return roleRoutes[role] || '/';
}

/**
 * Higher-order function for server-side authentication
 * 
 * @param {Function} getServerSidePropsFunc - Optional getServerSideProps function to wrap
 * @param {Object} options - Configuration options
 * @param {string[]} options.allowedRoles - Roles allowed to access this page
 * @param {string} options.redirectTo - Custom redirect URL if unauthorized
 * @returns {Function} getServerSideProps function with auth checks
 * 
 * @example
 * // Basic usage - any authenticated user
 * export const getServerSideProps = withServerSideAuth();
 * 
 * @example
 * // With role restriction
 * export const getServerSideProps = withServerSideAuth(null, { allowedRoles: ['student'] });
 * 
 * @example
 * // With custom getServerSideProps
 * export const getServerSideProps = withServerSideAuth(async (context, user) => {
 *   const data = await fetchData(user.u_id);
 *   return { props: { data } };
 * });
 */
export function withServerSideAuth(getServerSidePropsFunc = null, options = {}) {
  return async (context) => {
    const { req, res, resolvedUrl } = context;
    const { allowedRoles, redirectTo } = options;

    // Get token from cookies
    const token = req.cookies?.edux_access_token;

    if (!token) {
      // No token - redirect to login
      const loginUrl = `/auth?redirect=${encodeURIComponent(resolvedUrl)}`;
      return {
        redirect: {
          destination: redirectTo || loginUrl,
          permanent: false,
        },
      };
    }

    // Verify token
    const payload = verifyAccessToken(token);

    if (!payload) {
      // Invalid token - redirect to login
      const loginUrl = `/auth?redirect=${encodeURIComponent(resolvedUrl)}&expired=true`;
      return {
        redirect: {
          destination: redirectTo || loginUrl,
          permanent: false,
        },
      };
    }

    const userRole = getUserRole(payload);

    if (!userRole) {
      // No role - redirect to login
      return {
        redirect: {
          destination: redirectTo || '/auth',
          permanent: false,
        },
      };
    }

    // Check role-based access
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(userRole)) {
        // User doesn't have required role - redirect to their home
        return {
          redirect: {
            destination: getRoleHomePage(userRole) + '?unauthorized=true',
            permanent: false,
          },
        };
      }
    }

    // Check path-based access
    if (!hasRouteAccess(userRole, resolvedUrl)) {
      return {
        redirect: {
          destination: getRoleHomePage(userRole) + '?unauthorized=true',
          permanent: false,
        },
      };
    }

    // User object to pass to wrapped function and page
    const user = {
      u_id: payload.u_id,
      email: payload.email,
      name: payload.name,
      role: userRole,
      isStudent: userRole === 'student',
      isInstructor: userRole === 'instructor',
      isAdmin: userRole === 'admin',
    };

    // Call wrapped getServerSideProps if provided
    if (getServerSidePropsFunc) {
      try {
        const result = await getServerSidePropsFunc(context, user);
        
        // Merge user into props
        if (result.props) {
          return {
            ...result,
            props: {
              ...result.props,
              serverUser: user,
            },
          };
        }
        
        return result;
      } catch (error) {
        console.error('Error in wrapped getServerSideProps:', error);
        return {
          props: {
            serverUser: user,
            error: 'Failed to load page data',
          },
        };
      }
    }

    // Return user in props
    return {
      props: {
        serverUser: user,
      },
    };
  };
}

/**
 * Convenience functions for specific roles
 */
export const withStudentAuth = (getServerSidePropsFunc = null) =>
  withServerSideAuth(getServerSidePropsFunc, { allowedRoles: ['student', 'admin'] });

export const withInstructorAuth = (getServerSidePropsFunc = null) =>
  withServerSideAuth(getServerSidePropsFunc, { allowedRoles: ['instructor', 'admin'] });

export const withAdminOnlyAuth = (getServerSidePropsFunc = null) =>
  withServerSideAuth(getServerSidePropsFunc, { allowedRoles: ['admin'] });

export default withServerSideAuth;
