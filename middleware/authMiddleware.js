/**
 * Authentication middleware for protecting API routes
 * Verifies JWT tokens and attaches user data to request
 */

import { verifyAccessToken, verifyRefreshToken, generateTokens } from '../lib/auth/jwt';
import { getAccessToken, getTokensFromCookies, setAuthCookies } from '../lib/auth/cookies';

/**
 * Middleware to require authentication
 * Attaches decoded user to req.user if authenticated
 * @param {function} handler - The API route handler
 * @returns {function} Wrapped handler with auth check
 */
export const withAuth = (handler) => {
  return async (req, res) => {
    const accessToken = getAccessToken(req);
    
    if (!accessToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const decoded = verifyAccessToken(accessToken);
    
    if (!decoded) {
      // Try to refresh the token
      const { refreshToken } = getTokensFromCookies(req);
      
      if (refreshToken) {
        const refreshDecoded = verifyRefreshToken(refreshToken);
        
        if (refreshDecoded) {
          // Generate new tokens
          const newTokens = generateTokens({
            u_id: refreshDecoded.u_id,
            email: refreshDecoded.email,
            name: refreshDecoded.name,
            isStudent: refreshDecoded.isStudent,
            isInstructor: refreshDecoded.isInstructor,
          });
          
          setAuthCookies(res, newTokens.accessToken, newTokens.refreshToken);
          
          req.user = verifyAccessToken(newTokens.accessToken);
          return handler(req, res);
        }
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    req.user = decoded;
    return handler(req, res);
  };
};

/**
 * Middleware to optionally check authentication
 * Attaches decoded user to req.user if token present, but doesn't require it
 * @param {function} handler - The API route handler
 * @returns {function} Wrapped handler with optional auth check
 */
export const withOptionalAuth = (handler) => {
  return async (req, res) => {
    const accessToken = getAccessToken(req);
    
    if (accessToken) {
      const decoded = verifyAccessToken(accessToken);
      if (decoded) {
        req.user = decoded;
      }
    }

    return handler(req, res);
  };
};

/**
 * Middleware to require student role
 * @param {function} handler - The API route handler
 * @returns {function} Wrapped handler with student check
 */
export const withStudentAuth = (handler) => {
  return withAuth(async (req, res) => {
    if (!req.user.isStudent && req.user.role !== 'student') {
      return res.status(403).json({ 
        success: false, 
        message: 'Student access required' 
      });
    }
    return handler(req, res);
  });
};

/**
 * Middleware to require instructor role
 * @param {function} handler - The API route handler
 * @returns {function} Wrapped handler with instructor check
 */
export const withInstructorAuth = (handler) => {
  return withAuth(async (req, res) => {
    if (!req.user.isInstructor && req.user.role !== 'instructor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Instructor access required' 
      });
    }
    return handler(req, res);
  });
};

/**
 * Middleware to require admin role
 * @param {function} handler - The API route handler
 * @returns {function} Wrapped handler with admin check
 */
export const withAdminAuth = (handler) => {
  return withAuth(async (req, res) => {
    if (!req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    return handler(req, res);
  });
};

/**
 * Middleware to require specific roles (flexible role check)
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {function} Middleware wrapper
 */
export const withRoleAuth = (allowedRoles) => {
  return (handler) => {
    return withAuth(async (req, res) => {
      const userRole = req.user.role || 
        (req.user.isAdmin ? 'admin' : 
          req.user.isInstructor ? 'instructor' : 
            req.user.isStudent ? 'student' : null);
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
        });
      }
      return handler(req, res);
    });
  };
};

/**
 * Combined middleware for auth and validation
 * @param {object} options - { schema, requireAuth, requireStudent, requireInstructor, requireAdmin }
 * @returns {function} Middleware wrapper
 */
export const withAuthAndValidation = (options = {}) => {
  const { schema, requireAuth = true, requireStudent = false, requireInstructor = false, requireAdmin = false } = options;
  
  return (handler) => {
    return async (req, res) => {
      // Auth check
      if (requireAuth) {
        const accessToken = getAccessToken(req);
        
        if (!accessToken) {
          return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
          });
        }

        const decoded = verifyAccessToken(accessToken);
        
        if (!decoded) {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired token' 
          });
        }

        req.user = decoded;

        // Role checks - check both boolean flags and role string
        if (requireStudent && !decoded.isStudent && decoded.role !== 'student') {
          return res.status(403).json({ 
            success: false, 
            message: 'Student access required' 
          });
        }

        if (requireInstructor && !decoded.isInstructor && decoded.role !== 'instructor') {
          return res.status(403).json({ 
            success: false, 
            message: 'Instructor access required' 
          });
        }

        if (requireAdmin && !decoded.isAdmin && decoded.role !== 'admin') {
          return res.status(403).json({ 
            success: false, 
            message: 'Admin access required' 
          });
        }
      }

      // Validation check
      if (schema && req.method === 'POST') {
        const { validateRequest } = await import('../lib/validation/schemas');
        const validation = validateRequest(schema, req.body);
        
        if (!validation.success) {
          return res.status(400).json({ 
            success: false, 
            message: 'Validation failed', 
            errors: validation.errors 
          });
        }
        
        req.validatedBody = validation.data;
      }

      return handler(req, res);
    };
  };
};

export default {
  withAuth,
  withOptionalAuth,
  withStudentAuth,
  withInstructorAuth,
  withAdminAuth,
  withRoleAuth,
  withAuthAndValidation,
};
